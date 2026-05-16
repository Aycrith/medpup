# Partner Outreach Tracker Schema

## Purpose

Track outreach to clinics, shelters, rescues, mobile vets, food resources, transporters, and community organizations.

## Table: Outreach Targets

| Field | Type | Notes |
|---|---|---|
| target_id | text/autonumber | Unique ID |
| organization_name | text | Name |
| organization_type | select/multi-select | Vet, emergency vet, shelter, rescue, TNR, food, transport, etc. |
| county | text/select | Service area |
| city | text | City |
| zip | text | ZIP |
| website | URL | Public site |
| main_phone | phone | Public phone |
| main_email | email | Public email |
| contact_person | text | If known |
| contact_role | text | Manager, doctor, intake, etc. |
| preferred_contact | select | phone/email/form/in-person/unknown |
| outreach_status | select | not contacted, contacted, replied, call scheduled, interested, not interested, do not contact, needs follow-up |
| first_contact_date | date | Date |
| last_contact_date | date | Date |
| next_followup_date | date | Date |
| accepts_referrals | select | yes/no/maybe/unknown |
| accepts_urgent_cases | select | yes/no/unknown |
| accepts_sponsored_care | select | yes/no/unknown |
| accepts_structured_summaries | select | yes/no/unknown |
| what_they_accept | long text | Case types |
| what_not_to_send | long text | Exclusions |
| requested_workflow | long text | Their preferred process |
| notes | long text | Internal |
| priority | select | high/medium/low |

## Outreach Priority Order

1. Emergency veterinary hospitals.
2. General-practice vets accepting new clients.
3. Low-cost spay/neuter or wellness providers.
4. County animal services / public shelter.
5. Humane societies.
6. Foster-based rescues.
7. TNR/community cat organizations.
8. Pet food/supply programs.
9. Mobile vets.
10. Senior/disability/housing support organizations.
11. Trainers/groomers/boarding facilities.
12. Transport volunteers or services.

## Email Script

Subject: Local animal aid coordination project — referral/transport support

Hello Dr. [Name] / [Clinic Team],

I’m building a small Florida-based animal aid coordination project focused on helping owners and animals reach appropriate care faster. We are not operating as a veterinary clinic and will not diagnose, prescribe, or treat. The goal is to help with intake, documentation, transportation coordination, owner communication, and routing cases to licensed providers and rescue partners.

I’m reaching out to ask whether your clinic is open to any of the following:

- being listed as a referral option for appropriate cases,
- receiving structured case summaries with photos/video before an appointment,
- advising what kinds of cases you can or cannot accept,
- discussing a limited sponsored-care or rescue-rate arrangement later,
- partnering on occasional low-cost wellness or community support days if legally and operationally appropriate.

I can provide clean case summaries, reduce back-and-forth with owners, help coordinate transport, and keep follow-up records. I’m especially trying to help animals whose owners are overwhelmed, low-income, elderly, disabled, or unable to navigate the system quickly.

Would you be open to a short call or email exchange about what kind of referral workflow would be useful for your clinic?

Thank you,  
[Name]  
[Phone]  
[Website]

## Phone Script

> Hi, my name is [Name]. I’m starting a small animal aid coordination project in the area. We are not a veterinary clinic and we do not diagnose or treat. We help owners document cases, arrange transport, and connect with licensed vets or rescues. I’m trying to build a responsible referral list and understand what kinds of cases your clinic can accept, whether you have same-day availability, and whether there is a preferred way to send structured case information. Who would be the best person to speak with?

## Vet Clinic Questions

- Do you accept new clients?
- Do you accept urgent same-day cases?
- Do you offer payment plans or third-party financing?
- Do you work with rescues?
- Do you offer rescue pricing?
- Do you accept sponsored-care cases paid by a third party?
- Do you handle feral/community cats?
- Do you perform spay/neuter?
- Do you provide euthanasia services?
- Do you offer house calls or mobile care?
- What should never be sent to you?
- What emergency clinics do you recommend after hours?
- What information do you want before a referred case arrives?

## Rescue/Shelter Questions

- What species do you accept?
- Are you intake-open or intake-closed?
- Do you accept owner surrenders?
- Do you accept strays/found animals?
- Do you require animal control routing first?
- Do you accept medical cases?
- Do you accept behavior cases?
- Do you have foster capacity?
- What photos/video/details help you review a case?
- What should not be sent to you?
- Who is the best intake contact?

## Acceptance Criteria

- At least 20 targets before soft launch.
- Every target has outreach status.
- Every reply is logged.
- Every interested partner has preferred workflow documented.
- `Do not contact` targets are respected.
- Follow-up dates are used.
