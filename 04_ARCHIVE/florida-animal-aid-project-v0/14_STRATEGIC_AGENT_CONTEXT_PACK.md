# Florida Animal Aid Access Project — Strategic Agent Context Pack

Generated: 2026-04-29

Purpose: give local and remote implementation/orchestration agents enough static context to make better decisions without repeatedly drifting into unsafe veterinary, fundraising, animal-custody, or overbuilt software scope.

This document extends the Phase 0 operating folder. It does not replace legal review, veterinary review, insurance review, or local partner validation.

---

## 1. Executive Doctrine

The highest-probability launch path is not to become a veterinary clinic, mobile vet, rescue, telehealth provider, pharmacy, or emergency service. The highest-probability path is to become the best non-veterinary coordination layer around existing animal-care infrastructure.

The project should create value by reducing chaos:

- structured intake,
- emergency red-flag routing,
- owner/finder communication,
- clean case summaries,
- photo/video documentation,
- resource matching,
- transport coordination to confirmed destinations,
- partner outreach,
- follow-up tracking,
- sponsored-care workflow later,
- auditability and compliance guardrails.

Core rule for every agent: build systems that help licensed providers, shelters, rescues, and owners exchange better information faster. Do not build systems that substitute unlicensed agents for veterinarians.

---

## 2. Critical Strategic Correction

The founder's concept correctly identifies a real market gap: veterinary care is expensive, many owners delay or decline care, shelters and rescues are overloaded, and logistics/information quality are weak.

However, the dangerous version of the concept is: "cut the vets out," use international veterinarians for U.S. cases, route prescription medications through the operation, or let unlicensed field staff act like animal paramedics.

That version should not be built.

The safe version is: create a logistics, documentation, routing, and partner-support platform that works with Florida-licensed veterinarians and other lawful providers when medical judgment, diagnosis, prescribing, dispensing, or treatment is involved.

Agents must assume:

- diagnosis is veterinary medicine,
- prescription decisions are veterinary medicine,
- treatment decisions are veterinary medicine,
- determining whether an animal is medically safe to wait can become veterinary judgment,
- medication dosing guidance is prohibited,
- prescription dispensing without lawful veterinary order is prohibited,
- emergency delay is a high-severity operational failure,
- animal custody and foster placement are separate high-risk domains,
- public fundraising requires compliance checks before launch.

---

## 3. Legal/Regulatory Operating Facts Agents Must Encode

### 3.1 Florida veterinary practice boundary

Florida defines the practice of veterinary medicine to include diagnosing animal medical conditions and prescribing, dispensing, or administering drugs, medicine, applications, or treatment for prevention, cure, or relief of wounds, fractures, injury, or disease. Florida also defines a veterinarian as a person licensed to practice veterinary medicine in Florida.

Implementation consequence: any feature that makes medical judgments, recommends treatment, suggests medication, or presents the project as determining animal health must be blocked or routed to licensed veterinary authority.

### 3.2 Florida veterinary telehealth

Florida allows a veterinarian who holds a current Florida veterinary license to practice veterinary telehealth. The practice is deemed to occur in Florida when the veterinarian, the patient, or both are in Florida. Telehealth must be within a VCPR. An initial VCPR may be established by synchronous audiovisual communication, not audio-only, text, questionnaires, chatbots, or similar means. If medication is prescribed, the client must be informed they can obtain a prescription that may be filled at the pharmacy of their choice.

Implementation consequence: a tele-vet integration can exist, but only as a partner workflow involving properly licensed veterinarians and the required disclosures, identity fields, recordkeeping, local emergency/follow-up options, and audiovisual workflow.

### 3.3 Florida telehealth prescribing limits

Florida permits telehealth-based prescribing of certain FDA-approved animal drugs when used according to approved labeling. Prescriptions based solely on telehealth evaluation are limited to up to 1 month for flea/tick products and up to 14 days for other animal drugs, and they cannot be renewed without an in-person examination. Florida telehealth rules restrict human-use drugs, compounded antibacterial/antifungal/antiviral/antiparasitic medications, and controlled substances unless in-person/premises requirements are satisfied.

Implementation consequence: the software must not treat telehealth as a general-purpose low-cost pharmacy route. It must enforce medication category restrictions, duration limits, renewal rules, and partner-vet accountability if medication workflows are ever built.

### 3.4 Federal FDA/VCPR constraints

Federal FDA guidance states prescription animal drugs require a lawful written or oral order of a licensed veterinarian. Federal rules require a VCPR for extralabel drug use and veterinary feed directives. FDA also states the federal VCPR definition cannot be established solely through telemedicine; telemedicine can help maintain a VCPR once established.

Implementation consequence: do not build workflows that invite agents or field operators to recommend, route, dose, or dispense prescription medications. Build only information capture, vet handoff, and pharmacy-choice support controlled by the licensed veterinarian.

### 3.5 Florida premises/mobile clinic boundary

Florida requires a premises permit for any permanent or mobile establishment where a licensed veterinarian practices. Florida distinguishes a mobile veterinary establishment/mobile clinic from a veterinarian making house calls by car/truck. Mobile clinics require veterinary-level facilities or a written agreement with another veterinary establishment for required facilities not in the unit.

Implementation consequence: a transport/documentation vehicle is not a mobile veterinary clinic. The repo must avoid language implying a clinic, urgent care, hospital, mobile vet, or animal ambulance unless the legal structure, permitting, licensed veterinarian, facility requirements, and insurance are explicitly solved.

### 3.6 Florida fundraising boundary

Florida nonprofit corporations soliciting donations from Florida or from people in Florida generally must register with FDACS and renew annually under the Solicitation of Contributions Act.

Implementation consequence: agents must not add donation pages, “sponsor this case” buttons, crowdfunding language, charity claims, or fundraising automations until compliance status is cleared and documented.

---

## 4. Market Context Agents Should Know

The market problem is real, but the solution must be framed as access, logistics, and navigation—not anti-veterinarian displacement.

Relevant market facts:

- APPA's 2025 National Pet Owners Survey, cited in its 2026 State of the Industry Report, reports 95 million U.S. households own a pet.
- Gallup/PetSmart Charities data report that more than half of U.S. cat and dog owners declined recommended veterinary care or did not visit a veterinarian in the past year because of financial considerations or other barriers.
- USDA/NIFA maintains a designated Veterinary Services Shortage Situations map; the program exists because shortage areas are a recognized federal concern.
- A 2025 PLOS One study found that 20% of pet owners surveyed reported difficulty accessing basic veterinary care.

Strategic implication: demand is large, affordability pressure is credible, and access gaps exist. But a safe venture should win by improving throughput, documentation, routing, cost navigation, and partner utilization—not by bypassing licensure.

---

## 5. Business Model Map

### Model A — Nonprofit animal-aid coordination pilot

Description: free or donation-supported intake, routing, case summaries, owner support, resource navigation, and follow-up.

Best for: mission credibility, grants, volunteers, rescue/shelter partnerships.

Revenue/funding later:

- donations after compliance,
- grants,
- sponsored-care funds,
- local business sponsors,
- foundation support,
- case-specific clinic invoice sponsorship.

Regulatory risk: low if no diagnosis/treatment/prescribing/fundraising before compliance.

Agent build priority: highest for Phase 0/1.

### Model B — LLC logistics/support service

Description: paid non-medical transport, appointment coordination, case documentation, owner concierge, pet-retention support.

Best for: fast contracting, business services, transport revenue, paid coordination, software IP.

Revenue:

- flat transport fee,
- mileage fee,
- appointment coordination fee,
- subscription for senior/disabled owners,
- clinic/rescue operations support contract.

Regulatory risk: moderate; risk rises if marketing implies medical service or emergency response.

Agent build priority: medium. Useful if the project needs earned revenue before nonprofit fundraising.

### Model C — B2B clinic/rescue intake support

Description: provide structured pre-appointment/pre-referral case summaries, media collection, owner communication, transport coordination, and follow-up for clinics/rescues.

Best for: reducing clinic/rescue admin burden and making the project useful to providers.

Revenue:

- monthly retainer from clinics/rescues,
- per-case intake fee,
- referral workflow SaaS later,
- transport coordination add-on.

Regulatory risk: low to moderate if the provider owns all medical decisions.

Agent build priority: high after basic pilot works.

### Model D — Florida-licensed tele-vet partnership layer

Description: connect cases to Florida-licensed veterinarians who lawfully provide telehealth under Florida rules. The project supplies documentation/logistics, not medical judgment.

Best for: non-emergency access, rural/logistics gaps, follow-up, simple label-use cases where legally appropriate.

Revenue:

- scheduling/coordination fee,
- platform fee paid by provider,
- owner membership including non-medical support,
- sponsored teleconsults.

Regulatory risk: high unless VCPR, disclosures, Florida licensure, telehealth modality, prescribing limits, recordkeeping, and emergency fallback are enforced.

Agent build priority: later-stage only, after legal/veterinary review.

### Model E — Licensed mobile/limited-service clinic event partner

Description: partner with a licensed veterinarian or permitted provider for vaccine/microchip/preventive events, while the project handles logistics, outreach, scheduling, intake, and follow-up.

Best for: community days, preventive care, spay/neuter routing, sponsored care.

Revenue/funding:

- event sponsorship,
- clinic partner fee split,
- grants,
- municipal/community contracts.

Regulatory risk: high unless permits and licensed veterinary control are confirmed.

Agent build priority: later-stage, but resource planning can start now.

### Model F — Senior/disabled owner pet-support subscription

Description: recurring non-medical owner support: appointment scheduling, transport coordination, medication pickup only when lawful and owner-directed, food/supply routing, reminders, follow-up, records organization.

Best for: owner retention, predictable revenue, social-service partnerships.

Revenue:

- $15–$50/month basic support,
- per-transport fees,
- sponsor-covered memberships,
- referral partnerships.

Regulatory risk: low if non-medical and no prescription handling beyond lawful pickup/delivery rules.

Agent build priority: medium-high for pilot adjacency.

---

## 6. Models to Reject or Quarantine

Agents must flag these as high-risk unless specifically authorized after legal review:

1. International veterinarians diagnosing/prescribing for Florida animals without Florida licensure.
2. “Cut the vets out” workflows.
3. Project-owned medication dispensing, prescription fulfillment, compounding, or dosing guidance.
4. Field operators acting as veterinary technicians without lawful supervision.
5. Emergency dispatch/animal ambulance claims.
6. Public fundraising without FDACS/charitable solicitation compliance.
7. Foster placement or animal custody before foster agreements, quarantine, insurance, and legal review.
8. Wildlife handling without specialized/legal routing.
9. AI diagnosis or AI treatment recommendation.
10. Pricing claims that accuse clinics of greed in public materials.

---

## 7. Recommended 90-Day Strategy

### Days 1–14: static operating shell

Build/verify:

- landing page with disclaimers,
- intake form,
- emergency red-flag routing,
- case board,
- resource directory,
- partner outreach tracker,
- transport protocol,
- field safety checklist,
- audit log,
- dry-run test cases.

Do not build:

- tele-vet prescribing,
- donation page,
- foster network,
- medication workflow,
- clinic/event workflow,
- statewide marketing.

### Days 15–30: local pilot readiness

Build/verify:

- 20 resource records,
- 20 outreach targets,
- 3+ emergency veterinary resources,
- animal control/shelter routing per pilot ZIP,
- 10 fake case dry runs,
- case-summary generator,
- owner SMS/email templates,
- operator checklist.

Accept no more than 3–5 real cases in week one of pilot.

### Days 31–60: pilot and partner validation

Run:

- 3–10 real pilot cases,
- daily case board review,
- boundary violation review,
- partner feedback loops,
- transport-only cases if safe,
- resource verification cadence.

Measure:

- response time,
- time to first useful referral,
- emergency red-flag routing accuracy,
- case closure rate,
- partner response rate,
- owner follow-up success,
- avoided scope-creep incidents.

### Days 61–90: entity/revenue decision

Choose one of three paths:

- nonprofit path for donations/grants/rescue credibility,
- LLC path for paid logistics/coordination contracts,
- hybrid path: nonprofit public mission + LLC software/logistics later if needed.

Do not combine money, medical care, and animal custody in one uncontrolled jump.

---

## 8. Agent Architecture

### Required agents/workflows

1. Intake Form Builder
   - builds only observable-fact intake,
   - places emergency warning first,
   - requires consent,
   - never asks user to self-diagnose.

2. Emergency Red-Flag Router
   - detects Level 0 indicators,
   - sends exact emergency message,
   - asks only ZIP if needed for emergency resource matching,
   - logs time/message/resource/action.

3. Case Summary Generator
   - summarizes owner-reported observations,
   - labels content as non-diagnostic,
   - includes photos/video links,
   - blocks sharing if consent missing.

4. Resource Directory Agent
   - stores verified resources,
   - marks unknowns as unknown,
   - tracks last_verified_at,
   - separates emergency from non-emergency resources.

5. Partner Outreach Agent
   - sends/refines outreach scripts,
   - logs status,
   - schedules follow-up,
   - captures partner workflow preferences.

6. Transport Planner
   - requires destination confirmation,
   - requires owner/custodian consent,
   - checks containment and decline criteria,
   - logs pickup/dropoff/cleaning/incidents.

7. Compliance Guardrail Agent
   - scans public copy and features for prohibited terms,
   - blocks veterinary/clinic/urgent-care/emergency claims,
   - blocks diagnosis/treatment/prescription/dosing outputs,
   - flags donation/foster/medical-event changes.

8. Pilot Metrics Agent
   - produces weekly dashboard,
   - tracks cases, outcomes, risks, response times, resource gaps,
   - generates pilot review.

### Required agent output contract

Every implementation agent must return:

- files changed,
- decisions made,
- acceptance criteria satisfied,
- tests/dry runs performed,
- unresolved risks,
- boundary/compliance review,
- next action.

Agents may not say “done” unless acceptance criteria are mapped to evidence.

---

## 9. Software Build Priorities

### P0: must exist before public launch

- public disclaimer component,
- emergency warning component,
- intake form schema,
- consent schema,
- case board schema,
- resource directory schema,
- emergency resource view,
- audit log,
- case summary template,
- no-diagnosis/no-treatment lint rules for public copy,
- dry-run fixtures.

### P1: useful immediately after pilot start

- SMS/email templates,
- partner outreach tracker,
- follow-up reminders,
- media upload links,
- resource verification workflow,
- operator dashboard,
- boundary violation log,
- weekly metrics report.

### P2: only after pilot stability

- transport route planning,
- partner portal,
- sponsored-care workflow,
- donation workflow after compliance,
- insurer/legal document repository,
- volunteer/foster modules after policies.

### P3: later, high-risk/high-value

- Florida-licensed tele-vet integration,
- limited-service clinic event workflow,
- mobile vet partnership workflow,
- medication/pharmacy-choice support controlled by licensed vet,
- grant reporting automation,
- multi-county expansion.

---

## 10. Local Pinellas/Largo Starter Context

Default pilot zone: Largo/Pinellas ZIP cluster already listed in the pilot-zone document.

Starter categories to verify before launch:

- emergency veterinary hospital,
- general vet accepting new clients,
- urgent same-day vet,
- low-cost/spay-neuter resource,
- county animal services,
- public shelter routing,
- community cat/TNVR resource,
- pet food pantry,
- senior/disability support,
- domestic violence pet support,
- transport resources.

Possible current resource leads to verify:

- Pinellas County Community Pet Resources lists local options including PetPal Animal Shelter, Operation SNIP, SPOT, Harmony Nonprofit Vet Care, Animal Health Care Clinic, and Friends of Strays/Pinellas Cats Alive.
- Local clinic pages identify emergency options such as BluePearl Clearwater, Tampa Bay Veterinary Specialists & Emergency Care Center in Largo, St. Petersburg Animal Hospital & Urgent Care, and Veterinary Emergency Group Clearwater.
- Pinellas County's community cat materials point to MEOW Now/Friends of Strays for TNVR-related support.
- Operation:SNIP in Largo lists TNVR/community cat and spay-neuter services.
- St. Pete Free Clinic/Humane Society of Pinellas resources include pet food assistance leads.

Agents must verify phone, hours, species accepted, intake requirements, and last_verified_at before using any resource in a live case.

---

## 11. Messaging Rules

### Public positioning

Use:

- animal aid coordination,
- owner support,
- referral coordination,
- resource navigation,
- transport coordination,
- field documentation support,
- case-management support.

Avoid:

- clinic,
- mobile vet,
- veterinary service,
- animal urgent care,
- emergency service,
- medical triage,
- treatment provider,
- telehealth provider,
- animal ambulance,
- veterinary technician service.

### Tone

Public materials should not accuse local clinics of greed. The market argument can be internal. Public copy should say:

- care is hard to access,
- costs are difficult for many owners,
- owners need help navigating options,
- clinics/rescues are overloaded,
- better information and logistics can reduce avoidable suffering.

---

## 12. Pricing/Revenue Experiments

Do not launch with complex pricing. Test small, clear offers.

### Coordination-only support

- Free during pilot, or
- $0–$25 suggested support fee for non-emergency resource navigation, only if not framed as charitable donation unless compliance is cleared.

### Transport support

- Free pilot cases only, or
- mileage-based fee after waiver/insurance review, or
- sponsor-covered transport vouchers.

### B2B partner support

- Free for first 1–2 anchor clinics/rescues in exchange for feedback,
- later $100–$500/month for intake/support workflow depending volume,
- or per-case admin fee if legally/business appropriate.

### Membership/support plan

- Later: $15–$50/month non-medical support membership for senior/disabled/low-income pet owners, possibly sponsor-funded.

Do not create fees for diagnosis, treatment, prescriptions, medication access, emergency response, or guaranteed placement.

---

## 13. Minimum Data Models to Add/Enforce

Add or verify these schemas:

- ComplianceRisk
- BoundaryViolation
- ResourceVerificationEvent
- PartnerPreference
- EmergencyRoutingLog
- ConsentRecord
- TransportConsent
- TransportIncident
- SponsoredCareRequest, disabled until compliance
- TeleVetReferral, disabled until legal/vet review
- PublicCopyReview
- AgentTaskEvidence

Every case should have:

- status,
- triage level,
- red flags,
- consent status,
- next action,
- assigned operator,
- referral records,
- follow-up due date,
- closure reason,
- audit trail.

---

## 14. Acceptance Gates for Agents

### Launch gate

Public launch is blocked unless:

- service boundary policy exists,
- emergency routing exists,
- intake consent exists,
- case board exists,
- emergency clinic list exists,
- animal control/shelter routing exists,
- public disclaimer exists,
- donation flow is disabled unless compliance is documented.

### Tele-vet gate

Any tele-vet feature is blocked unless:

- Florida-licensed veterinarian partner is identified,
- VCPR workflow is documented,
- audiovisual requirement is handled where initial VCPR is established remotely,
- prescribing limits are encoded,
- adverse-event/follow-up clinic info is provided,
- records and vet license/contact fields are stored,
- legal/veterinary review is complete.

### Medication gate

Any medication feature is blocked unless:

- it is limited to owner/vet/pharmacy information flow,
- the licensed veterinarian controls prescribing,
- no project agent gives dosing or treatment advice,
- dispensing/pickup/delivery rules are reviewed,
- prescription vs OTC vs VFD status is recorded,
- federal and Florida rules are respected.

### Transport gate

Any transport workflow is blocked unless:

- destination confirmed,
- consent confirmed,
- containment confirmed,
- no aggressive/unstable animal issue,
- driver safety acknowledged,
- cleaning/incident logging exists.

---

## 15. Strategic North Star

The project should not try to beat veterinary clinics by practicing cheaper veterinary medicine. It should beat the current broken access layer by making the path to appropriate care faster, cleaner, safer, and more affordable where possible.

The durable advantage is a software-and-operations network that makes every case easier to understand, route, fund, transport, document, and follow up.

---

## 16. Source URLs for Agent Reference

- Florida veterinary medical practice statute, Chapter 474: https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0474/0474.html
- Florida premises permit statute, 474.215: https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0474/Sections/0474.215.html
- Florida DBPR Board of Veterinary Medicine: https://www2.myfloridalicense.com/veterinary-medicine/
- FDA VCPR/prescribing/telemedicine guidance: https://www.fda.gov/animal-veterinary/product-safety-information/veterinarian-client-patient-relationships-prescribingdispensing-animal-drugs-and-telemedicine
- FDA animal drug regulation: https://www.fda.gov/animal-veterinary/resources-you/fda-regulation-animal-drugs
- Florida nonprofit corporation / donation registration note: https://dos.fl.gov/sunbiz/start-business/efile/fl-nonprofit-corporation/
- APPA pet ownership statistics: https://americanpetproducts.org/industry-trends-and-stats
- Gallup/PetSmart Charities veterinary care affordability coverage: https://news.gallup.com/poll/700115/veterinarians-say-cost-main-driver-declined-care.aspx
- USDA/NIFA veterinary shortage map: https://www.nifa.usda.gov/vmlrp-map
- Pinellas County community pet resources: https://pinellas.gov/pinellas-county-community-resources/
- Pinellas County community cats/TNVR: https://pinellas.gov/strays-feral-cats/
- Operation:SNIP community cats/TNVR: https://operationsnip.com/services/community-cats-tnvr/
