#!/usr/bin/env python3
"""
MedPup Email Sender — Send emails via SMTP
Configure SMTP credentials in config or env vars, then use:
    python scripts/send-email.py --to recipient@example.com --subject "Test" --body "Hello"

Supports: Gmail, Outlook, SendGrid, any SMTP server.
"""

import os, sys, argparse, smtplib, json
from email.message import EmailMessage
from pathlib import Path

CONFIG_FILE = Path(__file__).parent.parent / 'email-config.json'

DEFAULTS = {
    'smtp_host': 'smtp.gmail.com',
    'smtp_port': 587,
    'smtp_user': '',
    'smtp_password': '',
    'from_email': 'hello@medpup.com',
    'from_name': 'MedPup Veterinary Concierge',
}

def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return {**DEFAULTS, **json.load(f)}
    return {**DEFAULTS, 'smtp_user': os.environ.get('SMTP_USER', ''),
            'smtp_password': os.environ.get('SMTP_PASSWORD', '')}

def send_email(config, to, subject, body, cc=None, reply_to=None):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"{config['from_name']} <{config['from_email']}>"
    msg['To'] = to
    if cc: msg['Cc'] = cc
    if reply_to: msg['Reply-To'] = reply_to
    msg.set_content(body)
    with smtplib.SMTP(config['smtp_host'], config['smtp_port']) as server:
        server.starttls()
        server.login(config['smtp_user'], config['smtp_password'])
        server.send_message(msg)
    print(f"Email sent to {to}: {subject}")

if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Send email via SMTP')
    p.add_argument('--to', required=True)
    p.add_argument('--subject', required=True)
    p.add_argument('--body', required=True)
    p.add_argument('--cc')
    p.add_argument('--reply-to')
    p.add_argument('--file')
    args = p.parse_args()

    config = load_config()
    if not config['smtp_user'] or not config['smtp_password']:
        print("ERROR: SMTP credentials not configured.")
        print("Set SMTP_USER and SMTP_PASSWORD environment variables,")
        print(f"or create {CONFIG_FILE} with your SMTP credentials.")
        print()
        print("For Gmail: use an App Password from:")
        print("  https://myaccount.google.com/apppasswords")
        sys.exit(1)

    body = open(args.file).read() if args.file else args.body
    send_email(config, args.to, args.subject, body, args.cc, args.reply_to)
