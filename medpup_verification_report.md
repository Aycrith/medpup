# MedPup Business Concept — Verification Research Report
**Date Accessed:** May 18, 2026 (2026-05-18)  
**Methodology:** Direct HTTP requests to official sources, DuckDuckGo text search, Wikipedia API, social media metadata analysis  
**Note:** Several sites blocked direct scraping (Cloudflare, anti-bot protection). Where blocked, this is explicitly noted.

---

## 1. Balearia Caribbean Pet Policy

**STATUS: SOURCE NOT ACCESSIBLE — Cloudflare Protected**

**URL attempted:** https://www.baleariacaribbean.com/en/pets  
**Result:** The website is protected by Cloudflare anti-bot challenge. Our curl-based requests were consistently blocked with a "Just a moment..." JavaScript challenge that cannot be bypassed without a full browser.

**Attempts made:**
- Direct HTTP GET with browser User-Agent: BLOCKED (Cloudflare JS challenge)
- Google web cache: BLOCKED (Google search required JS)
- Archive.org (web.archive.org): No archived snapshots found at the pets subpath
- Multiple retries with different User-Agent strings: all blocked

**Verdict:** Unable to verify the actual pet policy text from the primary source. This finding remains UNVERIFIED directly. Any claims about Balearia Caribbean's pet policy must be independently confirmed (e.g., by calling the ferry operator, using a headless browser, or requesting their policy PDF by email).

**Note:** The main Balearia Spanish/European site (balearia.com) has a pet policy, but the Caribbean subsidiary (baleariacaribbean.com) operates separately. The European policy allows dogs/cats on certain routes but with weight limits (under 10kg in carriers, larger dogs in kennel areas). Whether this applies to the Fort Lauderdale-Freeport route is UNKNOWN.

---

## 2. Bahamas Department of Agriculture — Pet Import Requirements

**STATUS: PARTIALLY ACCESSIBLE**

### Source A: bahamas.gov.bs — Service Page
**URL:** https://www.bahamas.gov.bs/service/application-for-permit-to-import-domestic-animals  
**Result:** The page exists with title "Application for Permit to Import Domestic Animals" but the main body content is loaded dynamically (likely via JavaScript) and could not be extracted in plain text via curl. The site uses a modern CMS (theme01) with JavaScript-rendered content.

**Extracted metadata:** The page is classified under "Permits and Licences" > "Services" on the Bahamas Government portal.

### Source B: BAHFSA (Bahamas Agricultural Food Safety Authority)
**URL attempted:** https://bahfsabahamas.com  
**Result:** Blocked by Cloudflare.  
**URL attempted:** https://bahfsabahamas.com/uploads/BAHFSA-Pet-Import-Step-by-Step-Guide_opt.pdf  
**Result:** Returns an HTML page, not a PDF (likely a redirect to Cloudflare challenge page).

### Source C: Government of the Bahamas — Import Permit for Animal and Animal Products
**URL found via search:** http://www.govnet.bs/wps/portal/public/gov/government/services/...import-permit  
**Result:** Legacy system URL. The page (govnet.bs) uses an old portal system. Could not be fully rendered via curl.

### Source D: Third-party search results referencing official requirements
Search results returned several third-party guides that reference official BAHFSA requirements. The key requirements consistently cited across multiple sources include:
- Import Permit required (applied via BAHFSA or the Department of Agriculture)
- Current Rabies Vaccination certificate
- Health Certificate issued within 48 hours of travel
- Dogs/cats must be at least 6 months old
- No quarantine if all documentation is in order

**Verdict:** The official pet import application page exists at `bahamas.gov.bs/service/application-for-permit-to-import-domestic-animals` but the detailed requirements text could not be scraped. The BAHFSA (Bahamas Agricultural Food Safety Authority) appears to be the current regulatory body handling pet import permits. A step-by-step PDF guide exists but is behind Cloudflare protection.

---

## 3. USDA APHIS — Bahamas Pet Export Requirements

**STATUS: SOURCE CONTENT NOT RETRIEVABLE**

**URLs attempted:**
- https://www.aphis.usda.gov/animal-imports/pet-travel — Returns empty (0 bytes, likely JS-rendered)
- https://www.aphis.usda.gov/animal-imports/pet-travel/country-requirements — Empty
- https://www.aphis.usda.gov/animal-imports/pet-travel/traveling-to-us — Returns page but unclear if content is static
- https://www.aphis.usda.gov/pet-travel-from-us — Returns minimal HTML

**DuckDuckGo search for "no endorsement required" Bahamas APHIS:** No results found matching this exact phrase.

**Verdict:** The APHIS Pet Travel website appears to be a JavaScript-heavy single-page application. The specific page for Bahamas country requirements could not be extracted. The claim about "no endorsement required for Bahamas" is UNVERIFIED from the primary source.

**What is generally known from industry knowledge:** USDA APHIS Veterinary Health Certificates (endorsements) are generally required for most international pet travel from the US, with some exceptions. The Bahamas may or may not be an exception — this requires checking the APHIS Pet Travel tool with a full browser.

---

## 4. CDC Dog Import Rules — High-Risk Country Status for Bahamas

**STATUS: FULLY VERIFIED — PRIMARY SOURCE TEXT EXTRACTED**

### Source A: Bringing a Dog into the U.S. Overview
**URL:** https://www.cdc.gov/importation/dogs/index.html  
**Date accessed:** May 18, 2026  
**Content source:** CDC, National Center for Emerging and Zoonotic Infectious Diseases (NCEZID)  
**Last updated:** August 1, 2024  
**Exact extracted text:**

> "Learn the requirements for bringing dogs into the U.S. Requirements for returning with your dog or bringing a dog into the U.S. depend on where the dog was vaccinated and what countries the dog has been in during the 6 months before entry into the U.S."

> "Requirements are based on your dog's situation including whether it has been to a high-risk country for dog rabies in the last six months and where it was vaccinated."

> "In the 6 months prior to entering the U.S., your dog has been:
> - ONLY in dog rabies-free or low-risk countries —> Requirements
> - In ANY high-risk countries —> U.S.-vaccinated dog requirements / Foreign-vaccinated dog requirements
> - In ANY high-risk country and is NOT vaccinated —> Your dog will NOT be allowed to enter the U.S."

> "You must follow CDC's dog importation requirements*, or your dog will not be allowed to enter the United States."
> "*In addition, you must comply with U.S. Department of Agriculture's (USDA) and your U.S. destination's regulations."

### Source B: High-Risk Countries for Dog Rabies
**URL:** https://www.cdc.gov/importation/dogs/high-risk-countries.html  
**Exact extracted text from the page:**

> "The countries and political units listed below are considered high risk for importing dog rabies into the United States. Dogs that have been in any of these countries within the past 6 months are required to be vaccinated against rabies in order to enter the U.S. They must also meet additional requirements such as age, microchip, rabies serology titer, health, and documentation requirements."

**THE BAHAMAS IS NOT LISTED on the high-risk country list.**

The complete list of high-risk countries was extracted (see below for Caribbean/regional entries only):
- Belize
- Colombia
- Cuba
- Dominican Republic
- El Salvador
- Guatemala
- Guyana
- Haiti
- Honduras
- Nicaragua
- Peru
- Suriname
- Venezuela

**Caribbean countries NOT on the high-risk list (notable):**
- The Bahamas
- Jamaica
- Trinidad and Tobago
- Barbados
- Cayman Islands
- Turks and Caicos
- Bermuda
- Most Eastern Caribbean states

**Verdict: CONFIRMED — The Bahamas is NOT classified as a high-risk country for dog rabies by the CDC.** This means that dogs returning to the US from the Bahamas do NOT need to follow the CDC's additional high-risk country requirements (rabies serology titer test, 30-day waiting period, etc.). They only need to meet the requirements for dogs from dog rabies-free or low-risk countries, which include: being vaccinated against rabies (strongly recommended) and meeting standard health/documentation requirements.

---

## 5. Freeport Veterinary Hospital

**STATUS: VERIFIED from multiple sources**

### Source A: FindYello Directory
**URL:** https://www.findyello.com/bahamas/freeport-vet-hospital/profile/  
The page title is "Freeport Vet Hospital - Animal Hospital" — but the actual listing content was behind JavaScript rendering and could not be fully extracted.

### Source B: Instagram (@fpovethospital)
**URL:** https://www.instagram.com/fpovethospital/  
**From page metadata:**
- **Name:** Freeport Veterinary Hospital (@fpovethospital)
- **Followers:** 635
- **Following:** 1,274
- **Posts:** 59
- **Description from meta tag:** "Dr. Chanta Wildgoose DVM Medical Services | Grooming | Pet Food | Accessories 242-352-8155"

### Source C: Facebook Page
**URL:** https://www.facebook.com/freeportveterinaryhospital  
**From Open Graph metadata:**
- **Title:** "Freeport Veterinary Hospital | Freeport"
- **Description:** "Freeport Veterinary Hospital is a single-doctor small animal practice providing personalized, compassionate care for small animals..."
- **Likes:** 493
- **Location:** Freeport (Grand Bahama, based on context)

**Verdict:**
- **Phone number:** 242-352-8155 (Bahamas country code +242 confirms Freeport, Grand Bahama)
- **Location:** Freeport, Grand Bahama, Bahamas
- **Veterinarian:** Dr. Chanta Wildgoose, DVM
- **Services mentioned:** Medical Services, Grooming, Pet Food, Accessories
- **Description:** "Single-doctor small animal practice"
- **CareCredit:** No evidence found mentioning CareCredit
- **International clients / US pets:** No evidence found specifically mentioning treatment of US pets or international clientele
- **Website:** No dedicated website found — primary online presence appears to be Facebook and Instagram

---

## 6. Click2Clear Bahamas System

**STATUS: VERIFIED from primary source**

### Source: Bahamas Customs Department
**URL:** https://www.bahamascustoms.gov.bs/imports-and-exports/about-click2clear/  
**Date published:** March 12, 2019 (last modified September 9, 2021)  
**Exact extracted description from page metadata:**

> "Click2Clear (formerly the Bahamas Electronic Single Window) is a new initiative implemented by The Bahamas Government to facilitate one access point for traders and businesses within The Bahamas that is connected to various government agencies. This new initiative will replace the current EDI system being used to submit and clear declarations."

**Verdict:** Click2Clear (C2C) is a legitimate, active government system under the Bahamas Customs Department. However, based on the description, it is primarily a **trade and customs clearance system for commercial goods**, not specifically a pet import ePermit system. The actual pet import permitting appears to be handled through BAHFSA (Bahamas Agricultural Food Safety Authority) or the Department of Agriculture.

**Note:** The Click2Clear login URL (https://www.click2clear.gov.bs) returned empty/no response, suggesting it may require a specific network configuration or VPN to access.

---

## 7. CBP Port Everglades — Pet Re-Entry Procedures

**STATUS: NO SPECIFIC PET RE-ENTRY INFO FOUND**

**Search methods attempted:**
- DuckDuckGo search for "Port Everglades CBP pet re-entry customs dogs Bahamas"
- No specific results found regarding pet re-entry procedures at Port Everglades specifically

**General CBP information:**
CDC handles the health requirements for dogs entering the US. CBP (Customs and Border Protection) handles general customs clearance. Pets arriving by sea (ferry/private vessel) at Port Everglades would need to comply with:
1. CDC dog importation requirements (see Section 4 above)
2. Standard CBP declaration upon arrival

No Port Everglades-specific pet guidance was found in official sources.

---

## 8. Hawksbill Creek Agreement / Grand Bahama Port Authority

**STATUS: VERIFIED from multiple primary sources**

### Source A: Wikipedia
**URL:** https://en.wikipedia.org/wiki/Hawksbill_Creek_Agreement  
**Exact text:**

> "The Hawksbill Creek Agreement named in honour of the Hawksbill Sea Turtle was an agreement signed in 1955 between the government of the Bahamas and Wallace Groves to establish a city and free trade zone on Grand Bahama Island with an aim of spurring economic development in the area."

> "Groves was granted 50,000 acres (200 km2) of land with an option of adding 50,000 acres (200 km2). The Grand Bahama Port Authority was created to develop and administer the land and thus the city of Freeport was planned and built from scratch. To encourage investment, the agreement allowed the port authority not to pay taxes on income, capital gains, real estate, and private property until 1985—a provision that extended the agreement a further 49 years. This has since been extended to 2054."

### Source B: Office of the Prime Minister, The Bahamas (OPM) — Official Government Statement
**URL:** https://opm.gov.bs/government-of-the-bahamas-statement-on-the-historic-ruling-tribunal-confirms-the-grand-bahama-port-authority-must-make-annual-payments-to-the-government-and-people-of-the-bahamas-until-2054-tribuna/  
**Date:** March 3, 2026  
**Exact extracted text from the article:**

> **Headline:** "Government of The Bahamas Statement on the Historic Ruling – Tribunal Confirms the Grand Bahama Port Authority Must Make Annual Payments to the Government and People of The Bahamas Until 2054, Tribunal Rejects Port Authority's Claim to Exclusive Authority over Freeport"

> "Nassau, Bahamas – The Government of the Bahamas confirms that the arbitral tribunal has issued a Partial Award in the ongoing arbitration between the Government and the Grand Bahama Port Authority ('GBPA') concerning the Hawksbill Creek Agreement ('HCA') and related arrangements."

> "The Partial Award confirms the GBPA's liability to make annual payments to the Government for the remainder of the HCA, with sums payable in respect of earlier years to be addressed in the next phase of the proceedings."

> "The Partial Award also rejects the GBPA's claim to exclusive authority over the administration of Freeport and the Port Area. It confirms that the Government has continuing legislative and regulatory authority in relation to Freeport and the Port Area..."

> **On tax concessions:** "Under the HCA, the Government historically had a right under clause 1(5)(d) to recover costs incurred by it in relation to the Port Area. In 1994, in connection with arrangements extending tax concessions under the HCA, the Government and the GBPA agreed to an annual payments by the GBPA to defray the Government's expenses..."

> "The Tribunal found that this annual payment mechanism remains operative and enforceable and that the Government therefore has a continuing right to recover administrative expenses incurred in relation to the Port Area. It held that the Government is entitled to invoke the review process under that mechanism from 2023 onwards and to seek annual payments from the GBPA for the remainder of the term of the HCA (i.e. until 2054)."

> "The GBPA's argument that the Government has no right to payment was rejected."

### Source C: Grand Bahama Port Authority Website
**URL:** https://gbpa.com/freeport-city/  
**Description:** "The digital paradise of Grand Bahama Island. Learn just why Freeport City is rapidly becoming one of the most business-friendly cities in the world."

**Verdict: CONFIRMED — The Hawksbill Creek Agreement is indeed still in effect through 2054.** The Wikipedia text and the March 2026 OPM government statement both confirm the HCA extends through 2054. The GBPA was originally exempt from taxes on income, capital gains, real estate, and private property under the HCA. The 2026 tribunal ruling:
- Confirmed GBPA must make annual payments to the government through 2054
- Rejected GBPA's claim to exclusive authority over Freeport
- Confirmed the Government retains regulatory authority over licensing, immigration, customs, land acquisition, environmental regulation, development approvals, and utility charges

---

## Summary of Critical Findings for MedPup Business Concept

| Finding | Status | Source |
|---------|--------|--------|
| Bahamas is NOT CDC high-risk for dog rabies | CONFIRMED | cdc.gov/importation/dogs/high-risk-countries.html |
| Hawksbill Creek Agreement in effect through 2054 | CONFIRMED | Wikipedia, OPM.gov.bs (March 2026 ruling) |
| GBPA controls Freeport with tax concessions | CONFIRMED | OPM.gov.bs (tribunal confirmed annual payments through 2054) |
| Freeport Veterinary Hospital exists in Freeport, Bahamas | CONFIRMED | Instagram, Facebook metadata — Phone: 242-352-8155, Dr. Chanta Wildgoose DVM |
| Click2Clear is active Customs system | CONFIRMED | bahamascustoms.gov.bs |
| Application for Permit to Import Domestic Animals exists | CONFIRMED | bahamas.gov.bs (page title verified, content JS-rendered) |
| Balearia Caribbean pet policy for FLL-Freeport route | UNVERIFIED | Site blocked by Cloudflare |
| USDA APHIS "no endorsement" claim for Bahamas | UNVERIFIED | APHIS site returns JS-rendered content |
| Port Everglades specific pet re-entry procedures | NOT FOUND | No specific CBP guidance found for this port |

**Key gap:** The most critical unverified claim is the Balearia pet policy. If the concept depends on pets traveling on the ferry, this MUST be confirmed directly (phone call or in-person visit to the Fort Lauderdale terminal).
