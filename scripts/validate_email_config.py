#!/usr/bin/env python3
"""
MedPup Email Configuration Validator
Tests SMTP connection and authentication for MedPup email setup.
"""

import smtplib
import json
import sys
from pathlib import Path

CONFIG_FILE = Path(__file__).parent.parent / 'email-config.json'

def load_config():
    """Load email configuration from JSON file."""
    if not CONFIG_FILE.exists():
        print(f"ERROR: Configuration file not found: {CONFIG_FILE}")
        print("Please create email-config.json using the template: email-config.template.json")
        sys.exit(1)
    
    with open(CONFIG_FILE) as f:
        return json.load(f)

def test_smtp_connection(config):
    """Test SMTP connection and authentication."""
    try:
        print(f"Connecting to {config['smtp_host']}:{config['smtp_port']}...")
        server = smtplib.SMTP(config['smtp_host'], config['smtp_port'], timeout=10)
        server.ehlo()
        print("Starting TLS encryption...")
        server.starttls()
        server.ehlo()
        print("Attempting authentication...")
        server.login(config['smtp_user'], config['smtp_password'])
        print("SUCCESS: Authentication successful!")
        server.quit()
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"ERROR: Authentication failed: {e}")
        print("Please check:")
        print("  1. Your email address is correct")
        print("  2. You are using an App Password (not your regular password)")
        print("  3. For Gmail: Generate App Password at https://myaccount.google.com/apppasswords")
        print("  4. Your account has 2-Factor Authentication enabled (required for App Passwords)")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"ERROR: Could not connect to SMTP server: {e}")
        print("Please check:")
        print("  1. SMTP host and port are correct")
        print("  2. Your internet connection allows outbound SMTP connections")
        print("  3. No firewall is blocking the connection")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        return False

def main():
    """Main validation function."""
    print("=" * 50)
    print("MedPup Email Configuration Validator")
    print("=" * 50)
    
    config = load_config()
    
    print(f"Configuration loaded from: {CONFIG_FILE}")
    print(f"SMTP Host: {config['smtp_host']}")
    print(f"SMTP Port: {config['smtp_port']}")
    print(f"SMTP User: {config['smtp_user']}")
    print(f"From Email: {config['from_email']}")
    print(f"From Name: {config['from_name']}")
    print()
    
    if test_smtp_connection(config):
        print()
        print("=" * 50)
        print("Email configuration is WORKING! 🎉")
        print("You can now send emails using:")
        print(f"  python scripts/send-email.py --to recipient@example.com --subject \"Test\" --body \"Hello\"")
        print("=" * 50)
        return 0
    else:
        print()
        print("=" * 50)
        print("Email configuration FAILED. Please fix the issues above.")
        print("=" * 50)
        return 1

if __name__ == '__main__':
    sys.exit(main())