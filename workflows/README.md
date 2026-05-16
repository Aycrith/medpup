# n8n Workflow Files

Import these JSON files into your n8n instance to automate MedPup operations.

## Prerequisites

- n8n instance running (self-hosted or cloud)
- EspoCRM API credentials configured in n8n
- SMTP credentials for sending email

## Import Instructions

1. Open n8n → Workflows → Add Workflow → Import from File
2. Select the JSON file
3. Configure credentials for each node
4. Activate the workflow

## Workflows

| File | Description | Trigger | Nodes |
|------|-------------|---------|-------|
| `intake-to-crm.json` | Creates EspoCRM lead from web form, sends confirmation + team notification | Webhook POST | Webhook, EspoCRM Create Lead, Send Confirmation Email, Notify Team |
| `document-reminders.json` | Sends 14-day, 7-day, and 3-day pre-trip email reminders | Cron (every 12h) | EspoCRM Trigger, 3x Filter, 3x Send Email |
| `post-trip-review.json` | Sends Google review request 2 days post-trip, updates CRM field | Cron (daily) | EspoCRM Trigger, 2x Filter, Send Email, EspoCRM Update |
