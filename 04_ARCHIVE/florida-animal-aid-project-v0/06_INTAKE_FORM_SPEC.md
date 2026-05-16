# Intake Form Specification

## Purpose

The intake form collects structured, observable facts so the project can route cases to appropriate veterinary, rescue, shelter, transport, or support resources.

It must not present itself as a veterinary diagnostic tool.

## Form Header

Title:

> Request Animal Help

Intro text:

> Florida Animal Aid Access Project provides non-veterinary coordination and support. We are not a veterinary clinic and cannot diagnose, prescribe, or treat. If your animal is having trouble breathing, collapsing, seizing, bleeding severely, unable to urinate, possibly poisoned, hit by a car, in heatstroke, or in extreme pain, contact or go to an emergency veterinarian immediately.

## Section 1 — Emergency Warning

Question:

> Is the animal currently showing any of these emergency signs?

Checkboxes:

- Trouble breathing
- Collapse/unconsciousness
- Active seizure or repeated seizures
- Severe bleeding
- Hit by car/major trauma
- Suspected poisoning/toxin exposure
- Unable to urinate or repeatedly trying without producing urine
- Bloated abdomen with distress
- Extreme pain
- Pale/white/blue/gray gums
- Heatstroke signs
- Birthing emergency
- Severe wound
- Major eye trauma
- None of these
- Not sure

If any emergency sign except `None` is selected, display:

> This may be an emergency. We are not a veterinary clinic and cannot diagnose or treat. Please contact or go to an emergency veterinarian now. Submit this form only if doing so does not delay emergency care.

## Section 2 — Requester Information

Fields:

- Full name
- Phone number
- Email
- Preferred contact method: phone / text / email
- City
- ZIP code
- County
- Relationship to animal: owner / finder / foster / rescue volunteer / neighbor / other
- Do you have transportation available? yes / no / limited
- Can you contribute anything toward veterinary care if needed? yes / no / limited / unknown
- Consent to share case details with vets/rescues/shelters: required checkbox

## Section 3 — Animal Information

Fields:

- Species: dog / cat / rabbit / bird / reptile / livestock / wildlife / other
- Breed/type if known
- Estimated age
- Sex: male / female / unknown
- Spay/neuter status: yes / no / unknown
- Approximate weight
- Vaccination status: current / not current / unknown
- Microchip status: yes / no / unknown
- Ownership status: owned / stray / found / foster / community cat / wildlife / unknown
- Current location of animal
- Is the animal contained? yes / no / partially / unknown
- Any bite/aggression risk? yes / no / unknown
- Notes on handling risk

## Section 4 — Situation Details

Fields:

- Main concern
- When did this start?
- Is it getting worse? yes / no / unknown
- Eating normally? yes / no / reduced / unknown
- Drinking normally? yes / no / increased / reduced / unknown
- Urinating normally? yes / no / unknown
- Defecating normally? yes / no / diarrhea / constipation / unknown
- Breathing normally? yes / no / unknown
- Walking/standing normally? yes / no / unknown
- Bleeding? yes / no / unknown
- Vomiting? yes / no / unknown
- Diarrhea? yes / no / unknown
- Seizure/collapse? yes / no / unknown
- Trauma/vehicle injury? yes / no / unknown
- Possible toxin exposure? yes / no / unknown
- Photos/video upload
- What help are you requesting?

## Section 5 — Requested Support

Checkboxes:

- Help finding a vet
- Help finding emergency care
- Help with low-cost options
- Help with transport
- Help with a stray/found animal
- Help contacting a rescue
- Help with pet food/supplies
- Help with rehoming resources
- Help with lost/found posting
- Other

## Section 6 — Consent and Acknowledgment

Required checkboxes:

- I understand this project is not a veterinary clinic.
- I understand this project cannot diagnose, prescribe, or treat.
- I understand emergencies require licensed veterinary care.
- I consent to my submitted information being shared with appropriate vets, rescues, shelters, transporters, or support resources for the purpose of helping this case.
- I understand there is no guarantee of funding, transport, appointment, placement, rescue acceptance, or outcome.

Optional checkbox:

- I consent to follow-up by phone/text/email.

## Submission Confirmation

Display:

> Your request has been received. If this is an emergency, do not wait for a response from us. Contact or go to an emergency veterinarian immediately. If the case is not an emergency, we will review the information and attempt to identify appropriate resources.

## Data Mapping

Map form fields to:

- People table
- Animals table
- Cases table
- Media/Documents table
- Consent records
- Follow-up task

## Acceptance Criteria

- Emergency warning appears before routine intake.
- Form can be completed in under 10 minutes.
- Required disclaimers cannot be skipped.
- Red-flag cases are visually marked in the case board.
- No field asks the project to diagnose.
- No confirmation message implies guaranteed help.
