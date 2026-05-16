# MedPup Operational Templates & Automation

This directory contains standalone, ready-to-use operational assets extracted from the business planning documents.

## Templates

| File | Purpose | Status |
|------|---------|--------|
| `client-service-agreement.md` | Full client agreement with release, indemnification, 12 sections | Draft — needs attorney review |
| `client-onboarding-packet.md` | Post-op care instructions, procedure addendums, packing list | Ready for use |
| `pre-trip-checklist.md` | Fridge-ready 4-phase checklist (1 week → morning of) | Ready for use |
| `partner-clinic-mou.md` | MOU template with price schedule for partner clinics | Draft — needs legal review |
| `referral-partner-agreement.md` | Simple referral agreement for referring vets | Draft — needs legal review |
| `intake-form-schema.json` | JSON Schema for client intake (website, phone, manual) | Ready for use |

## Workflows (n8n)

Import these JSON files into a self-hosted n8n instance:

| File | Automation | Trigger |
|------|-----------|---------|
| `intake-to-crm.json` | Web form → EspoCRM lead → confirmation email + team notification | On form submit |
| `document-reminders.json` | 14-day, 7-day, and 3-day pre-trip email reminders | Every 12h (checks Pre-Trip status) |
| `post-trip-review.json` | Post-trip review request email + CRM field update | 2 days after trip completion |

## Finance

| File | Contents |
|------|----------|
| `trip-ledger.csv` | Example data — 8 trips with real projections through scaling |
| `trip-ledger-template.csv` | Blank template with headers for new entries |
| `projections-scenarios.csv` | 4 scenarios: conservative through scale |
| `vet-outreach-tracker.csv` | Example data — tracking vet referral outreach |
| `procedure-cost-comparison.csv` | 16-procedure cost comparison US vs MedPup |

## Emails

Ready-to-copy email sequences. See `emails/README.md` for sequence order and triggers.

| File | Trigger |
|------|---------|
| `01-booking-confirmation.md` | Immediate after booking + payment |
| `02-three-day-reminder.md` | 3 days before trip |
| `03-day-before-reminder.md` | 1 day before trip |
| `04-post-trip-welcome-home.md` | Same evening after trip |
| `05-three-day-post-op-checkin.md` | 3 days after trip |
| `06-one-week-review-request.md` | 7 days after trip |
| `clinic-partner-outreach.md` | Initial clinic outreach |
| `vet-referral-outreach.md` | Initial vet referral outreach |
