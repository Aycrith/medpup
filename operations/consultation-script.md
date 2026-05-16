# MedPup Consultation Script

> **Version:** 1.0 | **Last Updated:** May 2026  
> **Purpose:** Convert a free consultation call into a booked trip  
> **Duration:** 15 minutes  
> **Goal:** Client signs the Service Agreement and pays the concierge fee  

---

## Before the Call (5 min prep)

1. Open the client's intake form submission. Read their answers.
2. Open the **Procedure Cost Comparison** (`finance/procedure-cost-comparison.csv`) — know the MedPup price for their procedure.
3. Calculate estimated savings: `U.S. quote - (concierge fee + clinic cost)`
4. If Freeport trip, confirm CareCredit is available.
5. Have the **Client Service Agreement** (`templates/client-service-agreement.md`) ready to send immediately after the call.

---

## The Call (15 minutes)

### 1. Opening (1 min)

> *"Hi [Name], this is [Your Name] from MedPup. Thanks for taking time to talk about [Pet Name]. I know this is a stressful situation — let's see if we can make it better.*

> *Here's what I'm thinking for our time: I'll spend about 2 minutes explaining how MedPup works, then we'll talk about [Pet Name]'s specific situation and what the options look like. Fair enough?"*

**Why this works:** Sets expectations, shows empathy, gives the client control.

### 2. The MedPup Value Prop (2 min)

> *"The short version is: MedPup organizes day-trips from Fort Lauderdale to an accredited clinic in Freeport, Bahamas — just a 3-hour ferry ride. We handle every piece of paperwork, every permit, every booking. A concierge stays with you and [Pet Name] the entire day. You show up, we handle the rest.*

> *"The same surgery — same techniques, same equipment, same sterile protocols — costs about [60-80]% less because the clinic operates in a different cost environment. Your CareCredit works there. Your regular vet does the follow-up here. You're not cutting corners — you're just traveling to a place where the same care costs less."*

### 3. Qualification Questions (5 min)

Listen more than you talk. Take notes.

**Medical Qualification:**
> *"Has your vet given you a firm diagnosis for [Pet Name]?"*
- If YES: "What exactly did they say?"
- If NO: "We'll need a diagnosis from your vet before we can proceed. I can help you get that."

> *"What procedure did they recommend?"*
- Match to MedPup's capability. Dental/mass removal/spay → Freeport. TPLO/IVDD/oncology → Cancun.

> *"Do you have a written estimate from your vet?"*
- "What was the number?" → **Write it down. This is the anchor price.**

> *"Is [Pet Name] generally healthy otherwise? Any chronic conditions, medications, or allergies?"*

**Motivation Check:**
> *"What made you reach out to us?"*
- Listen for the pain point. Common answers:
  - "I can't afford $5,000"
  - "My vet said I have no good options"
  - "I don't want to surrender my dog"
  - "I heard about this from a friend"

**Decision-Maker Check:**
> *"Is this decision yours to make, or is there someone else who needs to be part of this conversation?"*

### 4. Build the Package (3 min)

> *"Based on what you've told me, here's what I'd recommend:"*

**For Freeport (dental, mass removal, spay):**
> *"We do a same-day trip. You and [Pet Name] take the 7 AM ferry from Fort Lauderdale. You're at the clinic by 11. Surgery happens. You're back in Florida by 8 PM. I'm with you the entire day — from the terminal to the clinic and back."*

> *"Here's how the numbers work:*
> - *The MedPup concierge fee is $900 — that covers your ferry tickets, all the permits and paperwork, the clinic coordination, and me as your concierge*
> - *The clinic fee is paid directly to them — for [procedure], that's approximately $[amount]*
> - *Your CareCredit works at the clinic*
> - *Total: about $[total]. Compared to your quote of $[US quote], you save $[savings]."*

**For Cancun (TPLO, IVDD, oncology):**
> *"We arrange a 4-day trip: Thursday through Sunday. Group charter from Miami — 1.5 hours. You recover in a private villa with 24/7 monitoring. The concierge fee is $1,500, which covers flights, villa, all permits, and on-site support. The clinic fee is approximately $[amount], paid directly to them."*

### 5. Objection Handling (2 min)

**Objection: "Is it really the same quality?"**
> *"That's the #1 question I get, and it's fair. Here's the honest answer: the surgeon at our partner clinic went to the same veterinary schools, uses the same techniques, and operates with the same equipment as U.S. specialists. The difference isn't quality — it's that the cost of doing business is lower there. We inspect every clinic in person before we partner with them. I'm happy to share the inspection report."*

**Objection: "I'm worried about safety."**
> *"Your dog would be under general anesthesia, just like in the U.S. The clinic has monitoring equipment, emergency protocols, and a licensed vet on-site. I'm there the whole time. Your U.S. vet gets a complete surgical report and the surgeon is available for follow-up questions. And your vet does the 14-day recheck here."*

**Objection: "What if there are complications?"**
> *"The clinic has emergency protocols in place. If something happens during the trip, the attending vet handles it — the same way a U.S. clinic would. We stay in close communication with you. And our 24-hour line is available after you're home."*

**Objection: "Is this legal?"**
> *"Absolutely. Over 36,000 dogs crossed from the U.S. into Mexico for care last year. USDA APHIS has clear regulations for pet re-entry. We handle 100% of the paperwork. Everything we do is within the law."*

**Objection: "I need to think about it."**
> *"Totally understand. Most families feel that way at first. Here's what I'd suggest — let me send you the exact quote in writing with the full cost breakdown. There's zero pressure. Take a look, talk it over with your family, and if it makes sense, we'll get you booked."*

**Objection: "Can I talk to someone who's done this?"**
> *"Not yet — we're launching. But I can share detailed information about the clinic, the surgeon's credentials, and our inspection report. You can also call the clinic directly if you'd like."*

### 6. The Ask (2 min)

If the client seems ready:

> *"Here's what I'd recommend as a next step: I'll send you the Client Service Agreement and an invoice for the $900 concierge fee. Once that's paid, you're officially booked. Then I'll send you our pre-trip checklist with everything you need to do, and I'll be your point of contact from now until you're safely back home.*

> *"Does that work for you?"*

If the client needs time:

> *"I'm going to send you a summary of what we discussed with the exact cost breakdown. Take a look, talk it over, and reply or call me at [phone]. I'll hold [date] as a potential trip date for 48 hours. Does that sound fair?"*

---

## After the Call (5 min)

### Immediate (within 2 hours)

- [ ] Send the **Client Service Agreement** (`templates/client-service-agreement.md`) via email
- [ ] If ready to book: Send Invoice Ninja invoice for concierge fee
- [ ] If needs time: Send cost breakdown summary email
- [ ] Update CRM: Set status to "Consultation Complete"
- [ ] Update CRM: Record U.S. quote amount, procedure type, destination preference

### If They Book

- [ ] Confirm concierge fee payment received
- [ ] Send onboarding packet (`templates/client-onboarding-packet.md`)
- [ ] Send pre-trip checklist (`templates/pre-trip-checklist.md`)
- [ ] Set CRM status to "Pre-Trip"
- [ ] Enter trip date in CRM
- [ ] Add to Trip Ledger (`finance/trip-ledger-template.csv`)
- [ ] Proceed to **Pre-Trip Preparation** (operations manual section 3)

### If They Don't Book

- [ ] Set CRM status to "Warm Lead"
- [ ] Schedule follow-up: 7 days
- [ ] Add note with reason: "Price objection / Need to think / Other option"
- [ ] Add to email sequence (send blog posts, cost comparison)

---

## Key Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Consultation → Booking rate | >50% | Booked calls / Total consults |
| Time from consult to booking | <48 hours | CRM timestamps |
| Most common objection | Track | CRM notes |
| Average savings per client | $2,000+ | (U.S. quote - MedPup total) |
| Primary conversion driver | Track | Ask: "What made you decide to book?" |

---

## Survival Phrases (When You're Stuck)

| Situation | Say This |
|-----------|----------|
| Don't know an answer | "That's a great question. Let me find out and get back to you within [timeframe]. Fair?" |
| Client is angry/stressed | "I hear you. This is hard. Let me tell you exactly what I can do to help." |
| Client asks for medical advice | "I can't give medical advice — that's your vet's job. But I can tell you what other families in your situation have done." |
| Client asks for a discount | "The concierge fee covers our costs to run the trip. The savings come from the clinic pricing — not from cutting our service." |
