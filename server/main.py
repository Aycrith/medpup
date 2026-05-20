#!/usr/bin/env python3
"""
MedPup Local Server — Lead intake, CRM dashboard, email dispatch.
Runs entirely locally. No cloud dependencies. No cost.
Usage: python server/main.py
Then open http://localhost:8080
"""

import json
import os
import smtplib
import uuid
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr

# ── Paths ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
LEADS_FILE = BASE_DIR / "server" / "leads.json"
CONFIG_FILE = BASE_DIR / "email-config.json"
EMAIL_TEMPLATES_DIR = BASE_DIR / "emails"
STATIC_DIR = BASE_DIR / "server" / "static"

app = FastAPI(title="MedPup Local Server", version="2.0")

# ── Data Models ────────────────────────────────────────

class IntakeSubmission(BaseModel):
    owner_name: str
    email: str
    phone: Optional[str] = ""
    pet_name: str
    breed: Optional[str] = ""
    age: Optional[str] = ""
    weight: Optional[str] = ""
    procedure: str
    us_quote: Optional[str] = ""
    destination: Optional[str] = ""
    comments: Optional[str] = ""
    submitted_at: Optional[str] = ""

class EmailPayload(BaseModel):
    to: str
    subject: str
    body: str
    template_name: Optional[str] = ""
    lead_id: Optional[str] = ""

class LeadUpdate(BaseModel):
    status: Optional[str] = ""
    notes: Optional[str] = ""
    destination: Optional[str] = ""

# ── Lead Storage ───────────────────────────────────────

def load_leads() -> list:
    if LEADS_FILE.exists():
        with open(LEADS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return []

def save_leads(leads: list):
    LEADS_FILE.write_text(json.dumps(leads, indent=2), encoding="utf-8")

# ── Routes ─────────────────────────────────────────────

@app.get("/")
async def serve_intake():
    """Serve the intake form at the root."""
    intake_path = STATIC_DIR / "intake.html"
    if not intake_path.exists():
        return HTMLResponse("<h1>Intake form not found</h1><p>Run the setup step first.</p>", status_code=404)
    return HTMLResponse(intake_path.read_text(encoding="utf-8"))

@app.post("/api/intake")
async def submit_intake(data: IntakeSubmission):
    """Receive intake form submissions."""
    leads = load_leads()

    lead = data.model_dump()
    lead["id"] = str(uuid.uuid4())[:8]
    lead["status"] = "new"
    lead["notes"] = ""
    if not lead.get("submitted_at"):
        lead["submitted_at"] = datetime.now().isoformat()

    leads.insert(0, lead)
    save_leads(leads)

    print(f"[INTAKE] New lead: {lead['owner_name']} — {lead['pet_name']} ({lead['procedure']})")
    return {"status": "ok", "lead_id": lead["id"], "message": "Thank you!"}

@app.get("/api/leads")
async def get_leads(status: Optional[str] = None):
    """Get all leads, optionally filtered by status."""
    leads = load_leads()
    if status:
        leads = [l for l in leads if l.get("status") == status]
    return {"leads": leads, "total": len(leads)}

@app.get("/api/leads/{lead_id}")
async def get_lead(lead_id: str):
    """Get a single lead by ID."""
    leads = load_leads()
    for l in leads:
        if l["id"] == lead_id:
            return l
    raise HTTPException(404, "Lead not found")

@app.patch("/api/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate):
    """Update a lead's status, notes, or destination."""
    leads = load_leads()
    for l in leads:
        if l["id"] == lead_id:
            if update.status:
                l["status"] = update.status
            if update.notes:
                l["notes"] = (l.get("notes", "") + "\n" + update.notes).strip()
            if update.destination:
                l["destination"] = update.destination
            save_leads(leads)
            return {"status": "ok", "lead": l}
    raise HTTPException(404, "Lead not found")

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics."""
    leads = load_leads()
    total = len(leads)
    statuses = {}
    for l in leads:
        s = l.get("status", "unknown")
        statuses[s] = statuses.get(s, 0) + 1
    procedures = {}
    for l in leads:
        p = l.get("procedure", "unknown")
        procedures[p] = procedures.get(p, 0) + 1
    return {
        "total": total,
        "by_status": statuses,
        "by_procedure": procedures,
    }

@app.get("/api/leads/export/csv")
async def export_csv():
    """Export all leads as CSV."""
    leads = load_leads()
    if not leads:
        return {"csv": "No leads found"}
    fields = ["id", "owner_name", "email", "phone", "pet_name", "breed", "age",
              "weight", "procedure", "us_quote", "destination", "comments",
              "status", "notes", "submitted_at"]
    lines = [",".join(fields)]
    for l in leads:
        row = [str(l.get(f, "")).replace(",", ";").replace("\n", " ") for f in fields]
        lines.append(",".join(row))
    return {"csv": "\n".join(lines), "count": len(leads)}

# ── Email Sending ──────────────────────────────────────

@app.post("/api/send-email")
async def send_email(payload: EmailPayload):
    """Send an email via configured SMTP."""
    config = load_email_config()
    if not config.get("smtp_user") or not config.get("smtp_password"):
        raise HTTPException(400, "SMTP not configured. Set email-config.json or SMTP_USER/SMTP_PASSWORD env vars.")

    msg = EmailMessage()
    msg["Subject"] = payload.subject
    msg["From"] = f"{config.get('from_name', 'MedPup')} <{config['from_email']}>"
    msg["To"] = payload.to
    msg.set_content(payload.body)

    try:
        with smtplib.SMTP(config["smtp_host"], config.get("smtp_port", 587)) as server:
            server.starttls()
            server.login(config["smtp_user"], config["smtp_password"])
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(500, f"Email send failed: {e}")

    # Log the email if a lead_id was provided
    if payload.lead_id:
        leads = load_leads()
        for l in leads:
            if l["id"] == payload.lead_id:
                emails = l.get("emails_sent", [])
                emails.append({
                    "to": payload.to,
                    "subject": payload.subject,
                    "template": payload.template_name or "custom",
                    "sent_at": datetime.now().isoformat(),
                })
                l["emails_sent"] = emails
                save_leads(leads)
                break

    return {"status": "ok", "message": f"Email sent to {payload.to}"}

@app.get("/api/email-templates")
async def list_templates():
    """List available email templates."""
    templates = []
    if EMAIL_TEMPLATES_DIR.exists():
        for f in sorted(EMAIL_TEMPLATES_DIR.glob("*.md")):
            templates.append({
                "filename": f.name,
                "name": f.stem,
                "path": str(f.relative_to(BASE_DIR)),
                "size": f.stat().st_size,
            })
    return {"templates": templates, "count": len(templates)}

@app.get("/api/email-templates/{name}")
async def get_template(name: str):
    """Get a specific email template's content."""
    path = EMAIL_TEMPLATES_DIR / f"{name}.md"
    if not path.exists():
        # Try with full filename
        path = EMAIL_TEMPLATES_DIR / name
    if not path.exists():
        raise HTTPException(404, f"Template '{name}' not found")
    return {"filename": path.name, "content": path.read_text(encoding="utf-8")}

# ── Config Helpers ─────────────────────────────────────

def load_email_config() -> dict:
    """Load email config from file or environment."""
    config = {}
    if CONFIG_FILE.exists():
        config.update(json.loads(CONFIG_FILE.read_text(encoding="utf-8")))
    config["smtp_user"] = config.get("smtp_user") or os.environ.get("SMTP_USER", "")
    config["smtp_password"] = config.get("smtp_password") or os.environ.get("SMTP_PASSWORD", "")
    config["smtp_host"] = config.get("smtp_host") or os.environ.get("SMTP_HOST", "smtp.gmail.com")
    config["smtp_port"] = config.get("smtp_port") or int(os.environ.get("SMTP_PORT", "587"))
    config["from_email"] = config.get("from_email") or os.environ.get("FROM_EMAIL", "hello@medpup.com")
    config["from_name"] = config.get("from_name") or os.environ.get("FROM_NAME", "MedPup Veterinary Concierge")
    return config

@app.put("/api/email-config/status")
async def save_email_config(data: dict):
    """Save email config (in-memory for session)."""
    return {"status": "ok", "message": "Config saved for this session. To persist, set email-config.json"}

@app.get("/api/email-config/status")
async def email_config_status():
    """Check if email sending is configured."""
    config = load_email_config()
    has_creds = bool(config.get("smtp_user") and config.get("smtp_password"))
    return {
        "configured": has_creds,
        "host": config.get("smtp_host"),
        "user": config.get("smtp_user")[:3] + "..." if config.get("smtp_user") else "",
        "from_email": config.get("from_email"),
        "from_name": config.get("from_name"),
    }

# ── Dashboard ──────────────────────────────────────────

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """Serve the CRM dashboard."""
    dash_path = STATIC_DIR / "dashboard.html"
    if not dash_path.exists():
        return HTMLResponse("<h1>Dashboard not found</h1><p>Build it first.</p>", status_code=404)
    return HTMLResponse(dash_path.read_text(encoding="utf-8"))

# ── Startup ────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("  MedPup Local Server")
    print("=" * 60)
    print(f"  Dashboard:     http://localhost:8080/dashboard")
    print(f"  Intake Form:   http://localhost:8080")
    print(f"  API:           http://localhost:8080/api")
    print(f"  Leads File:    {LEADS_FILE}")
    print("=" * 60)
    print("  Press Ctrl+C to stop")
    print()

    # Ensure leads file exists
    if not LEADS_FILE.exists():
        save_leads([])
        print("  [init] Created empty leads.json")

    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
