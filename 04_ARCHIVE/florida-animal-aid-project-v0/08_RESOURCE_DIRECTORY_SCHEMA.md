# Resource Directory Schema

## Purpose

The resource directory allows operators to match cases with appropriate clinics, shelters, rescues, transporters, food resources, and community support organizations.

## Recommended Tool

Use Airtable or Google Sheets at launch. Airtable is preferred if filtering by ZIP, species, urgency, and resource type.

## Table: Organizations

| Field | Type | Notes |
|---|---|---|
| organization_id | text/autonumber | Unique ID |
| name | text | Official name |
| org_type | multi-select | vet, emergency vet, shelter, animal control, rescue, TNR, wildlife rehab, food pantry, transport, senior support, housing support, other |
| county | text/select | Primary county |
| service_area | text | ZIPs/cities/counties |
| phone | phone | Main number |
| email | email | Intake/contact email |
| website | URL | Public website |
| address | text | If relevant |
| hours | text | Include after-hours info |
| emergency_status | select | 24/7, after-hours, daytime only, not emergency |
| species_accepted | multi-select | dog, cat, wildlife, rabbit, livestock, other |
| accepts_new_clients | select | yes/no/unknown |
| accepts_urgent_cases | select | yes/no/unknown |
| accepts_strays | select | yes/no/unknown |
| accepts_community_cats | select | yes/no/unknown |
| rescue_pricing | select | yes/no/unknown |
| payment_options | text | CareCredit, Scratchpay, payment plan, etc. |
| sponsored_care_allowed | select | yes/no/unknown |
| preferred_contact_method | select | phone/email/form/text/other |
| intake_requirements | long text | What they need before accepting |
| what_not_to_send | long text | Exclusions |
| referral_notes | long text | Internal notes |
| last_verified_at | date | Required |
| verified_by | text | Operator |
| status | select | active, unverified, stale, do not use |

## Resource Types

Use the following normalized categories:

- Emergency Veterinary Hospital
- General Veterinary Clinic
- Low-Cost Veterinary Clinic
- Mobile Veterinarian
- Spay/Neuter Clinic
- County Animal Control
- Public Shelter
- Humane Society
- Foster-Based Rescue
- Breed-Specific Rescue
- Community Cat/TNR Group
- Wildlife Rehab Resource
- Pet Food Pantry
- Transport Resource
- Trainer/Behavior Resource
- Groomer
- Boarding Facility
- Senior Services
- Disability Support
- Domestic Violence Pet Support
- Housing/Pet Retention Support
- Other

## Minimum Launch Resource Counts

Before soft launch:

- 3 emergency veterinary resources,
- 5 general veterinary clinics,
- 2 low-cost/spay-neuter resources if available,
- 1 animal control contact per pilot jurisdiction,
- 1 public shelter contact per pilot jurisdiction,
- 3 rescues,
- 1 community cat/TNR resource if available,
- 1 wildlife routing resource,
- 2 food/supply support options if available,
- 20 total entries minimum.

## Verification Script

Phone/email script:

> Hi, my name is [Name]. I’m building a small non-veterinary animal aid coordination project. We do not diagnose or treat. We are creating a responsible referral directory so we can route people appropriately. Can I confirm what kinds of cases your organization accepts, your preferred contact method, and anything we should not send your way?

## Verification Questions

- Are you accepting new clients/cases?
- What species do you accept?
- Do you accept urgent same-day cases?
- Do you accept strays/found animals?
- Do you work with rescues?
- Do you offer rescue pricing?
- Do you accept payment by a third party for sponsored-care cases?
- Do you handle community cats?
- Do you provide spay/neuter?
- Do you provide euthanasia services?
- Do you offer house calls or mobile care?
- What should never be sent to you?
- What information do you want before a referred case arrives?
- Who should receive structured case summaries?
- How often should we re-verify this information?

## Staleness Rule

Mark a resource as stale if not verified within:

- 30 days for emergency clinics,
- 60 days for veterinary clinics,
- 90 days for rescues/shelters,
- 120 days for food/support resources.

## Acceptance Criteria

- Every active resource has a last verified date.
- Emergency resources are separated from non-emergency resources.
- Animal control/shelter jurisdiction is clear.
- Internal notes distinguish public-facing facts from operator notes.
- Unknown acceptance criteria are marked `unknown`, not assumed.
