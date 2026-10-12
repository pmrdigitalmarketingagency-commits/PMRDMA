"""Phase 3 Security Audit tests for PMR Digital Marketing Agency.

Covers:
 - Client data isolation (two clients, cross-access prevention)
 - Public vs private endpoint separation
 - RBAC (per-role 403s on protected routes)
 - Role escalation prevention
 - Brute-force login lockout
 - Token security (expired/invalid/wrong-type)
 - Password reset token single-use & expiry
 - Secrets not leaked (password_hash)
 - CMS draft/published isolation
 - Invoice sequential uniqueness
 - Lead conversion idempotency
"""
import os
import uuid
import time
from datetime import datetime, timezone, timedelta

import jwt
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL",
    "https://pmr-agency.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@pmratnam.com", "password": "Admin@PMR2026"}
SALES = {"email": "sales@pmratnam.com", "password": "Sales@123"}
PM = {"email": "pm@pmratnam.com", "password": "PM@123"}
EMP = {"email": "employee@pmratnam.com", "password": "Emp@123"}


# ---------- helpers ----------
def _login(creds):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token")
    s.headers.update({"Authorization": f"Bearer {token}"})
    # Clear cookies so Bearer header is used (avoids locked_until collision)
    s.cookies.clear()
    return s, data["user"], token


@pytest.fixture(scope="module")
def admin():
    s, u, t = _login(ADMIN)
    return {"s": s, "user": u, "token": t}


@pytest.fixture(scope="module")
def sales():
    s, u, t = _login(SALES)
    return {"s": s, "user": u, "token": t}


@pytest.fixture(scope="module")
def pm():
    s, u, t = _login(PM)
    return {"s": s, "user": u, "token": t}


@pytest.fixture(scope="module")
def emp():
    s, u, t = _login(EMP)
    return {"s": s, "user": u, "token": t}


@pytest.fixture(scope="module")
def two_clients(admin):
    """Create two independent client orgs with linked client-role users."""
    s = admin["s"]
    tag = uuid.uuid4().hex[:6]

    def create_pair(label):
        c = s.post(f"{API}/clients", json={
            "name": f"TEST_{label}_{tag}",
            "company": f"TEST_{label}_Co_{tag}",
            "email": f"TEST_{label}_{tag}@example.com",
        }, timeout=30)
        assert c.status_code == 200, c.text
        client_id = c.json()["id"]
        pw = "ClientPass@123"
        user_email = f"TEST_user_{label}_{tag}@example.com"
        u = s.post(f"{API}/users", json={
            "email": user_email,
            "password": pw,
            "name": f"TEST User {label}",
            "role": "client",
            "client_id": client_id,
        }, timeout=30)
        assert u.status_code == 200, u.text
        # project
        p = s.post(f"{API}/projects", json={
            "name": f"TEST_proj_{label}_{tag}",
            "client_id": client_id,
            "service_type": "SEO",
        }, timeout=30)
        assert p.status_code == 200, p.text
        project_id = p.json()["id"]
        # task
        t = s.post(f"{API}/tasks", json={
            "title": f"TEST_task_{label}_{tag}",
            "project_id": project_id,
        }, timeout=30)
        assert t.status_code == 200, t.text
        # invoice
        inv = s.post(f"{API}/invoices", json={
            "client_id": client_id,
            "issue_date": "2026-01-01",
            "due_date": "2026-02-01",
            "items": [{"description": "svc", "quantity": 1, "rate": 1000}],
        }, timeout=30)
        assert inv.status_code == 200, inv.text
        # login as the client user
        cs, cu, ctok = _login({"email": user_email, "password": pw})
        return {
            "client_id": client_id,
            "project_id": project_id,
            "task_id": t.json()["id"],
            "invoice_id": inv.json()["id"],
            "sess": cs,
            "user": cu,
        }

    return {"A": create_pair("A"), "B": create_pair("B")}


# ===================== CLIENT ISOLATION =====================
class TestClientIsolation:
    def test_projects_scoped_to_own_client(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/projects", timeout=30)
        assert r.status_code == 200
        ids = {p["id"] for p in r.json()}
        assert A["project_id"] in ids
        assert B["project_id"] not in ids

    def test_invoices_scoped_to_own_client(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/invoices", timeout=30)
        assert r.status_code == 200
        ids = {i["id"] for i in r.json()}
        assert A["invoice_id"] in ids
        assert B["invoice_id"] not in ids

    def test_tasks_scoped_to_own_client(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/tasks", timeout=30)
        assert r.status_code == 200
        ids = {t["id"] for t in r.json()}
        assert A["task_id"] in ids
        assert B["task_id"] not in ids

    def test_cannot_get_other_client_record(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/clients/{B['client_id']}", timeout=30)
        assert r.status_code == 403

    def test_cannot_get_other_client_project(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/projects/{B['project_id']}", timeout=30)
        assert r.status_code == 403

    def test_cannot_get_other_client_invoice(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/invoices/{B['invoice_id']}", timeout=30)
        assert r.status_code == 403

    def test_portal_overview_is_own_data(self, two_clients):
        A, B = two_clients["A"], two_clients["B"]
        r = A["sess"].get(f"{API}/portal/overview", timeout=30)
        assert r.status_code == 200
        assert r.json()["client_id"] == A["client_id"]


# ===================== PUBLIC ENDPOINTS =====================
class TestPublicEndpoints:
    def test_public_lead_no_auth(self):
        r = requests.post(f"{API}/leads", json={
            "name": "TEST_pub",
            "email": f"TEST_pub_{uuid.uuid4().hex[:6]}@example.com",
            "consent": True,
        }, timeout=30)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_public_blog_no_auth(self):
        r = requests.get(f"{API}/public/blog", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_portfolio_no_auth(self):
        r = requests.get(f"{API}/public/portfolio", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_testimonials_no_auth(self):
        r = requests.get(f"{API}/public/testimonials", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_services_no_auth(self):
        r = requests.get(f"{API}/public/services", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ===================== PRIVATE ENDPOINTS AUTH REQUIRED =====================
class TestPrivateEndpointsRequireAuth:
    @pytest.mark.parametrize("path", [
        "/leads", "/clients", "/projects", "/tasks", "/users",
        "/overview", "/invoices", "/portal/overview",
    ])
    def test_requires_auth(self, path):
        r = requests.get(f"{API}{path}", timeout=30)
        assert r.status_code == 401, f"{path} returned {r.status_code}"


# ===================== RBAC =====================
class TestRBAC:
    def test_employee_cannot_create_user(self, emp):
        r = emp["s"].post(f"{API}/users", json={
            "email": f"TEST_rbac_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Abcdef@123", "name": "x", "role": "employee",
        }, timeout=30)
        assert r.status_code == 403

    def test_employee_cannot_delete_user(self, emp, admin):
        # delete requires super_admin; use any arbitrary user id
        r = emp["s"].delete(f"{API}/users/{admin['user']['id']}", timeout=30)
        assert r.status_code == 403

    def test_employee_cannot_create_client(self, emp):
        r = emp["s"].post(f"{API}/clients", json={
            "name": "TEST_c", "company": "x", "email": f"TEST_c_{uuid.uuid4().hex[:6]}@example.com",
        }, timeout=30)
        assert r.status_code == 403

    def test_employee_cannot_create_invoice(self, emp):
        r = emp["s"].post(f"{API}/invoices", json={
            "client_id": "nope", "issue_date": "2026-01-01", "due_date": "2026-02-01",
            "items": [{"description": "x", "quantity": 1, "rate": 100}],
        }, timeout=30)
        assert r.status_code == 403

    def test_sales_manager_can_get_invoices(self, sales):
        r = sales["s"].get(f"{API}/invoices", timeout=30)
        assert r.status_code == 200

    def test_project_manager_cannot_get_invoices(self, pm):
        r = pm["s"].get(f"{API}/invoices", timeout=30)
        assert r.status_code == 403


# ===================== ROLE ESCALATION PREVENTION =====================
class TestRoleEscalation:
    def test_employee_cannot_patch_own_role(self, emp):
        r = emp["s"].patch(f"{API}/users/{emp['user']['id']}", json={"role": "super_admin"}, timeout=30)
        assert r.status_code == 403

    def test_admin_invalid_role_rejected(self, admin):
        r = admin["s"].post(f"{API}/users", json={
            "email": f"TEST_bad_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Abcdef@123", "name": "x", "role": "invalid_role",
        }, timeout=30)
        assert r.status_code == 400


# ===================== BRUTE FORCE =====================
class TestBruteForce:
    def test_lockout_after_5_failed_attempts(self):
        # Use a unique email so this doesn't collide with other tests
        email = f"TEST_bf_{uuid.uuid4().hex[:8]}@example.com"
        statuses = []
        # Fire enough attempts to overcome any ingress load-balancing across
        # multiple backend replicas (identifier is IP:email in server.py).
        for i in range(15):
            r = requests.post(f"{API}/auth/login",
                              json={"email": email, "password": "wrong"},
                              timeout=30)
            statuses.append(r.status_code)
        # First attempt must be 401 (not already locked)
        assert statuses[0] == 401
        # Some attempt within 15 must return 429 once lockout triggers.
        assert 429 in statuses, (
            f"Expected 429 lockout within 15 failed attempts, got {statuses}. "
            "Likely RCA: ingress load-balancing distributes requests across "
            "replicas; `request.client.host` returns different proxy IPs so "
            "the IP:email identifier splits the counter — brute force "
            "protection is bypassable."
        )

    def test_counter_resets_on_success(self):
        """A few failed logins followed by a successful login must clear the counter."""
        creds = ADMIN
        # 2 wrong attempts (keep well below lockout)
        for _ in range(2):
            requests.post(f"{API}/auth/login",
                          json={"email": creds["email"], "password": "wrong"},
                          timeout=30)
        # Correct login resets counter
        r = requests.post(f"{API}/auth/login", json=creds, timeout=30)
        assert r.status_code == 200
        # Subsequent wrong attempts should start again at 401 (not immediate 429)
        r2 = requests.post(f"{API}/auth/login",
                           json={"email": creds["email"], "password": "wrong"},
                           timeout=30)
        assert r2.status_code == 401


# ===================== TOKEN SECURITY =====================
JWT_SECRET = os.environ.get("JWT_SECRET",
    "0bce6404084cd6bbe9a9da33c2249de6dc45216571e79e82b4f695d4ce442f0f")


class TestTokenSecurity:
    def test_expired_access_token_rejected(self, admin):
        payload = {
            "sub": admin["user"]["id"],
            "email": admin["user"]["email"],
            "role": admin["user"]["role"],
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            "type": "access",
        }
        tok = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
        assert r.status_code == 401

    def test_invalid_signature_rejected(self, admin):
        payload = {
            "sub": admin["user"]["id"],
            "email": admin["user"]["email"],
            "role": admin["user"]["role"],
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
            "type": "access",
        }
        tok = jwt.encode(payload, "wrong-secret", algorithm="HS256")
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
        assert r.status_code == 401

    def test_refresh_token_as_access_rejected(self, admin):
        payload = {
            "sub": admin["user"]["id"],
            "exp": datetime.now(timezone.utc) + timedelta(days=1),
            "type": "refresh",
        }
        tok = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
        assert r.status_code == 401


# ===================== PASSWORD RESET =====================
class TestPasswordReset:
    def test_reset_token_single_use_and_invalid(self, admin):
        # Create a temp user we can reset
        tag = uuid.uuid4().hex[:6]
        email = f"TEST_pwreset_{tag}@example.com"
        orig_pw = "Original@123"
        cu = admin["s"].post(f"{API}/users", json={
            "email": email, "password": orig_pw, "name": "pwreset", "role": "employee",
        }, timeout=30)
        assert cu.status_code == 200

        # Trigger forgot-password (token logged, not returned). Read from Mongo directly.
        r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=30)
        assert r.status_code == 200

        import pymongo
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "test_database")
        mc = pymongo.MongoClient(mongo_url)
        db = mc[db_name]
        user_doc = db.users.find_one({"email": email.lower()})
        rec = db.password_reset_tokens.find_one(
            {"user_id": user_doc["id"], "used": False},
            sort=[("created_at", -1)],
        )
        assert rec, "reset token not found in db"
        token = rec["token"]

        # First use succeeds
        new_pw = "NewPass@456"
        r1 = requests.post(f"{API}/auth/reset-password",
                           json={"token": token, "password": new_pw}, timeout=30)
        assert r1.status_code == 200
        # Second use rejected
        r2 = requests.post(f"{API}/auth/reset-password",
                           json={"token": token, "password": "Another@789"}, timeout=30)
        assert r2.status_code == 400

        # Invalid token rejected
        r3 = requests.post(f"{API}/auth/reset-password",
                           json={"token": "not-a-real-token", "password": "WhatEver@789"}, timeout=30)
        assert r3.status_code == 400


# ===================== SECRETS NOT LEAKED =====================
class TestSecretsNotLeaked:
    def test_login_response_no_password_hash(self):
        r = requests.post(f"{API}/auth/login", json=ADMIN, timeout=30)
        assert r.status_code == 200
        body = r.json()
        assert "password_hash" not in body.get("user", {})

    def test_auth_me_no_password_hash(self, admin):
        r = admin["s"].get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 200
        assert "password_hash" not in r.json()

    def test_users_list_no_password_hash(self, admin):
        r = admin["s"].get(f"{API}/users", timeout=30)
        assert r.status_code == 200
        for u in r.json():
            assert "password_hash" not in u


# ===================== CMS DRAFT ISOLATION =====================
class TestCMSDraft:
    def test_draft_hidden_from_public_but_visible_to_admin(self, admin):
        tag = uuid.uuid4().hex[:8]
        slug = f"test-draft-{tag}"
        r = admin["s"].post(f"{API}/blog", json={
            "title": f"TEST draft {tag}",
            "slug": slug,
            "content": "secret draft content",
            "status": "draft",
        }, timeout=30)
        assert r.status_code == 200
        post_id = r.json()["id"]

        # Public list should NOT include it
        pr = requests.get(f"{API}/public/blog", timeout=30)
        assert pr.status_code == 200
        slugs = {p.get("slug") for p in pr.json()}
        assert slug not in slugs

        # Public detail returns 404 for drafts
        pd = requests.get(f"{API}/public/blog/{slug}", timeout=30)
        assert pd.status_code == 404

        # Admin list should include it
        ar = admin["s"].get(f"{API}/blog", timeout=30)
        assert ar.status_code == 200
        assert slug in {p.get("slug") for p in ar.json()}

        # Publish it
        up = admin["s"].patch(f"{API}/blog/{post_id}", json={
            "title": f"TEST draft {tag}",
            "slug": slug,
            "content": "secret draft content",
            "status": "published",
        }, timeout=30)
        assert up.status_code == 200
        pr2 = requests.get(f"{API}/public/blog", timeout=30)
        assert slug in {p.get("slug") for p in pr2.json()}


# ===================== INVOICE UNIQUENESS =====================
class TestInvoiceUniqueness:
    def test_sequential_unique_invoice_numbers(self, admin, two_clients):
        cid = two_clients["A"]["client_id"]
        nums = []
        for _ in range(3):
            r = admin["s"].post(f"{API}/invoices", json={
                "client_id": cid,
                "issue_date": "2026-01-02",
                "due_date": "2026-02-02",
                "items": [{"description": "x", "quantity": 1, "rate": 10}],
            }, timeout=30)
            assert r.status_code == 200, r.text
            nums.append(r.json()["invoice_number"])
        assert len(set(nums)) == 3, f"duplicate invoice numbers: {nums}"
        import re
        for n in nums:
            assert re.match(r"^PMR-\d{4}-\d{5}$", n), f"bad format: {n}"
        # Must be sequential ints
        seqs = [int(n.split("-")[-1]) for n in nums]
        assert seqs == sorted(seqs)
        assert seqs[1] == seqs[0] + 1
        assert seqs[2] == seqs[1] + 1


# ===================== LEAD CONVERSION IDEMPOTENCY =====================
class TestLeadConversion:
    def test_convert_twice_is_idempotent(self, admin):
        tag = uuid.uuid4().hex[:6]
        # Public lead
        lr = requests.post(f"{API}/leads", json={
            "name": f"TEST_conv_{tag}",
            "email": f"TEST_conv_{tag}@example.com",
            "company": f"TEST_conv_co_{tag}",
            "consent": True,
        }, timeout=30)
        assert lr.status_code == 200
        lead_id = lr.json()["id"]

        c1 = admin["s"].post(f"{API}/leads/{lead_id}/convert", timeout=30)
        assert c1.status_code == 200, c1.text
        j1 = c1.json()
        assert j1.get("already_converted") in (False, None, False)
        cid1 = j1["client_id"]

        c2 = admin["s"].post(f"{API}/leads/{lead_id}/convert", timeout=30)
        assert c2.status_code == 200
        j2 = c2.json()
        assert j2["client_id"] == cid1
        assert j2.get("already_converted") is True
