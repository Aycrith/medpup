# MedPup Email Sequences

All emails are frontmatter-tagged with their trigger condition. Copy-paste into your email tool (n8n, phpList, Listmonk, or manual) and fill `[bracketed fields]`.

## Client Email Sequence

| Order | File | Trigger |
|-------|------|---------|
| 1 | `01-booking-confirmation.md` | Immediately after booking + concierge fee paid |
| 2 | `02-three-day-reminder.md` | 3 days before trip date |
| 3 | `03-day-before-reminder.md` | 1 day before trip date |
| 4 | `04-post-trip-welcome-home.md` | Same evening after trip return |
| 5 | `05-three-day-post-op-checkin.md` | 3 days post-trip |
| 6 | `06-one-week-review-request.md` | 7 days post-trip |

## Outreach Emails

| File | Recipient | Purpose |
|------|-----------|---------|
| `clinic-partner-outreach.md` | International partner clinics | Establish referral partnership |
| `vet-referral-outreach.md` | Florida general practice vets | Build referral pipeline |

## Setup Notes

- **From address:** Use `hello@medpup.com` for all client-facing emails
- **Reply-to:** Set to concierge's direct email for client sequences
- **Tracking:** Add UTM parameters to any links for Google Analytics
- **Personalization:** Replace `[bracketed fields]` with actual data from CRM
