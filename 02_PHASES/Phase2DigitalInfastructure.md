I'll structure this as two logical work blocks, each delivering a set of files you can add to your repository. I'll state clearly when to create a new file.

---

### Recommended order of execution

1. **Digital Infrastructure** – deploy website, CRM, automation. This is the backbone; without it, any leads from ads or outreach have nowhere to go.  
2. **Pilot Trip Assets** – the itinerary, email sequences, and review collection workflow. These will be used once the infrastructure is live and the first clients book.

Let’s start with the digital side.

---

## BLOCK 1: DIGITAL INFRASTRUCTURE SETUP

Create a new file: **`Phase2DigitalInfrastructure.md`** and paste everything below the divider.

---

```markdown
# Phase 2: Digital Infrastructure Setup

## 1. Hugo Website Deployment (GitHub Pages / Netlify)

### Prerequisites
- GitHub repository with Hugo site files already created.
- Hugo theme installed (recommended: Ananke or universal).

### Step-by-Step

#### a) Push content to the repo
Copy all markdown content from `Phase1FoundationalBusinessAssets.md` (pages: Home, Freeport, Cancun, TPLO, Dental, FAQ, Pricing, Contact) into the `content/` folder, following Hugo's standard structure:

```
content/
├── _index.md              (Home page)
├── freeport.md
├── cancun.md
├── tplo.md
├── dental.md
├── faq.md
├── pricing.md
├── contact.md
└── get-started.md
```

#### b) Embed the intake form
Replace `content/get-started.md` with the HTML form provided in Phase 1. If your Hugo theme allows raw HTML, just paste it. Otherwise, use a shortcode or embed via an iframe (host the form on a service like Formspree first, if needed). For simplicity, we'll use Netlify's built-in form handling.

**Netlify approach:**
1. Change the form tag to: `<form name="medpup-intake" method="POST" data-netlify="true">`
2. Add `<input type="hidden" name="form-name" value="medpup-intake">`
3. Deploy via Netlify – forms are automatically detected.

#### c) Add Chatwoot live chat
1. Sign up for a free Chatwoot account (cloud or self-hosted).
2. Get the website inbox script from Settings → Inboxes → Website → Configuration.
3. Add the script to `layouts/partials/head.html` (or wherever the theme places head scripts).
4. Test: the widget should appear on all pages.

#### d) Deploy
- **Netlify**: Connect your GitHub repo, configure build command `hugo`, publish directory `public`. Deploy.
- **GitHub Pages**: Use the `peaceiris/actions-gh-pages` GitHub Action. Create `.github/workflows/gh-pages.yml`:

```yaml
name: GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
      - name: Build
        run: hugo --minify
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

Set the custom domain (medpup.com) in repository Settings → Pages.

---

## 2. EspoCRM Setup & Intake Form Integration

### Installation
- Use the official Docker image for a quick start:
```bash
docker run -d -p 8080:80 --name espocrm \
  -e ESPOCRM_DATABASE_HOST=yourdbhost \
  -e ESPOCRM_DATABASE_USER=medpup \
  -e ESPOCRM_DATABASE_PASSWORD=secret \
  -e ESPOCRM_ADMIN_USERNAME=admin \
  -e ESPOCRM_ADMIN_PASSWORD=changeme \
  espocrm/espocrm
```
(Adjust for your hosting environment; or install directly on a VPS with Apache/MySQL.)

### Create Lead Source & Custom Fields
1. Log in as admin → Administration → Entity Manager → Lead.
2. Add fields matching the intake form: `pet_name` (text), `species` (dropdown), `breed`, `age`, `weight`, `procedure` (multi‑enum), `condition_details` (text), `has_diagnosis` (dropdown), `vet_info`, `us_quote` (currency), `destination` (dropdown), `referral_source` (dropdown), `comments` (text).
3. Create a new Lead Source called "Website Intake Form".

### n8n Webhook to CRM Automation
Create a new file: `n8n_workflow_intake_to_crm.json` and paste the following workflow. Import into your n8n instance.

```json
{
  "name": "MedPup: Intake Form → CRM Lead",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "medpup-intake",
        "responseMode": "onReceived",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "entityType": "Lead",
        "fields": {
          "firstName": "={{$json.body.owner_name.split(' ')[0]}}",
          "lastName": "={{$json.body.owner_name.split(' ').slice(1).join(' ')}}",
          "emailAddress": "={{$json.body.email}}",
          "phoneNumber": "={{$json.body.phone}}",
          "pet_name": "={{$json.body.pet_name}}",
          "species": "={{$json.body.species}}",
          "breed": "={{$json.body.breed}}",
          "age": "={{$json.body.age}}",
          "weight": "={{$json.body.weight}}",
          "procedure": "={{$json.body.procedure}}",
          "condition_details": "={{$json.body.condition_details}}",
          "has_diagnosis": "={{$json.body.has_diagnosis}}",
          "vet_info": "={{$json.body.vet_info}}",
          "us_quote": "={{$json.body.us_quote}}",
          "destination": "={{$json.body.destination}}",
          "referral_source": "={{$json.body.referral_source}}",
          "comments": "={{$json.body.comments}}",
          "source": "Website Intake Form"
        }
      },
      "name": "EspoCRM Create Lead",
      "type": "n8n-nodes-base.espocrm",
      "typeVersion": 1,
      "position": [450, 300],
      "credentials": {
        "espocrm": "EspoCRM API"
      }
    },
    {
      "parameters": {
        "fromEmail": "hello@medpup.com",
        "toEmail": "={{$json.body.email}}",
        "subject": "We received your MedPup inquiry",
        "text": "Hi {{$json.body.owner_name.split(' ')[0]}},\n\nThanks for reaching out! We've received your information and will be in touch within 24 hours to schedule your free consultation.\n\nIn the meantime, check our FAQ: https://medpup.com/faq\n\nBest,\nThe MedPup Team"
      },
      "name": "Send Confirmation Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "smtp": "MedPup SMTP"
      }
    }
  ]
}
```

**Instructions:**
1. In n8n, go to Credentials → add EspoCRM API (host + API key).
2. Add SMTP credentials for sending email (use SendGrid, Brevo, or similar free tier).
3. Import the workflow. Activate it.
4. Set your webhook URL in the website form action: `https://<your-n8n-domain>/webhook/medpup-intake`.

### Document Reminder n8n Workflow
Create `n8n_workflow_document_reminders.json`:

```json
{
  "name": "MedPup: Document Reminder Sequence",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "days", "value": 3}]
        },
        "entityType": "Lead"
      },
      "name": "EspoCRM Trigger",
      "type": "n8n-nodes-base.espocrmTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "credentials": {
        "espocrm": "EspoCRM API"
      }
    },
    {
      "parameters": {
        "filters": {
          "conditions": [
            {"field": "status", "value": "Pre-Trip", "operator": "eq"}
          ]
        }
      },
      "name": "Filter Active Clients",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "template": "Reminder: Your pet's trip to Freeport is in {{$json.trip_date}} days! Please ensure you have:\n- USDA health certificate\n- Rabies vaccination certificate\n- Screwworm inspection certificate (Mexico only)\n- Comfortable carrier & leash\n\nNeed help? Reply here.",
        "to": "={{$json.emailAddress}}"
      },
      "name": "Send SMS/Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ]
}
```

(Repeat for other intervals; or use n8n's built-in scheduler.)

---

## 3. Google Business Profile Optimization (Checklist)

Follow the Phase1 GBP checklist to:
- Claim and verify.
- Fill out every field.
- Add photos (use clinic photos once available).
- Write a welcome post.
- Set up messaging if desired.
- Link to website.
```

---

Once you've created `Phase2DigitalInfrastructure.md` and the two n8n JSON files, move to the second block.

---

## BLOCK 2: PILOT TRIP ASSETS

Create a new file: **`Phase2PilotTripAssets.md`** and paste the content below.

---

```markdown
# Phase 2: Freeport Pilot Trip Assets

## 1. 5-Client Day-Trip Itinerary (Template)

Use this for the first trip. Replace bracketed values with actual data.

```
### MedPup Freeport Day-Trip Itinerary
**Date:** [Date, e.g., Saturday, June 14, 2026]

| Time (ET) | Activity | Location/Notes |
|-----------|----------|----------------|
| 6:00 AM   | Concierge meets clients at Balearia Terminal | Port Everglades, Terminal 21 |
| 6:30 AM   | Check-in & boarding | Group booking ref: [X] |
| 7:00 AM   | Ferry departure (Balearia Caribbean) | 3-hour crossing |
| 10:00 AM  | Arrive Freeport Harbour | Clear Bahamas Customs (show pet documents) |
| 10:30 AM  | Walk pets (relief area near port) | Use leash, carry bags |
| 11:00 AM  | Arrive at Freeport Veterinary Hospital | [Clinic address] |
| 11:15 AM  | Check-in, paperwork, pre-op exam | Each pet individually |
| 12:00 PM  | Surgeries begin (order by length) | Concierge stays on-site |
| 1:00 PM   | Lunch break (concierge can rotate) | Nearby café |
| 3:00 PM   | Expected finish for all pets | Post-op instructions given |
| 3:30 PM   | Return to harbour | Rest pets in carriers |
| 4:30 PM   | Ferry check-in for return | |
| 5:00 PM   | Ferry departure | |
| 8:00 PM   | Arrive Port Everglades | Clear U.S. Customs (pets inspected) |
| 8:30 PM   | Disembark, clients drive home | |
```

## 2. Pre-Trip Email Sequence (5-Day Drip)

These emails are sent automatically once a client books. Set up in n8n or manually.

### Email 1: Booking Confirmation (immediate)
**Subject:** Welcome to MedPup – Your Trip to Freeport is Confirmed!

Hi [Owner First Name],

Your pet [Pet Name] is now booked for the MedPup day-trip on [Trip Date]. We’re thrilled to help make this surgery affordable and stress-free.

**What’s included:**
- Round-trip ferry from Fort Lauderdale
- All pet import/export paperwork
- Clinic liaison & on-site concierge
- Post-op monitoring until you’re home

**What you need to do now (please read carefully):**
1. Obtain a USDA-accredited health certificate within 10 days of travel. [List of accredited vets link]
2. Ensure rabies vaccination is up to date (bring certificate).
3. Bring a secure, airline-approved carrier or leash/harness.
4. Fast your dog from midnight the night before (water is okay).

We’ll send more tips as the date approaches. If you have questions, reply to this email or call [phone].

Warmly,
The MedPup Team

---

### Email 2: 3 Days Before Trip
**Subject:** 3 Days to Go – Final Checklist

Hi [Owner First Name],

The big day is almost here! A few reminders:

[ ] Double-check you have the original USDA health certificate and rabies certificate.
[ ] Pack: poop bags, a small blanket for the ferry, any regular medications.
[ ] No food after midnight the night before – just water until 6 AM.
[ ] Arrive at Balearia Terminal (Port Everglades, Terminal 21) by **6:00 AM** sharp.

Our concierge, [Concierge Name], will be waiting in the terminal wearing a bright blue MedPup polo. They’ll handle everything from there.

See you Saturday!

The MedPup Team

---

### Email 3: Day Before Trip
**Subject:** Tomorrow is the Day! – Last-Minute Info

Hi [Owner First Name],

Just a quick note – we’ll be on the 7 AM ferry. The weather looks [weather forecast]. In case of any delay, we will text you at the number on file.

Please don’t hesitate to call [phone] if anything comes up tonight.

Goodnight,
MedPup

---

### Email 4: Post-Trip (same evening)
**Subject:** Welcome Home – Post-Op Care & Review

Hi [Owner First Name],

You and [Pet Name] did great today! We hope you’re both settled in.

**Post-op instructions** are attached. Please follow them closely. Your U.S. vet can also review them at the follow-up appointment (we recommend scheduling within 14 days).

We’d be so grateful if you could leave us a review on Google – it helps other pet parents find this option: [Google Review Link]

And if you capture any cute “recovery” photos, tag us on Instagram @MedPupOfficial!

Thank you for trusting us with [Pet Name]’s care.

The MedPup Team
```

## 3. Post-Trip Review Collection Workflow

Create `n8n_workflow_review_request.json`:

```json
{
  "name": "MedPup: Post-Trip Google Review Request",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "days", "value": 2}]
        },
        "entityType": "Lead"
      },
      "name": "EspoCRM Trigger (Post-Trip)",
      "type": "n8n-nodes-base.espocrmTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status}}",
              "operation": "equals",
              "value2": "Trip Completed"
            }
          ]
        }
      },
      "name": "Filter Completed Trips",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "toEmail": "={{$json.emailAddress}}",
        "subject": "How did we do? Leave a Google Review",
        "text": "Hi {{$json.owner_first_name}},\n\nWe hope [Pet Name] is recovering well! If you have a moment, we'd love a Google review about your MedPup experience. Your review helps other owners discover affordable pet surgery options.\n\nLeave a review: [Your Google Review Link]\n\nThank you!\nMedPup"
      },
      "name": "Send Review Request Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ]
}
```

## 4. Client Packet (PDF/Print)

Create a one-page PDF from this markdown (use Pandoc or similar) to hand clients at check-in:

```
# MedPup Client Packet – Freeport Trip

**Trip Date:** [Date]  
**Concierge:** [Name, Phone]

## Emergency Contacts
- Freeport Veterinary Hospital: [Phone]
- Balearia Caribbean Port Agent: [Phone]
- MedPup 24h line: [Phone]

## Schedule
- 6:00 AM Meet at terminal
- 7:00 AM Ferry departure
- 11:00 AM Clinic arrival
- 3:30 PM Return to harbour
- 8:00 PM Arrive Fort Lauderdale

## What to Bring
- Leash and collar/harness
- Secure carrier (if small dog)
- USDA health certificate (original)
- Rabies certificate
- Any regular medication
- Water for yourself (light snack)

## Post-Op Care Quick Guide
- Keep your dog calm for 7 days (leash walks only)
- Do not get incision wet
- Use e-collar as directed
- Give medications exactly as prescribed
- Call your regular vet for any concerns
- Follow-up exam with your vet within 14 days

## We’re Here for You
Questions? Call [Concierge Phone] or the 24h line.
```
```

---

## Next Step After These Two Blocks

When both **Phase2DigitalInfrastructure.md** and **Phase2PilotTripAssets.md** are populated in your repository, the immediate action is:

1. Deploy the website and test the intake form → CRM → email flow.
2. Reach out to Freeport Veterinary Hospital (use the Partner Outreach email from Phase 1) and schedule the clinic audit.
3. Once both are confirmed, launch the Google Ads campaign with the geo-fencing copy.
4. Book the first 5 clients.

Would you like me to now draft the **direct outreach email to Freeport Veterinary Hospital** (personalized with clinic name and specific price negotiation language), or would you prefer to review the infrastructure files first?