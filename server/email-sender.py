#!/usr/bin/env python3
"""
MedPup Email Automation — Send email templates to leads.
Usage:
  python server/email-sender.py --lead LEAD_ID --template 01-booking-confirmation --config email-config.json

Requires email-config.json with SMTP credentials, or env vars:
  SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, FROM_NAME

Examples:
  # Send booking confirmation to a lead
  python server/email-sender.py --lead abc123 --template 01-booking-confirmation

  # Send with explicit config
  python server/email-sender.py --lead abc123 --template 03-day-before-reminder --config path/to/config.json

  # Send custom email (no template)
  python server/email-sender.py --to client@example.com --subject "Your quote" --body "Here is your estimate..."

  # List all leads
  python server/email-sender.py --list

  # List templates
  python server/email-sender.py --list-templates
"""

import argparse
import json
import os
import re
import smtplib
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
LEADS_FILE = BASE_DIR / "server" / "leads.json"
EMAIL_DIR = BASE_DIR / "emails"

# ── Config ─────────────────────────────────────────────

def load_config(config_path=None):
    """Load SMTP config from file or environment."""
    cfg = {
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_password": "",
        "from_email": "hello@medpup.com",
        "from_name": "MedPup Veterinary Concierge",
    }

    # Try explicit config file
    if config_path:
        path = Path(config_path)
        if path.exists():
            cfg.update(json.loads(path.read_text(encoding="utf-8")))

    # Try default config file
    config_file = BASE_DIR / "email-config.json"
    if config_file.exists():
        cfg.update(json.loads(config_file.read_text(encoding="utf-8")))

    # Environment overrides
    cfg["smtp_user"] = cfg.get("smtp_user") or os.environ.get("SMTP_USER", "")
    cfg["smtp_password"] = cfg.get("smtp_password") or os.environ.get("SMTP_PASSWORD", "")
    cfg["smtp_host"] = os.environ.get("SMTP_HOST", cfg["smtp_host"])
    cfg["smtp_port"] = int(os.environ.get("SMTP_PORT", cfg["smtp_port"]))
    cfg["from_email"] = os.environ.get("FROM_EMAIL", cfg["from_email"])
    cfg["from_name"] = os.environ.get("FROM_NAME", cfg["from_name"])

    return cfg

# ── Data ───────────────────────────────────────────────

def load_leads():
    if LEADS_FILE.exists():
        return json.loads(LEADS_FILE.read_text(encoding="utf-8"))
    return []

def find_lead(lead_id):
    leads = load_leads()
    for l in leads:
        if l["id"] == lead_id:
            return l
    return None

def save_leads(leads):
    LEADS_FILE.write_text(json.dumps(leads, indent=2), encoding="utf-8")

def log_email_to_lead(lead_id, to, subject, template_name):
    """Record a sent email in the lead's history."""
    leads = load_leads()
    for l in leads:
        if l["id"] == lead_id:
            emails = l.get("emails_sent", [])
            emails.append({
                "to": to,
                "subject": subject,
                "template": template_name,
                "sent_at": datetime.now().isoformat(),
            })
            l["emails_sent"] = emails
            save_leads(leads)
            return True
    return False

# ── Templates ──────────────────────────────────────────

def list_templates():
    """List available email templates."""
    if not EMAIL_DIR.exists():
        return []
    templates = []
    for f in sorted(EMAIL_DIR.glob("*.md")):
        templates.append({
            "filename": f.name,
            "name": f.stem,
            "size": f.stat().st_size,
        })
    return templates

def load_template(template_name):
    """Load a template and extract frontmatter + body."""
    path = EMAIL_DIR / f"{template_name}.md"
    if not path.exists():
        return None, None, None

    content = path.read_text(encoding="utf-8")
    subject = None
    body = content

    # Extract YAML frontmatter
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = parts[2].strip()
            # Extract subject from frontmatter
            m = re.search(r'^subject:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
            if m:
                subject = m.group(1).strip()

    return subject, body, str(path)

def fill_template(template_body, lead):
    """Replace placeholder variables with lead data."""
    replacements = {
        "[Owner First Name]": lead.get("owner_name", "").split()[0] if lead.get("owner_name") else "there",
        "[Owner Name]": lead.get("owner_name", "there"),
        "[Pet Name]": lead.get("pet_name", "your pet"),
        "[Trip Date]": "[Trip Date]",  # Not in lead data, leave as-is
        "[Phone]": lead.get("phone", ""),
        "[Procedure]": lead.get("procedure", "surgery").replace("-", " "),
    }

    result = template_body
    for key, val in replacements.items():
        result = result.replace(key, val)

    return result

# ── Sending ────────────────────────────────────────────

def send_email(cfg, to, subject, body, dry_run=False):
    """Send an email via SMTP."""
    if dry_run:
        print(f"[DRY RUN] Would send to: {to}")
        print(f"  Subject: {subject}")
        print(f"  Body ({len(body)} chars):")
        print(f"  {body[:200]}...")
        return True

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{cfg['from_name']} <{cfg['from_email']}>"
    msg["To"] = to
    msg.set_content(body)

    with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"]) as server:
        server.starttls()
        server.login(cfg["smtp_user"], cfg["smtp_password"])
        server.send_message(msg)

    return True

# ── CLI ────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="MedPup Email Sender")
    p.add_argument("--lead", help="Lead ID to send email to")
    p.add_argument("--template", help="Template name (e.g., 01-booking-confirmation)")
    p.add_argument("--to", help="Override recipient email")
    p.add_argument("--subject", help="Override subject line")
    p.add_argument("--body", help="Override email body text")
    p.add_argument("--config", help="Path to email config JSON")
    p.add_argument("--dry-run", action="store_true", help="Preview without sending")
    p.add_argument("--list-templates", action="store_true", help="List available templates")
    p.add_argument("--list", action="store_true", help="List leads")
    p.add_argument("--show", help="Show lead details by ID")

    args = p.parse_args()

    # List templates
    if args.list_templates:
        templates = list_templates()
        print(f"{'Template Name':<35} {'Size':>8}")
        print("-" * 45)
        for t in templates:
            print(f"{t['name']:<35} {t['size']:>8}")
        return

    # List leads
    if args.list:
        leads = load_leads()
        if not leads:
            print("No leads found.")
            return
        print(f"{'ID':<10} {'Name':<20} {'Pet':<15} {'Status':<12} {'Procedure':<20}")
        print("-" * 80)
        for l in leads:
            print(f"{l['id']:<10} {l.get('owner_name','?'):<20} {l.get('pet_name','?'):<15} "
                  f"{l.get('status','new'):<12} {l.get('procedure','?'):<20}")
        print(f"\n{len(leads)} total leads")
        return

    # Show lead details
    if args.show:
        lead = find_lead(args.show)
        if not lead:
            print(f"Lead '{args.show}' not found.")
            sys.exit(1)
        print(json.dumps(lead, indent=2))
        return

    # Send email
    if not args.lead and not args.to:
        p.error("Either --lead or --to must be provided")

    # Resolve lead
    lead = None
    if args.lead:
        lead = find_lead(args.lead)
        if not lead:
            print(f"Error: Lead '{args.lead}' not found.")
            sys.exit(1)
        print(f"Using lead: {lead['owner_name']} ({lead['pet_name']})")

    # Resolve recipient
    to = args.to or (lead.get("email") if lead else None)
    if not to:
        print("Error: No recipient email. Provide --to or use a lead with an email.")
        sys.exit(1)

    # Load config
    cfg = load_config(args.config)

    # Build email content
    if args.template:
        subject, body, path = load_template(args.template)
        if not body:
            print(f"Error: Template '{args.template}' not found.")
            print(f"  Looked in: {EMAIL_DIR}")
            sys.exit(1)
        if lead:
            body = fill_template(body, lead)
        print(f"Loaded template: {path}")

    if args.subject:
        subject = args.subject
    if args.body:
        body = args.body

    if not subject or not body:
        print("Error: No subject or body. Provide --template, --subject, or --body.")
        sys.exit(1)

    # Send
    try:
        template_name = args.template or "custom"
        if args.dry_run:
            send_email(cfg, to, subject, body, dry_run=True)
            return

        if not cfg["smtp_user"] or not cfg["smtp_password"]:
            print("Error: SMTP not configured.")
            print("  Set email-config.json or environment variables:")
            print("    SMTP_USER=your.email@gmail.com")
            print("    SMTP_PASSWORD=your-app-password")
            print("  Get an App Password at: https://myaccount.google.com/apppasswords")
            sys.exit(1)

        send_email(cfg, to, subject, body)
        print(f"✓ Email sent to {to}: {subject}")
        if args.lead:
            log_email_to_lead(args.lead, to, subject, template_name)
            print(f"✓ Logged to lead {args.lead}")
    except smtplib.SMTPAuthenticationError:
        print("Error: SMTP authentication failed.")
        print("  For Gmail, use an App Password (not your regular password):")
        print("  https://myaccount.google.com/apppasswords")
        sys.exit(1)
    except Exception as e:
        print(f"Error sending email: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
