# Case Board Schema

## Purpose

The case board is the operational center for intake, routing, follow-up, and outcome tracking.

## Recommended Tool

For the first pilot:

- Airtable, Notion, Trello, Linear, or Google Sheets.

Airtable is the best initial fit if you want structured records, filtered views, forms, and lightweight automation.

## Table: Cases

### Required Fields

| Field | Type | Notes |
|---|---|---|
| case_id | text/autonumber | Unique case identifier |
| created_at | datetime | Intake creation time |
| updated_at | datetime | Last update |
| status | single select | See statuses below |
| triage_level | single select | Level 0, 1, 2, 3, Unknown |
| case_type | multi-select | medical concern, transport, stray/found, owner support, food, rehoming, rescue, other |
| requester | linked record | People table |
| animal | linked record | Animals table |
| county | text/select | Pilot-zone routing |
| zip | text | Local routing |
| main_concern | long text | Owner/finder reported |
| red_flags_present | checkbox | Yes/no |
| red_flags_detail | long text | Which red flags |
| transport_needed | select | yes/no/unknown |
| cost_barrier | select | yes/no/limited/unknown |
| consent_to_share | checkbox | Required |
| assigned_operator | user/text | Responsible operator |
| partner_assigned | linked record | Organization |
| next_action | text | Required unless closed |
| next_action_due | datetime | Follow-up trigger |
| outcome | long text | Required before closing when known |
| closure_reason | select | resolved/no response/unable to assist/referred/emergency advised/duplicate/other |

## Statuses

- New
- Needs review
- Emergency advised
- Awaiting owner response
- Referral sent
- Transport needed
- Transport scheduled
- At clinic/shelter/rescue
- Foster needed
- Rescue contacted
- Follow-up required
- Resolved
- Closed no response
- Closed unable to assist

## Table: People

| Field | Type |
|---|---|
| person_id | text/autonumber |
| name | text |
| phone | phone |
| email | email |
| city | text |
| zip | text |
| county | text |
| relationship_to_animal | select |
| transportation_access | select |
| financial_capacity_note | long text |
| preferred_contact_method | select |
| consent_records | linked/doc field |

## Table: Animals

| Field | Type |
|---|---|
| animal_id | text/autonumber |
| species | select |
| breed_type | text |
| estimated_age | text |
| sex | select |
| spay_neuter_status | select |
| weight_estimate | text |
| vaccination_status | select |
| microchip_status | select |
| ownership_status | select |
| behavior_risk | select/long text |
| current_location | text |
| notes | long text |

## Table: Referrals

| Field | Type |
|---|---|
| referral_id | text/autonumber |
| case_id | linked record |
| organization_id | linked record |
| referral_type | select |
| sent_at | datetime |
| sent_by | text/user |
| summary_sent | checkbox |
| response_status | select |
| appointment_status | select |
| outcome | long text |

## Table: Follow-Ups

| Field | Type |
|---|---|
| followup_id | text/autonumber |
| case_id | linked record |
| due_at | datetime |
| method | select |
| assigned_to | text/user |
| completed_at | datetime |
| result | long text |
| next_step | text |

## Table: Audit Log

| Field | Type |
|---|---|
| audit_id | text/autonumber |
| timestamp | datetime |
| actor | text/user |
| case_id | linked record |
| action_type | select |
| before_value | long text |
| after_value | long text |
| notes | long text |

## Required Views

1. New Cases
2. Emergency Advised
3. Needs Review
4. Transport Needed
5. Follow-Up Due Today
6. Overdue Follow-Ups
7. Open Cases by Triage Level
8. Closed Cases
9. Boundary/Risk Review

## Automation Rules

### Emergency Red Flag

If `red_flags_present = true`:
- set status to `Emergency advised`,
- set triage level to `Level 0`,
- create follow-up task within 24 hours,
- flag case in dashboard.

### Missing Consent

If `consent_to_share = false`:
- block referral summary sharing,
- set next action to obtain consent.

### No Next Action

If status is not closed and `next_action` is empty:
- flag as operational error.

### Follow-Up Overdue

If `next_action_due < now` and status is not closed:
- add to overdue view.

## Acceptance Criteria

- Every open case has a next action.
- Every case has one current status.
- Emergency cases are visually distinct.
- Referral sharing is blocked without consent.
- Closed cases have closure reason.
- Follow-ups are visible and actionable.
