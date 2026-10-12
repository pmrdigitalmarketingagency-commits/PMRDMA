from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import secrets as pysecrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Annotated
from decimal import Decimal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query, status
from fastapi.security import HTTPBearer
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr, BeforeValidator
from bson import ObjectId


# ---------- MongoDB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- Constants ----------
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 1 day
REFRESH_TOKEN_DAYS = 7

ROLES = ["super_admin", "admin", "sales_manager", "project_manager",
         "marketing_executive", "finance_manager", "employee", "client"]

LEAD_STAGES = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"]
PROJECT_STATUSES = ["planning", "in_progress", "review", "on_hold", "completed", "cancelled"]
TASK_STATUSES = ["backlog", "todo", "in_progress", "in_review", "done"]
TASK_PRIORITIES = ["low", "normal", "high", "urgent"]
INVOICE_STATUSES = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": now_utc() + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": now_utc() + timedelta(days=REFRESH_TOKEN_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=True,
                        samesite="none", max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True,
                        samesite="none", max_age=REFRESH_TOKEN_DAYS * 86400, path="/")


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_roles(*allowed: str):
    async def dep(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dep


def is_staff(role: str) -> bool:
    return role in {"super_admin", "admin", "sales_manager", "project_manager",
                    "marketing_executive", "finance_manager", "employee"}


# ---------- Models ----------
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    status: str = "active"
    client_id: Optional[str] = None
    created_at: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    password: str = Field(min_length=8)


class CreateUserIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: str
    phone: Optional[str] = None
    client_id: Optional[str] = None


class UpdateUserIn(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    client_id: Optional[str] = None


# ---------- Lead ----------
class PublicLeadIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    services: List[str] = []
    budget: Optional[str] = None
    goals: Optional[str] = None
    preferred_contact: Optional[str] = "email"
    message: Optional[str] = None
    consent: bool = False
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class LeadUpdateIn(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    services: Optional[List[str]] = None
    budget: Optional[str] = None
    goals: Optional[str] = None
    message: Optional[str] = None
    stage: Optional[str] = None
    source: Optional[str] = None
    assigned_to: Optional[str] = None
    next_followup: Optional[str] = None
    notes: Optional[str] = None


# ---------- Client ----------
class ClientIn(BaseModel):
    name: str
    company: str
    email: EmailStr
    phone: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    status: str = "active"
    account_manager: Optional[str] = None
    services: List[str] = []
    contract_start: Optional[str] = None
    contract_end: Optional[str] = None
    notes: Optional[str] = None


# ---------- Project ----------
class ProjectIn(BaseModel):
    name: str
    client_id: str
    service_type: str
    status: str = "planning"
    manager_id: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None


# ---------- Task ----------
class TaskIn(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    assignee_id: Optional[str] = None
    priority: str = "normal"
    status: str = "todo"
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None


# ---------- CMS ----------
class BlogPostIn(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    author: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    status: str = "draft"


class PortfolioIn(BaseModel):
    title: str
    slug: str
    industry: Optional[str] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None
    challenge: Optional[str] = None
    strategy: Optional[str] = None
    results: Optional[str] = None
    services: List[str] = []
    status: str = "draft"


class TestimonialIn(BaseModel):
    author: str
    company: Optional[str] = None
    role: Optional[str] = None
    quote: str
    rating: int = 5
    photo: Optional[str] = None
    approved: bool = False


class ServiceIn(BaseModel):
    name: str
    slug: str
    category: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    deliverables: List[str] = []
    price: Optional[float] = None
    billing_frequency: Optional[str] = None
    timeline: Optional[str] = None
    active: bool = True


# ---------- Invoice ----------
class InvoiceItemIn(BaseModel):
    description: str
    quantity: float = 1
    rate: float = 0
    tax_rate: float = 0


class InvoiceIn(BaseModel):
    client_id: str
    project_id: Optional[str] = None
    issue_date: str
    due_date: str
    items: List[InvoiceItemIn]
    discount: float = 0
    notes: Optional[str] = None


class PaymentIn(BaseModel):
    invoice_id: str
    amount: float
    paid_at: str
    method: Optional[str] = None
    reference: Optional[str] = None


# ========== FastAPI app ==========
app = FastAPI(title="PMR Digital Marketing Agency API")
api_router = APIRouter(prefix="/api")

cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ===================== AUTH =====================
@api_router.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > now_utc():
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        new_count = (attempt.get("count", 0) if attempt else 0) + 1
        locked_until = iso(now_utc() + timedelta(minutes=15)) if new_count >= 5 else None
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$set": {"count": new_count, "locked_until": locked_until, "updated_at": iso(now_utc())}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("status") == "inactive":
        raise HTTPException(status_code=403, detail="Account is inactive")

    await db.login_attempts.delete_one({"identifier": identifier})

    access = create_access_token(user["id"], user["email"], user["role"])
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)

    user.pop("_id", None)
    user.pop("password_hash", None)
    return {"user": user, "access_token": access}


@api_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"], user["role"])
        response.set_cookie("access_token", access, httponly=True, secure=True,
                            samesite="none", max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@api_router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if user:
        token = pysecrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["id"],
            "expires_at": now_utc() + timedelta(hours=1),
            "used": False,
            "created_at": iso(now_utc()),
        })
        logger.info(f"Password reset link: /reset-password?token={token}")
    return {"ok": True, "message": "If your account exists, a reset link has been sent."}


@api_router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordIn):
    rec = await db.password_reset_tokens.find_one({"token": body.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or used token")
    expires = rec.get("expires_at")
    if isinstance(expires, str):
        expires = datetime.fromisoformat(expires)
    if expires.replace(tzinfo=timezone.utc) if expires.tzinfo is None else expires < now_utc():
        raise HTTPException(status_code=400, detail="Token expired")

    await db.users.update_one({"id": rec["user_id"]},
                              {"$set": {"password_hash": hash_password(body.password),
                                        "updated_at": iso(now_utc())}})
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True}


# ===================== USERS / TEAM =====================
@api_router.get("/users")
async def list_users(user: dict = Depends(require_roles("super_admin", "admin"))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users


@api_router.post("/users")
async def create_user(body: CreateUserIn, user: dict = Depends(require_roles("super_admin", "admin"))):
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": body.role,
        "phone": body.phone,
        "client_id": body.client_id,
        "status": "active",
        "created_at": iso(now_utc()),
    }
    await db.users.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc


@api_router.patch("/users/{user_id}")
async def update_user(user_id: str, body: UpdateUserIn,
                      user: dict = Depends(require_roles("super_admin", "admin"))):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "role" in update and update["role"] not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    update["updated_at"] = iso(now_utc())
    result = await db.users.update_one({"id": user_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return doc


@api_router.delete("/users/{user_id}")
async def deactivate_user(user_id: str, user: dict = Depends(require_roles("super_admin"))):
    result = await db.users.update_one({"id": user_id}, {"$set": {"status": "inactive"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ===================== LEADS =====================
@api_router.post("/leads")
async def public_submit_lead(body: PublicLeadIn, request: Request):
    """Public endpoint for website contact form."""
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["stage"] = "new"
    data["source"] = data.pop("utm_source", None) or "website"
    data["ip"] = request.client.host if request.client else None
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.leads.insert_one(data)
    data.pop("_id", None)
    return {"ok": True, "id": data["id"]}


@api_router.get("/leads")
async def list_leads(stage: Optional[str] = None, q: Optional[str] = None,
                     user: dict = Depends(get_current_user)):
    if user["role"] == "client":
        raise HTTPException(status_code=403, detail="Forbidden")
    query: dict = {}
    if stage:
        query["stage"] = stage
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
        ]
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads


@api_router.get("/leads/{lead_id}")
async def get_lead(lead_id: str, user: dict = Depends(get_current_user)):
    if user["role"] == "client":
        raise HTTPException(status_code=403, detail="Forbidden")
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Not found")
    activities = await db.lead_activities.find({"lead_id": lead_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"lead": lead, "activities": activities}


@api_router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, body: LeadUpdateIn,
                      user: dict = Depends(require_roles("super_admin", "admin", "sales_manager"))):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "stage" in update and update["stage"] not in LEAD_STAGES:
        raise HTTPException(status_code=400, detail="Invalid stage")
    update["updated_at"] = iso(now_utc())
    result = await db.leads.update_one({"id": lead_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    await db.lead_activities.insert_one({
        "id": str(uuid.uuid4()), "lead_id": lead_id, "actor_id": user["id"],
        "actor_name": user["name"], "type": "update",
        "detail": f"Updated: {', '.join(update.keys())}",
        "created_at": iso(now_utc()),
    })
    return await db.leads.find_one({"id": lead_id}, {"_id": 0})


@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str,
                      user: dict = Depends(require_roles("super_admin", "admin"))):
    await db.leads.delete_one({"id": lead_id})
    return {"ok": True}


@api_router.post("/leads/{lead_id}/convert")
async def convert_lead(lead_id: str,
                       user: dict = Depends(require_roles("super_admin", "admin", "sales_manager"))):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Not found")
    if lead.get("client_id"):
        return {"client_id": lead["client_id"], "already_converted": True}
    # Check for existing client by email
    existing = await db.clients.find_one({"email": lead["email"]})
    if existing:
        client_id = existing["id"]
    else:
        client_id = str(uuid.uuid4())
        await db.clients.insert_one({
            "id": client_id, "name": lead.get("name"), "company": lead.get("company") or lead.get("name"),
            "email": lead["email"], "phone": lead.get("phone"), "industry": lead.get("industry"),
            "website": lead.get("website"), "services": lead.get("services", []),
            "status": "active", "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        })
    await db.leads.update_one({"id": lead_id}, {"$set": {
        "stage": "won", "client_id": client_id, "updated_at": iso(now_utc())
    }})
    return {"client_id": client_id, "already_converted": False}


# ===================== CLIENTS =====================
@api_router.get("/clients")
async def list_clients(user: dict = Depends(get_current_user)):
    if user["role"] == "client":
        # Return only their own client record
        if not user.get("client_id"):
            return []
        c = await db.clients.find_one({"id": user["client_id"]}, {"_id": 0})
        return [c] if c else []
    clients = await db.clients.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return clients


@api_router.post("/clients")
async def create_client(body: ClientIn,
                        user: dict = Depends(require_roles("super_admin", "admin", "sales_manager"))):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.clients.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.get("/clients/{client_id}")
async def get_client(client_id: str, user: dict = Depends(get_current_user)):
    if user["role"] == "client" and user.get("client_id") != client_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    c = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    return c


@api_router.patch("/clients/{client_id}")
async def update_client(client_id: str, body: ClientIn,
                        user: dict = Depends(require_roles("super_admin", "admin", "sales_manager"))):
    update = body.model_dump()
    update["updated_at"] = iso(now_utc())
    await db.clients.update_one({"id": client_id}, {"$set": update})
    return await db.clients.find_one({"id": client_id}, {"_id": 0})


# ===================== PROJECTS =====================
@api_router.get("/projects")
async def list_projects(client_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query: dict = {}
    if user["role"] == "client":
        if not user.get("client_id"):
            return []
        query["client_id"] = user["client_id"]
    elif client_id:
        query["client_id"] = client_id
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return projects


@api_router.post("/projects")
async def create_project(body: ProjectIn,
                         user: dict = Depends(require_roles("super_admin", "admin",
                                                            "sales_manager", "project_manager"))):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["progress"] = 0
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.projects.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if user["role"] == "client" and user.get("client_id") != p.get("client_id"):
        raise HTTPException(status_code=403, detail="Forbidden")
    tasks = await db.tasks.find({"project_id": project_id}, {"_id": 0}).to_list(500)
    return {"project": p, "tasks": tasks}


@api_router.patch("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectIn,
                         user: dict = Depends(require_roles("super_admin", "admin",
                                                            "sales_manager", "project_manager"))):
    update = body.model_dump()
    update["updated_at"] = iso(now_utc())
    await db.projects.update_one({"id": project_id}, {"$set": update})
    return await db.projects.find_one({"id": project_id}, {"_id": 0})


# ===================== TASKS =====================
async def _recalc_project_progress(project_id: str) -> None:
    total = await db.tasks.count_documents({"project_id": project_id})
    if total == 0:
        return
    done = await db.tasks.count_documents({"project_id": project_id, "status": "done"})
    progress = round((done / total) * 100)
    await db.projects.update_one({"id": project_id}, {"$set": {"progress": progress}})


@api_router.get("/tasks")
async def list_tasks(project_id: Optional[str] = None, assignee_id: Optional[str] = None,
                     user: dict = Depends(get_current_user)):
    query: dict = {}
    if project_id:
        query["project_id"] = project_id
    if assignee_id:
        query["assignee_id"] = assignee_id
    if user["role"] == "client":
        # clients only see tasks for their projects
        if not user.get("client_id"):
            return []
        projs = await db.projects.find({"client_id": user["client_id"]}, {"_id": 0, "id": 1}).to_list(500)
        pids = [p["id"] for p in projs]
        query["project_id"] = {"$in": pids}
    elif user["role"] == "employee":
        query["$or"] = [{"assignee_id": user["id"]}, {"created_by": user["id"]}]
    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return tasks


@api_router.post("/tasks")
async def create_task(body: TaskIn, user: dict = Depends(get_current_user)):
    if not is_staff(user["role"]):
        raise HTTPException(status_code=403, detail="Forbidden")
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_by"] = user["id"]
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.tasks.insert_one(data)
    if data.get("project_id"):
        await _recalc_project_progress(data["project_id"])
    data.pop("_id", None)
    return data


@api_router.patch("/tasks/{task_id}")
async def update_task(task_id: str, body: TaskIn, user: dict = Depends(get_current_user)):
    if not is_staff(user["role"]):
        raise HTTPException(status_code=403, detail="Forbidden")
    update = body.model_dump()
    update["updated_at"] = iso(now_utc())
    await db.tasks.update_one({"id": task_id}, {"$set": update})
    t = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if t and t.get("project_id"):
        await _recalc_project_progress(t["project_id"])
    return t


@api_router.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, body: dict, user: dict = Depends(get_current_user)):
    new_status = body.get("status")
    if new_status not in TASK_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    t = await db.tasks.find_one({"id": task_id})
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    if user["role"] == "client":
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.tasks.update_one({"id": task_id}, {"$set": {"status": new_status, "updated_at": iso(now_utc())}})
    if t.get("project_id"):
        await _recalc_project_progress(t["project_id"])
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str,
                      user: dict = Depends(require_roles("super_admin", "admin", "project_manager"))):
    t = await db.tasks.find_one({"id": task_id})
    await db.tasks.delete_one({"id": task_id})
    if t and t.get("project_id"):
        await _recalc_project_progress(t["project_id"])
    return {"ok": True}


# ===================== DASHBOARD / OVERVIEW =====================
@api_router.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    if user["role"] == "client":
        raise HTTPException(status_code=403, detail="Forbidden")

    today = now_utc()
    first_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    leads_total = await db.leads.count_documents({})
    leads_new = await db.leads.count_documents({"stage": "new"})
    leads_qualified = await db.leads.count_documents({"stage": "qualified"})
    leads_won = await db.leads.count_documents({"stage": "won"})

    clients_active = await db.clients.count_documents({"status": "active"})
    projects_active = await db.projects.count_documents({"status": {"$in": ["planning", "in_progress", "review"]}})
    tasks_due = await db.tasks.count_documents({"status": {"$nin": ["done"]}})

    # Leads by stage
    pipeline = [{"$group": {"_id": "$stage", "count": {"$sum": 1}}}]
    stage_counts = {d["_id"]: d["count"] async for d in db.leads.aggregate(pipeline)}
    leads_by_stage = [{"stage": s, "count": stage_counts.get(s, 0)} for s in LEAD_STAGES]

    # Leads by source
    src_pipeline = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    leads_by_source = []
    async for d in db.leads.aggregate(src_pipeline):
        leads_by_source.append({"source": d["_id"] or "unknown", "count": d["count"]})

    # Project status breakdown
    proj_pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    projects_by_status = []
    async for d in db.projects.aggregate(proj_pipeline):
        projects_by_status.append({"status": d["_id"], "count": d["count"]})

    # Recent leads
    recent_leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)

    return {
        "kpis": {
            "leads_total": leads_total,
            "leads_new": leads_new,
            "leads_qualified": leads_qualified,
            "leads_won": leads_won,
            "clients_active": clients_active,
            "projects_active": projects_active,
            "tasks_due": tasks_due,
        },
        "leads_by_stage": leads_by_stage,
        "leads_by_source": leads_by_source,
        "projects_by_status": projects_by_status,
        "recent_leads": recent_leads,
    }


# ===================== CMS: BLOG =====================
@api_router.get("/public/blog")
async def public_blog(category: Optional[str] = None, q: Optional[str] = None):
    query: dict = {"status": "published"}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}},
        ]
    posts = await db.blog_posts.find(query, {"_id": 0, "content": 0}).sort("created_at", -1).to_list(100)
    return posts


@api_router.get("/public/blog/{slug}")
async def public_blog_detail(slug: str):
    p = await db.blog_posts.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p


@api_router.get("/blog")
async def admin_blog_list(user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    posts = await db.blog_posts.find({}, {"_id": 0, "content": 0}).sort("created_at", -1).to_list(500)
    return posts


@api_router.post("/blog")
async def admin_blog_create(body: BlogPostIn, user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    data = body.model_dump()
    existing = await db.blog_posts.find_one({"slug": data["slug"]})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    data["id"] = str(uuid.uuid4())
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.blog_posts.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.patch("/blog/{post_id}")
async def admin_blog_update(post_id: str, body: BlogPostIn,
                            user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    update = body.model_dump()
    update["updated_at"] = iso(now_utc())
    await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    return await db.blog_posts.find_one({"id": post_id}, {"_id": 0})


@api_router.delete("/blog/{post_id}")
async def admin_blog_delete(post_id: str, user: dict = Depends(require_roles("super_admin", "admin"))):
    await db.blog_posts.delete_one({"id": post_id})
    return {"ok": True}


# ===================== CMS: PORTFOLIO =====================
@api_router.get("/public/portfolio")
async def public_portfolio(category: Optional[str] = None):
    query: dict = {"status": "published"}
    if category:
        query["category"] = category
    items = await db.portfolio.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


@api_router.get("/portfolio")
async def portfolio_list(user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    items = await db.portfolio.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/portfolio")
async def portfolio_create(body: PortfolioIn,
                           user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_at"] = iso(now_utc())
    data["updated_at"] = iso(now_utc())
    await db.portfolio.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.patch("/portfolio/{item_id}")
async def portfolio_update(item_id: str, body: PortfolioIn,
                           user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    update = body.model_dump()
    update["updated_at"] = iso(now_utc())
    await db.portfolio.update_one({"id": item_id}, {"$set": update})
    return await db.portfolio.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/portfolio/{item_id}")
async def portfolio_delete(item_id: str, user: dict = Depends(require_roles("super_admin", "admin"))):
    await db.portfolio.delete_one({"id": item_id})
    return {"ok": True}


# ===================== CMS: TESTIMONIALS =====================
@api_router.get("/public/testimonials")
async def public_testimonials():
    items = await db.testimonials.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items


@api_router.get("/testimonials")
async def admin_testimonials(user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    return await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.post("/testimonials")
async def create_testimonial(body: TestimonialIn,
                             user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_at"] = iso(now_utc())
    await db.testimonials.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.patch("/testimonials/{item_id}")
async def update_testimonial(item_id: str, body: TestimonialIn,
                             user: dict = Depends(require_roles("super_admin", "admin", "marketing_executive"))):
    update = body.model_dump()
    await db.testimonials.update_one({"id": item_id}, {"$set": update})
    return await db.testimonials.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/testimonials/{item_id}")
async def delete_testimonial(item_id: str, user: dict = Depends(require_roles("super_admin", "admin"))):
    await db.testimonials.delete_one({"id": item_id})
    return {"ok": True}


# ===================== CMS: SERVICES =====================
@api_router.get("/public/services")
async def public_services():
    items = await db.services.find({"active": True}, {"_id": 0}).to_list(100)
    return items


@api_router.get("/services")
async def admin_services(user: dict = Depends(get_current_user)):
    if not is_staff(user["role"]):
        raise HTTPException(status_code=403, detail="Forbidden")
    return await db.services.find({}, {"_id": 0}).to_list(200)


@api_router.post("/services")
async def create_service(body: ServiceIn, user: dict = Depends(require_roles("super_admin", "admin"))):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_at"] = iso(now_utc())
    await db.services.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.patch("/services/{item_id}")
async def update_service(item_id: str, body: ServiceIn,
                         user: dict = Depends(require_roles("super_admin", "admin"))):
    update = body.model_dump()
    await db.services.update_one({"id": item_id}, {"$set": update})
    return await db.services.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/services/{item_id}")
async def delete_service(item_id: str, user: dict = Depends(require_roles("super_admin", "admin"))):
    await db.services.delete_one({"id": item_id})
    return {"ok": True}


# ===================== INVOICES =====================
def _compute_invoice_totals(items: List[dict], discount: float = 0):
    subtotal = 0.0
    tax_total = 0.0
    for it in items:
        amount = float(it.get("quantity", 1)) * float(it.get("rate", 0))
        tax = amount * float(it.get("tax_rate", 0)) / 100.0
        it["amount"] = round(amount, 2)
        it["tax_amount"] = round(tax, 2)
        subtotal += amount
        tax_total += tax
    discount_amt = float(discount or 0)
    total = max(0.0, subtotal - discount_amt + tax_total)
    return round(subtotal, 2), round(tax_total, 2), round(discount_amt, 2), round(total, 2)


@api_router.get("/invoices")
async def list_invoices(user: dict = Depends(get_current_user)):
    query: dict = {}
    if user["role"] == "client":
        if not user.get("client_id"):
            return []
        query["client_id"] = user["client_id"]
    elif user["role"] not in {"super_admin", "admin", "finance_manager", "sales_manager"}:
        raise HTTPException(status_code=403, detail="Forbidden")
    return await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.post("/invoices")
async def create_invoice(body: InvoiceIn,
                         user: dict = Depends(require_roles("super_admin", "admin", "finance_manager"))):
    items = [it.model_dump() for it in body.items]
    subtotal, tax, discount, total = _compute_invoice_totals(items, body.discount)
    # Sequential invoice number
    counter = await db.counters.find_one_and_update(
        {"_id": "invoice"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = counter.get("seq", 1) if counter else 1
    year = datetime.now().year
    invoice_no = f"PMR-{year}-{seq:05d}"
    doc = {
        "id": str(uuid.uuid4()),
        "invoice_number": invoice_no,
        "client_id": body.client_id,
        "project_id": body.project_id,
        "issue_date": body.issue_date,
        "due_date": body.due_date,
        "items": items,
        "subtotal": subtotal,
        "tax_total": tax,
        "discount": discount,
        "total": total,
        "amount_paid": 0.0,
        "balance_due": total,
        "status": "draft",
        "notes": body.notes,
        "created_at": iso(now_utc()),
        "updated_at": iso(now_utc()),
    }
    await db.invoices.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, user: dict = Depends(get_current_user)):
    inv = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not inv:
        raise HTTPException(status_code=404, detail="Not found")
    if user["role"] == "client" and user.get("client_id") != inv.get("client_id"):
        raise HTTPException(status_code=403, detail="Forbidden")
    payments = await db.payments.find({"invoice_id": invoice_id}, {"_id": 0}).to_list(100)
    return {"invoice": inv, "payments": payments}


@api_router.post("/payments")
async def record_payment(body: PaymentIn,
                         user: dict = Depends(require_roles("super_admin", "admin", "finance_manager"))):
    inv = await db.invoices.find_one({"id": body.invoice_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    payment = {
        "id": str(uuid.uuid4()),
        "invoice_id": body.invoice_id,
        "amount": round(float(body.amount), 2),
        "paid_at": body.paid_at,
        "method": body.method,
        "reference": body.reference,
        "created_at": iso(now_utc()),
    }
    await db.payments.insert_one(payment)
    new_paid = round(float(inv.get("amount_paid", 0)) + float(body.amount), 2)
    new_balance = round(float(inv["total"]) - new_paid, 2)
    status_val = "paid" if new_balance <= 0.009 else ("partially_paid" if new_paid > 0 else inv.get("status", "sent"))
    await db.invoices.update_one({"id": body.invoice_id}, {"$set": {
        "amount_paid": new_paid, "balance_due": max(0.0, new_balance),
        "status": status_val, "updated_at": iso(now_utc())
    }})
    payment.pop("_id", None)
    return payment


# ===================== CLIENT PORTAL =====================
@api_router.get("/portal/overview")
async def portal_overview(user: dict = Depends(require_roles("client"))):
    if not user.get("client_id"):
        raise HTTPException(status_code=404, detail="No client linked")
    cid = user["client_id"]
    projects = await db.projects.find({"client_id": cid}, {"_id": 0}).to_list(100)
    invoices = await db.invoices.find({"client_id": cid}, {"_id": 0}).to_list(100)
    outstanding = sum(float(i.get("balance_due", 0)) for i in invoices)
    return {
        "client_id": cid,
        "active_projects": len([p for p in projects if p.get("status") in ("planning", "in_progress", "review")]),
        "total_projects": len(projects),
        "outstanding_amount": round(outstanding, 2),
        "invoices_count": len(invoices),
    }


# ===================== STARTUP =====================
async def seed_default_data():
    # Admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@pmratnam.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@PMR2026")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "PMR Admin",
            "role": "super_admin",
            "status": "active",
            "created_at": iso(now_utc()),
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed demo roles
    demo_users = [
        ("sales@pmratnam.com", "Sales@123", "Sales Manager Demo", "sales_manager"),
        ("pm@pmratnam.com", "PM@123", "Project Manager Demo", "project_manager"),
        ("employee@pmratnam.com", "Emp@123", "Employee Demo", "employee"),
    ]
    for email, pwd, name, role in demo_users:
        if not await db.users.find_one({"email": email}):
            await db.users.insert_one({
                "id": str(uuid.uuid4()), "email": email, "password_hash": hash_password(pwd),
                "name": name, "role": role, "status": "active",
                "created_at": iso(now_utc()),
            })

    # Seed demo client + client user
    client_user_email = "client@pmratnam.com"
    if not await db.users.find_one({"email": client_user_email}):
        demo_client_id = str(uuid.uuid4())
        await db.clients.insert_one({
            "id": demo_client_id, "name": "Demo Client", "company": "Acme D2C",
            "email": client_user_email, "phone": "+91 90000 00000",
            "industry": "E-commerce", "status": "active",
            "services": ["SEO", "Social Media"],
            "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        })
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": client_user_email, "password_hash": hash_password("Client@123"),
            "name": "Demo Client", "role": "client", "client_id": demo_client_id, "status": "active",
            "created_at": iso(now_utc()),
        })

    # Seed services catalog if empty
    if await db.services.count_documents({}) == 0:
        default_services = [
            {"name": "SEO & Local SEO", "slug": "seo", "category": "Organic Growth",
             "description": "Rank higher on Google and dominate local search with technical SEO, content, and link building.",
             "icon": "search", "deliverables": ["Technical audit", "On-page optimization", "Monthly content", "Local SEO setup"]},
            {"name": "Social Media Marketing", "slug": "social-media-marketing", "category": "Social",
             "description": "Build a magnetic social presence across Instagram, LinkedIn, Facebook, and more.",
             "icon": "share-2", "deliverables": ["Content calendar", "Reels & creatives", "Community management", "Analytics"]},
            {"name": "Google & Meta Ads", "slug": "paid-advertising", "category": "Performance",
             "description": "Full-funnel paid campaigns that convert — Google, YouTube, Meta, LinkedIn.",
             "icon": "target", "deliverables": ["Campaign strategy", "Creative production", "Daily optimization", "Weekly reporting"]},
            {"name": "Website Design & Development", "slug": "website-development", "category": "Build",
             "description": "Conversion-focused websites engineered for speed, SEO, and sales.",
             "icon": "code", "deliverables": ["UX design", "Development", "CMS setup", "Launch & QA"]},
            {"name": "Branding & Creative Design", "slug": "branding", "category": "Brand",
             "description": "Distinctive brand identities with logos, systems, and guidelines that scale.",
             "icon": "sparkles", "deliverables": ["Logo system", "Brand book", "Visual system", "Templates"]},
            {"name": "Content Marketing", "slug": "content-marketing", "category": "Content",
             "description": "Editorial content and SEO articles that build authority and attract buyers.",
             "icon": "file-text", "deliverables": ["Topic research", "SEO articles", "Repurposing", "Distribution"]},
            {"name": "Video Production", "slug": "video-production", "category": "Creative",
             "description": "Reels, YouTube videos, ads, and brand films produced end-to-end.",
             "icon": "video", "deliverables": ["Scripting", "Shoot & direction", "Editing & motion", "Delivery"]},
            {"name": "E-commerce Marketing", "slug": "ecommerce-marketing", "category": "Growth",
             "description": "Scale Shopify, Amazon, and marketplace stores with integrated performance.",
             "icon": "shopping-cart", "deliverables": ["Store optimization", "Paid acquisition", "Email/SMS", "Retention"]},
            {"name": "Analytics & Automation", "slug": "analytics-automation", "category": "Data",
             "description": "GA4, dashboards, CRM, and marketing automation wired into one source of truth.",
             "icon": "bar-chart-3", "deliverables": ["GA4 setup", "Dashboards", "CRM integration", "Automations"]},
        ]
        for svc in default_services:
            svc["id"] = str(uuid.uuid4())
            svc["active"] = True
            svc["created_at"] = iso(now_utc())
            await db.services.insert_one(svc)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.leads.create_index("email")
    await db.leads.create_index("stage")
    await db.clients.create_index("email")
    await db.projects.create_index("client_id")
    await db.tasks.create_index("project_id")
    await db.tasks.create_index("assignee_id")
    await db.blog_posts.create_index("slug", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.invoices.create_index("invoice_number", unique=True)
    await seed_default_data()
    logger.info("Startup complete, data seeded.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api_router.get("/")
async def root():
    return {"ok": True, "service": "PMR Digital Marketing Agency API"}


app.include_router(api_router)
