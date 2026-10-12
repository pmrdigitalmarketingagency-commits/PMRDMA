"""PMR Digital Marketing Agency - Backend API tests."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pmr-agency.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@pmratnam.com", "password": "Admin@PMR2026"}
SALES = {"email": "sales@pmratnam.com", "password": "Sales@123"}
PM = {"email": "pm@pmratnam.com", "password": "PM@123"}
EMP = {"email": "employee@pmratnam.com", "password": "Emp@123"}
CLIENT = {"email": "client@pmratnam.com", "password": "Client@123"}


def _login(creds):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"login failed {creds['email']}: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token")
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s, data["user"]


@pytest.fixture(scope="session")
def admin_sess():
    return _login(ADMIN)


@pytest.fixture(scope="session")
def sales_sess():
    return _login(SALES)


@pytest.fixture(scope="session")
def client_sess():
    return _login(CLIENT)


@pytest.fixture(scope="session")
def pm_sess():
    return _login(PM)


# ---------- Root/health ----------
def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ---------- Public lead submission ----------
def test_public_lead_submit():
    payload = {
        "name": "TEST Lead",
        "email": f"TEST_lead_{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+911234567890",
        "company": "Acme",
        "services": ["SEO"],
        "message": "Interested",
        "consent": True,
    }
    r = requests.post(f"{API}/leads", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert "id" in data


# ---------- Auth ----------
def test_admin_login_and_me(admin_sess):
    s, u = admin_sess
    assert u["role"] == "super_admin"
    r = s.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN["email"]


def test_me_requires_auth():
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


def test_logout_clears_cookies():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN, timeout=15)
    assert r.status_code == 200
    r2 = s.post(f"{API}/auth/logout", timeout=15)
    assert r2.status_code == 200
    assert r2.json().get("ok") is True


def test_brute_force_lockout():
    bogus_email = f"TEST_bf_{uuid.uuid4().hex[:6]}@example.com"
    last = None
    for _ in range(7):
        last = requests.post(f"{API}/auth/login",
                             json={"email": bogus_email, "password": "wrongpass"}, timeout=15)
    # After >=5 failed attempts, lockout
    assert last is not None
    assert last.status_code in (401, 429)
    # Try one more to verify 429
    r = requests.post(f"{API}/auth/login",
                      json={"email": bogus_email, "password": "wrongpass"}, timeout=15)
    assert r.status_code == 429, f"expected 429 lockout, got {r.status_code}: {r.text}"


# ---------- Leads RBAC & CRUD ----------
def test_leads_list_requires_auth():
    r = requests.get(f"{API}/leads", timeout=15)
    assert r.status_code == 401


def test_leads_client_forbidden(client_sess):
    s, _ = client_sess
    r = s.get(f"{API}/leads", timeout=15)
    assert r.status_code == 403


def test_leads_list_as_sales(sales_sess):
    s, _ = sales_sess
    r = s.get(f"{API}/leads", timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_lead_stage_update_and_invalid(sales_sess):
    # create via public endpoint
    email = f"TEST_stage_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/leads", json={"name": "T", "email": email, "consent": True}, timeout=15)
    lead_id = r.json()["id"]

    s, _ = sales_sess
    # valid stage
    r = s.patch(f"{API}/leads/{lead_id}", json={"stage": "qualified"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["stage"] == "qualified"
    # invalid stage
    r = s.patch(f"{API}/leads/{lead_id}", json={"stage": "bogus_stage"}, timeout=15)
    assert r.status_code == 400


def test_lead_convert_idempotent(sales_sess):
    email = f"TEST_conv_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/leads", json={"name": "ConvTest", "email": email,
                                            "company": "ConvCo", "consent": True}, timeout=15)
    lead_id = r.json()["id"]
    s, _ = sales_sess
    r1 = s.post(f"{API}/leads/{lead_id}/convert", timeout=15)
    assert r1.status_code == 200
    cid1 = r1.json()["client_id"]
    assert r1.json()["already_converted"] is False

    r2 = s.post(f"{API}/leads/{lead_id}/convert", timeout=15)
    assert r2.status_code == 200
    cid2 = r2.json()["client_id"]
    assert cid1 == cid2
    assert r2.json()["already_converted"] is True

    # Verify lead marked won
    r3 = s.get(f"{API}/leads/{lead_id}", timeout=15)
    assert r3.status_code == 200
    assert r3.json()["lead"]["stage"] == "won"


# ---------- Clients ----------
def test_clients_create_and_list(admin_sess):
    s, _ = admin_sess
    payload = {
        "name": "TEST Client",
        "company": f"TESTCo_{uuid.uuid4().hex[:5]}",
        "email": f"TEST_client_{uuid.uuid4().hex[:6]}@example.com",
    }
    r = s.post(f"{API}/clients", json=payload, timeout=15)
    assert r.status_code == 200
    created = r.json()
    assert created["company"] == payload["company"]
    assert "id" in created

    r2 = s.get(f"{API}/clients", timeout=15)
    assert r2.status_code == 200
    ids = [c["id"] for c in r2.json()]
    assert created["id"] in ids


def test_client_role_sees_only_own(client_sess):
    s, u = client_sess
    r = s.get(f"{API}/clients", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # should only see their own client record
    assert len(data) <= 1
    if data:
        assert data[0]["id"] == u.get("client_id")


# ---------- Projects ----------
@pytest.fixture(scope="session")
def demo_client_id(admin_sess):
    s, _ = admin_sess
    r = s.get(f"{API}/clients", timeout=15)
    for c in r.json():
        if c.get("email") == "client@pmratnam.com":
            return c["id"]
    pytest.skip("Demo client not seeded")


def test_project_create_planning(admin_sess, demo_client_id):
    s, _ = admin_sess
    payload = {"name": f"TEST Project {uuid.uuid4().hex[:5]}",
               "client_id": demo_client_id, "service_type": "SEO"}
    r = s.post(f"{API}/projects", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    proj = r.json()
    assert proj["status"] == "planning"
    assert proj["progress"] == 0
    return proj


def test_project_client_sees_only_own(client_sess, admin_sess, demo_client_id):
    # ensure at least one project exists for demo client
    sa, _ = admin_sess
    sa.post(f"{API}/projects", json={"name": f"TEST ClientVisible {uuid.uuid4().hex[:4]}",
                                     "client_id": demo_client_id, "service_type": "SEO"}, timeout=15)
    sc, u = client_sess
    r = sc.get(f"{API}/projects", timeout=15)
    assert r.status_code == 200
    for p in r.json():
        assert p["client_id"] == u.get("client_id")


# ---------- Tasks & progress recalculation ----------
def test_task_progress_recalculation(admin_sess, demo_client_id):
    s, _ = admin_sess
    # Create fresh project
    pr = s.post(f"{API}/projects", json={"name": f"TEST ProgProj {uuid.uuid4().hex[:5]}",
                                         "client_id": demo_client_id, "service_type": "SEO"}, timeout=15)
    assert pr.status_code == 200
    pid = pr.json()["id"]

    # Create 4 tasks
    task_ids = []
    for i in range(4):
        tr = s.post(f"{API}/tasks", json={"title": f"TEST T{i}", "project_id": pid, "status": "todo"},
                    timeout=15)
        assert tr.status_code == 200
        task_ids.append(tr.json()["id"])

    # Move 2 tasks to done -> expect 50% progress
    for tid in task_ids[:2]:
        r = s.patch(f"{API}/tasks/{tid}/status", json={"status": "done"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "done"

    pr2 = s.get(f"{API}/projects/{pid}", timeout=15)
    assert pr2.status_code == 200
    assert pr2.json()["project"]["progress"] == 50

    # invalid status
    r = s.patch(f"{API}/tasks/{task_ids[0]}/status", json={"status": "bogus"}, timeout=15)
    assert r.status_code == 400


# ---------- Overview ----------
def test_overview_staff(admin_sess):
    s, _ = admin_sess
    r = s.get(f"{API}/overview", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "kpis" in data
    assert "leads_by_stage" in data
    assert "leads_by_source" in data


def test_overview_client_forbidden(client_sess):
    s, _ = client_sess
    r = s.get(f"{API}/overview", timeout=15)
    assert r.status_code == 403


# ---------- CMS: blog ----------
def test_blog_create_and_public_filter(admin_sess):
    s, _ = admin_sess
    slug = f"test-slug-{uuid.uuid4().hex[:6]}"
    r = s.post(f"{API}/blog", json={"title": "TEST Draft", "slug": slug,
                                    "content": "Hello", "status": "draft"}, timeout=15)
    assert r.status_code == 200
    post_id = r.json()["id"]

    # Public should NOT see draft
    r2 = requests.get(f"{API}/public/blog", timeout=15)
    assert r2.status_code == 200
    slugs = [p["slug"] for p in r2.json()]
    assert slug not in slugs

    # Publish
    r3 = s.patch(f"{API}/blog/{post_id}", json={"title": "TEST Published", "slug": slug,
                                                "content": "Hello", "status": "published"}, timeout=15)
    assert r3.status_code == 200

    r4 = requests.get(f"{API}/public/blog", timeout=15)
    slugs = [p["slug"] for p in r4.json()]
    assert slug in slugs


def test_blog_requires_marketing_role(client_sess):
    s, _ = client_sess
    r = s.post(f"{API}/blog", json={"title": "x", "slug": f"x-{uuid.uuid4().hex[:5]}",
                                    "content": "y"}, timeout=15)
    assert r.status_code == 403


# ---------- CMS: portfolio ----------
def test_portfolio_published_filter(admin_sess):
    s, _ = admin_sess
    slug = f"port-{uuid.uuid4().hex[:6]}"
    r = s.post(f"{API}/portfolio", json={"title": "TEST Port", "slug": slug, "status": "draft"}, timeout=15)
    assert r.status_code == 200
    item_id = r.json()["id"]
    r2 = requests.get(f"{API}/public/portfolio", timeout=15)
    slugs = [i.get("slug") for i in r2.json()]
    assert slug not in slugs

    r3 = s.patch(f"{API}/portfolio/{item_id}",
                 json={"title": "TEST Port", "slug": slug, "status": "published"}, timeout=15)
    assert r3.status_code == 200
    r4 = requests.get(f"{API}/public/portfolio", timeout=15)
    slugs = [i.get("slug") for i in r4.json()]
    assert slug in slugs


# ---------- CMS: testimonials ----------
def test_testimonials_approval_filter(admin_sess):
    s, _ = admin_sess
    quote = f"TEST quote {uuid.uuid4().hex[:6]}"
    r = s.post(f"{API}/testimonials", json={"author": "TEST Author", "quote": quote,
                                            "rating": 5, "approved": False}, timeout=15)
    assert r.status_code == 200
    item_id = r.json()["id"]
    r2 = requests.get(f"{API}/public/testimonials", timeout=15)
    assert quote not in [t.get("quote") for t in r2.json()]

    r3 = s.patch(f"{API}/testimonials/{item_id}",
                 json={"author": "TEST Author", "quote": quote, "rating": 5, "approved": True}, timeout=15)
    assert r3.status_code == 200
    r4 = requests.get(f"{API}/public/testimonials", timeout=15)
    assert quote in [t.get("quote") for t in r4.json()]


# ---------- Services ----------
def test_public_services_seeded():
    r = requests.get(f"{API}/public/services", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 9


# ---------- Invoices & payments ----------
def test_invoice_total_computation_and_payment(admin_sess, demo_client_id):
    s, _ = admin_sess
    payload = {
        "client_id": demo_client_id,
        "issue_date": "2026-01-01",
        "due_date": "2026-01-31",
        "items": [
            {"description": "SEO", "quantity": 2, "rate": 500, "tax_rate": 10},  # 1000 + 100
            {"description": "Ads", "quantity": 1, "rate": 300, "tax_rate": 0},   # 300
        ],
        "discount": 100,
    }
    r = s.post(f"{API}/invoices", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    inv = r.json()
    # subtotal = 1000+300=1300; tax=100; discount=100; total=1300-100+100=1300
    assert inv["subtotal"] == 1300
    assert inv["tax_total"] == 100
    assert inv["discount"] == 100
    assert inv["total"] == 1300
    assert inv["balance_due"] == 1300
    assert inv["invoice_number"].startswith("PMR-")
    inv_id = inv["id"]

    # Partial payment
    r2 = s.post(f"{API}/payments", json={"invoice_id": inv_id, "amount": 500,
                                         "paid_at": "2026-01-05", "method": "bank"}, timeout=15)
    assert r2.status_code == 200
    r3 = s.get(f"{API}/invoices/{inv_id}", timeout=15)
    body = r3.json()["invoice"]
    assert body["amount_paid"] == 500
    assert body["balance_due"] == 800
    assert body["status"] == "partially_paid"

    # Pay off remaining
    r4 = s.post(f"{API}/payments", json={"invoice_id": inv_id, "amount": 800,
                                         "paid_at": "2026-01-10"}, timeout=15)
    assert r4.status_code == 200
    r5 = s.get(f"{API}/invoices/{inv_id}", timeout=15)
    body = r5.json()["invoice"]
    assert body["balance_due"] == 0
    assert body["status"] == "paid"


def test_client_invoice_isolation(admin_sess, client_sess, demo_client_id):
    sa, _ = admin_sess
    # Create an invoice for a NEW (different) client
    nc = sa.post(f"{API}/clients", json={"name": "Other", "company": "Other Co",
                                          "email": f"TEST_other_{uuid.uuid4().hex[:5]}@example.com"},
                 timeout=15)
    other_cid = nc.json()["id"]
    inv_r = sa.post(f"{API}/invoices", json={"client_id": other_cid,
                                             "issue_date": "2026-01-01", "due_date": "2026-01-31",
                                             "items": [{"description": "X", "quantity": 1, "rate": 100}]},
                    timeout=15)
    other_inv_id = inv_r.json()["id"]

    sc, u = client_sess
    r = sc.get(f"{API}/invoices", timeout=15)
    assert r.status_code == 200
    for inv in r.json():
        assert inv["client_id"] == u.get("client_id")

    # Direct access to another client's invoice should 403
    r2 = sc.get(f"{API}/invoices/{other_inv_id}", timeout=15)
    assert r2.status_code == 403


# ---------- Client Portal ----------
def test_portal_overview_client(client_sess):
    s, _ = client_sess
    r = s.get(f"{API}/portal/overview", timeout=15)
    assert r.status_code == 200
    data = r.json()
    for key in ["active_projects", "outstanding_amount", "invoices_count"]:
        assert key in data


# ---------- Users RBAC ----------
def test_user_create_admin_only(admin_sess, sales_sess):
    sa, _ = admin_sess
    payload = {"email": f"TEST_user_{uuid.uuid4().hex[:5]}@example.com",
               "password": "TestPass123", "name": "TEST User", "role": "employee"}
    r = sa.post(f"{API}/users", json=payload, timeout=15)
    assert r.status_code == 200
    assert r.json()["role"] == "employee"

    # invalid role
    r2 = sa.post(f"{API}/users", json={"email": f"TEST_u2_{uuid.uuid4().hex[:5]}@example.com",
                                       "password": "TestPass123", "name": "X", "role": "fake_role"},
                 timeout=15)
    assert r2.status_code == 400

    # non-admin forbidden
    ss, _ = sales_sess
    r3 = ss.post(f"{API}/users", json=payload, timeout=15)
    assert r3.status_code == 403


def test_only_super_admin_can_deactivate(admin_sess, sales_sess):
    sa, _ = admin_sess
    payload = {"email": f"TEST_deact_{uuid.uuid4().hex[:5]}@example.com",
               "password": "TestPass123", "name": "DeactMe", "role": "employee"}
    r = sa.post(f"{API}/users", json=payload, timeout=15)
    uid = r.json()["id"]

    ss, _ = sales_sess
    r1 = ss.delete(f"{API}/users/{uid}", timeout=15)
    assert r1.status_code == 403

    r2 = sa.delete(f"{API}/users/{uid}", timeout=15)
    assert r2.status_code == 200
