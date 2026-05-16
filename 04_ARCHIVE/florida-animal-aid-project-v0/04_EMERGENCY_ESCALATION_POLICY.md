# Emergency Escalation Policy

## Purpose

This policy prevents the project from delaying emergency veterinary care.

The project does not diagnose emergencies. It identifies reported red flags and directs the requester to emergency veterinary care immediately.

## Emergency Red Flags

Treat the following as Level 0 emergency indicators:

- trouble breathing,
- choking,
- collapse,
- unconsciousness,
- active seizure,
- repeated seizures,
- severe bleeding,
- hit by car,
- fall from height,
- major trauma,
- suspected poisoning or toxin exposure,
- inability to urinate,
- repeated unsuccessful attempts to urinate,
- bloated abdomen with distress,
- extreme pain,
- pale, white, blue, or gray gums,
- heatstroke signs,
- severe weakness,
- birthing emergency,
- severe wounds,
- deep puncture wounds,
- major eye trauma,
- eye out of socket/proptosis,
- animal is too unstable for non-professional transport.

## Standard Emergency Message

Use exactly this or very close language:

> Based on what you reported, this may be an emergency. We are not a veterinary clinic and cannot diagnose or treat. Please contact or go to an emergency veterinarian now. We can help locate emergency options or coordinate transport only if doing so does not delay care.

## Phone Script

> I need to stop here because what you described may be an emergency. We are not a veterinary clinic, and we cannot tell you it is safe to wait. Please contact or go to an emergency veterinarian now. If you need help finding the nearest emergency clinic, I can help look for options, but care should not be delayed for our intake process.

## Text/SMS Script

> This may be an emergency. We are not a vet clinic and cannot diagnose/treat. Please contact or go to an emergency veterinarian now. If you need help locating emergency options, reply with your ZIP code. Do not wait for our intake if your animal is unstable.

## Email/Form Auto-Response

> If this is an emergency, do not wait for an email response. Contact or go to an emergency veterinarian immediately. Emergency signs include trouble breathing, collapse, seizures, severe bleeding, inability to urinate, suspected poisoning, major trauma, heatstroke, pale/blue gums, or extreme pain.

## Emergency Case Workflow

1. Identify red flag.
2. Stop routine intake if continuing would delay care.
3. Send emergency script.
4. Ask ZIP only if needed to locate emergency clinics.
5. Provide nearest known emergency options if available.
6. Offer transport coordination only if safe and faster than alternatives.
7. Mark case status as `Emergency advised`.
8. Log date/time and message sent.
9. Schedule follow-up.
10. Record owner decision if known.

## What Not to Do

Do not:

- tell the owner the case is or is not truly an emergency,
- provide treatment instructions,
- suggest medication doses,
- suggest home monitoring instead of emergency care,
- continue a long intake when emergency signs are present,
- imply the project is dispatching emergency medical help,
- promise transport,
- promise payment,
- pressure a clinic to accept without proper handoff.

## Emergency Resource Directory Fields

Each emergency clinic record should include:

- clinic name,
- phone,
- address,
- website,
- hours,
- 24/7 status,
- species accepted,
- payment options,
- whether calling ahead is required,
- distance from pilot ZIPs,
- last verified date.

## Emergency Documentation

For every Level 0 case, record:

- case ID,
- reported red flag,
- time red flag identified,
- emergency message sent,
- resources provided,
- whether transport was requested,
- whether transport was offered,
- owner/finder decision if known,
- follow-up result.
