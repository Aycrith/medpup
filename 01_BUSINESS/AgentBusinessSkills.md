# MedPup Agent Skills & Tooling Configuration Guide
## A Zero-Cost, Maximum-Capability Tech Stack for Autonomous Business Operations

---

This guide provides a comprehensive, meticulously researched skillset and tooling configuration for an AI agent (such as Hermes) to autonomously build and operate the MedPup business. Every tool recommended below is **free, open-source, and self-hostable**, or offers a **generous freemium tier** sufficient to support the business from MVP through revenue generation. The guiding principle is clear: **time is the currency, not dollars.**

All tools have been validated as active, maintained, and production-ready as of 2025–2026. Where a tool offers both self-hosted and cloud options, both are noted.

---

## 1. Website & Web Presence (Static Site + Hosting)

### 1.1 Static Site Generator: Hugo
- **What it is:** One of the fastest static site generators, written in Go. Builds complete websites in milliseconds from Markdown content files and templates.
- **Why it's ideal:** GitHub Pages has native Hugo support via GitHub Actions. Combined with a free theme, a complete, SEO-optimized, blog-capable website can be built with zero cost and perfect version control. Hugo builds are nearly instant even for large sites.
- **Free tier:** Fully open-source (Apache 2.0). No limits.

### 1.2 Free Hosting: GitHub Pages + Netlify (Dual Deployment)
- **What it is:** GitHub Pages provides free static hosting directly from a repository with built-in CDN and SSL. Netlify adds deploy previews, serverless functions, and form handling.
- **Why it's ideal:** GitHub Pages is unlimited for public repos with custom domains and free SSL. Netlify's free tier includes 100GB bandwidth/month, 300 build minutes, and deploy previews—more than enough for a business site. Combined, they provide redundancy and advanced capabilities.
- **Free tier:** GitHub Pages: unlimited bandwidth, free SSL, custom domains. Netlify: 100GB bandwidth, 300 build minutes/month.

### 1.3 Low-Code Alternative: WordPress.com (Free Tier)
- **What it is:** The world's most widely-used CMS, powering 43.5% of all websites. The free tier provides a functional site with WordPress.com subdomain.
- **Why include it:** For non-developer tasks or rapid landing pages, WordPress.com's free tier with built-in SEO, mobile responsiveness, and thousands of free themes provides a fast alternative path. Ideal for the initial MVP landing page while the full static site is being built.
- **Free tier:** Fully functional site with WordPress.com subdomain, 1GB storage, community support.

---

## 2. Design & Branding (Visual Identity at Zero Cost)

### 2.1 Vector Design & Brand Assets: Inkscape
- **What it is:** The premier open-source vector graphics editor, comparable to Adobe Illustrator. Supports SVG as its native format with full PNG and PDF export capabilities.
- **Why it's ideal:** Every brand asset—logo, social media graphics, document templates, infographics—can be created professionally in Inkscape. SVG files are infinitely scalable and lightweight. Combined with free stock photo sites, this eliminates any need for paid design tools.
- **Free tier:** Fully open-source (GPL). No limits. Cross-platform (Windows, Mac, Linux).

### 2.2 Browser-Based Design: Penpot
- **What it is:** An open-source, web-based design and prototyping platform built specifically for interface and web design. Uses SVG as its native format and can be self-hosted or used via the free cloud version.
- **Why it's ideal:** Perfect for designing website mockups, social media templates, and client-facing materials collaboratively. No subscription, no vendor lock-in, no feature paywalls. It's a direct alternative to Figma and Canva for interface design.
- **Free tier:** Fully open-source. Cloud version free. Self-host option available.

### 2.3 Logo Generation: Namecheap Logo Maker (Free)
- **What it is:** A free AI-powered online logo generator that produces professional logos in SVG and PNG formats. Simply input the brand name and preferences, and it generates multiple options instantly.
- **Why it's ideal:** For the initial brand identity, this produces a professional SVG logo in minutes at zero cost. The SVG can then be refined in Inkscape. No design skills required.
- **Free tier:** Completely free. Exports to SVG and PNG.

### 2.4 Free Commercial-Use Stock Photos & Vectors: Pixabay
- **What it is:** A massive library of free photos, vector graphics, and video clips, all released under Creative Commons CC0—meaning free for commercial use with no attribution required.
- **Why it's ideal:** Every image needed for the website, blog posts, social media, and marketing materials can be sourced here legally and at zero cost. The CC0 license eliminates any legal risk around commercial usage.
- **Free tier:** Unlimited downloads, no attribution required, commercial use permitted.

---

## 3. Content Marketing & SEO Engine

### 3.1 Keyword Research: Google Keyword Planner + Ahrefs Webmaster Tools
- **What it is:** Google Keyword Planner (free with any Google Ads account) provides search volume and keyword ideas. Ahrefs Webmaster Tools (AWT) offers a free tier with site audits, backlink data, and keyword rankings for verified sites.
- **Why it's ideal:** Together, these two tools provide enterprise-grade keyword research and competitive analysis at zero cost. AWT's free tier is generous enough to track all critical keywords and identify content gaps.
- **Free tier:** Both are completely free with verified accounts.

### 3.2 Rank Tracking & Technical SEO: Google Search Console
- **What it is:** The definitive free tool from Google for monitoring site performance in search results, identifying indexing issues, and understanding which queries drive traffic.
- **Why it's ideal:** No SEO strategy is complete without GSC. It provides the ground truth of how Google sees your site, which keywords are driving impressions, and where technical issues exist.
- **Free tier:** Unlimited, free forever.

### 3.3 Content Ideation: AnswerThePublic
- **What it is:** A free tool that visualizes the questions and phrases people search for around any topic. Excellent for discovering long-tail content opportunities and understanding user intent.
- **Why it's ideal:** For building the "20+ foundational articles" specified in the business plan, this tool uncovers exactly what questions pet owners are asking about cross-border care, TPLO costs, and affordable veterinary options.
- **Free tier:** Limited daily searches but sufficient for strategic content planning.

### 3.4 AI Content Generation: Opace AI Scribe (Open-Source WordPress Plugin)
- **What it is:** An open-source AI content creation tool that integrates with OpenAI and Anthropic models to generate SEO-optimized content directly within WordPress. Supports keyword configuration from the outset.
- **Why it's ideal:** When paired with a free or low-cost API key for an LLM, this automates the creation of SEO-optimized blog posts, service pages, and FAQs. The content is generated with SEO structure baked in.
- **Free tier:** Open-source, free to install and use. Requires an API key for the LLM backend.

### 3.5 Trend Analysis: Google Trends
- **What it is:** Free tool showing search interest over time, by region, and related queries. Essential for identifying seasonal patterns in veterinary search demand.
- **Why it's ideal:** Answers critical business questions like "When do people search for TPLO surgery most?" and "Is interest in cross-border vet care growing in Florida specifically?"
- **Free tier:** Unlimited, free forever.

---

## 4. Customer Relationship Management (CRM)

### 4.1 Primary CRM: EspoCRM
- **What it is:** A flexible, open-source CRM designed for growing teams. Features include contact management, sales pipeline tracking, email integration, and calendar syncing. Self-hosted with a clean, modern interface.
- **Why it's ideal:** Lightweight enough for a solo operation yet powerful enough to scale. Manages the entire client journey from inquiry through post-trip follow-up. Integrates with email and calendar systems natively.
- **Free tier:** Fully open-source (GPL). Self-hosted. No limits.

### 4.2 Advanced Alternative: Twenty
- **What it is:** A modern, open-source CRM positioned as a "free Salesforce alternative." Self-hosted or available via cloud, with a polished UI and extensible architecture.
- **Why include it:** If the business outgrows EspoCRM's capabilities, Twenty provides a more enterprise-grade foundation without introducing cost.
- **Free tier:** Open-source (AGPL v3). Cloud version available.

### 4.3 All-in-One ERP Alternative: Dolibarr
- **What it is:** An open-source ERP and CRM platform that combines contact management, invoicing, project tracking, and calendar functions in a single system.
- **Why include it:** If the business needs integrated CRM + invoicing + project management in one system, Dolibarr eliminates the need for multiple tools.
- **Free tier:** Fully open-source. Self-hosted free. Paid hosted version available (€5–100/mo).

---

## 5. Email Marketing & Communications

### 5.1 Self-Hosted Email Marketing: phpList
- **What it is:** A fully functional open-source email marketing manager for creating, sending, integrating, and analyzing email campaigns and newsletters. Used by organizations worldwide.
- **Why it's ideal:** Handles all email marketing needs—newsletters, promotional campaigns, automated drip sequences—with complete control over data and zero per-email sending fees. The hosted version is also free to start.
- **Free tier:** Open-source (self-hosted, unlimited). Hosted version: free to sign up.

### 5.2 Modern Lightweight Alternative: Listmonk
- **What it is:** A high-performance, self-hosted email marketing and newsletter platform written in Go. Features include list management, campaign scheduling, and detailed analytics.
- **Why it's ideal:** Extremely lightweight and fast. Perfect for a single-server deployment handling subscriber lists and automated email sequences without the overhead of larger systems.
- **Free tier:** Open-source (AGPL). Self-hosted.

### 5.3 Transactional Email: AWS SES (Free Tier) or SendGrid (Free Tier)
- **What it is:** AWS SES provides 62,000 free outbound emails per month when sent from EC2. SendGrid offers 100 emails/day free forever.
- **Why it's ideal:** For transactional emails (booking confirmations, document requests, trip reminders), these services handle deliverability without the complexity of managing an SMTP server.
- **Free tier:** AWS SES: 62,000 emails/month (from EC2). SendGrid: 100 emails/day free forever.

---

## 6. Project Management & Internal Operations

### 6.1 Task Management: Vikunja
- **What it is:** An open-source, self-hosted task management tool offering Kanban, Gantt, List, and Table views. Lightweight and easy to deploy. An excellent alternative to Trello or Asana.
- **Why it's ideal:** Manages the multi-phase business launch, tracks trip planning checklists, and coordinates agent task assignments. The multiple view options adapt to different workflows.
- **Free tier:** Open-source (AGPL). Self-hosted. Unlimited users and projects.

### 6.2 Documentation & Knowledge Base: DokuWiki
- **What it is:** A traditional open-source wiki software designed for creating and managing documentation without needing a database. Strong access control and a large plugin ecosystem.
- **Why it's ideal:** Perfect for building the internal operations manual, partner clinic playbooks, regulatory compliance guides, and agent training documentation. No database means simple backup and migration.
- **Free tier:** Open-source (GPL). Self-hosted.

### 6.3 AI-Powered Wiki Alternative: PandaWiki
- **What it is:** An AI-driven, open-source knowledge base system for building intelligent product documentation, FAQs, and blog systems with AI-powered search and Q&A capabilities.
- **Why it's ideal:** For client-facing documentation (procedure guides, destination FAQs, pre-travel checklists), the AI search and Q&A features provide an interactive, modern experience.
- **Free tier:** Open-source. Self-hosted.

---

## 7. Workflow Automation (The Business Engine)

### 7.1 Core Automation: n8n (Self-Hosted)
- **What it is:** A powerful, fair-code workflow automation platform that connects apps, APIs, and AI models. Supports custom JavaScript/Python code within workflows. The self-hosted version is completely free with no workflow limits.
- **Why it's ideal:** This is the **central nervous system** of the autonomous business. n8n can:
  - Trigger email sequences when a client books a trip
  - Automatically generate and send pre-travel document requests
  - Sync data between the website, CRM, and email system
  - Monitor regulatory changes via API and flag them
  - Aggregate pricing data from partner clinics
  - Send booking notifications to partner clinics
- **Free tier:** Self-hosted version completely free and open-source. No limits on workflows or executions. Cloud version has a free tier with limited executions.

### 7.2 Telegram Bot Integration for Notifications & Automation
- **What it is:** Telegram's Bot API allows the creation of custom automated bots that can send notifications, process commands, and integrate with business workflows.
- **Why it's ideal:** An internal Telegram bot can:
  - Alert the operator when a new booking is received
  - Send daily summary reports of website traffic and leads
  - Notify about upcoming trip dates and document deadlines
  - Provide quick access to client records and trip status
- **Free tier:** Telegram Bot API is completely free with no limits.

---

## 8. Customer Support & Communication

### 8.1 Live Chat & Support: Chatwoot
- **What it is:** A modern, open-source, self-hosted customer support platform. An alternative to Intercom, Zendesk, and Salesforce Service Cloud. Supports live chat, email, and multi-channel conversations.
- **Why it's ideal:** Provides a professional live chat widget on the website at zero cost. Handles customer inquiries, pre-qualification questions, and support tickets. The multi-channel support means email inquiries can be managed in the same dashboard.
- **Free tier:** Open-source (MIT). Self-hosted. Unlimited agents, conversations, and channels.

### 8.2 Video Conferencing: Jitsi Meet
- **What it is:** An open-source video conferencing platform that runs entirely in the browser with no account required. Supports screen sharing, recording, and encryption. Can be self-hosted.
- **Why it's ideal:** For pre-travel consultations, partner clinic coordination, and client walkthrough calls, Jitsi provides unlimited, secure video meetings at zero cost. The Jitsi Telemedicine configuration supports HIPAA-aligned use cases.
- **Free tier:** Open-source. Free public instance at meet.jit.si. Self-host option available.

### 8.3 Appointment Scheduling: Easy!Appointments
- **What it is:** A highly customizable, open-source web application for online appointment booking. Syncs with Google Calendar. Free for commercial use.
- **Why it's ideal:** Clients can book pre-travel consultation slots directly through the website. The Google Calendar sync prevents double-booking. The system is 100% free with no monthly fees or commissions.
- **Free tier:** Open-source (GPL v3). Self-hosted. Free for commercial use.

---

## 9. Finance & Accounting

### 9.1 Accounting: GnuCash
- **What it is:** A free, open-source accounting software licensed under the GNU GPL. Suitable for personal and small business financial management with double-entry bookkeeping.
- **Why it's ideal:** Tracks all business income, expenses, and financial health at zero cost. The double-entry system provides professional-grade accounting that a CPA will appreciate at tax time.
- **Free tier:** Fully open-source. No limits.

### 9.2 Invoicing: Invoice Ninja (Open-Source)
- **What it is:** An open-source invoicing application for sending invoices and tracking payments. A free alternative to Freshbooks and QuickBooks. Supports income, expenses, payments, and time tracking.
- **Why it's ideal:** Generates professional invoices for concierge fees, tracks which clients have paid, and sends automated payment reminders. The self-hosted version is completely free.
- **Free tier:** Open-source (self-hosted). Free cloud plan available with limited clients/invoices.

### 9.3 Lightweight Alternative: InvoicePlane
- **What it is:** A self-hosted open-source application for managing quotes, invoices, clients, and payments.
- **Why include it:** Even lighter than Invoice Ninja. Ideal if the business needs simple, clean invoicing without the extra features.
- **Free tier:** Open-source. Self-hosted.

---

## 10. Legal Document Management & E-Signatures

### 10.1 E-Signatures: OpenSign
- **What it is:** An open-source e-signature and digital agreement management system. Provides secure, compliant e-signatures comparable to DocuSign without licensing fees.
- **Why it's ideal:** Client service agreements, informed consent waivers, and liability releases can be sent and signed digitally at zero cost. Tracks signing status and provides an audit trail.
- **Free tier:** Open-source. Self-hosted. Unlimited documents and signers.

### 10.2 Alternative: Documenso
- **What it is:** A free, open-source eSignature platform for securely sending, signing, and managing digital documents.
- **Why include it:** Provides an alternative with a different feature set if OpenSign doesn't meet specific needs. Both are zero-cost.
- **Free tier:** Open-source. Self-hosted.

### 10.3 Legal Templates: Rocket Lawyer (Free Tier) + Open-Source Templates
- **What it is:** Rocket Lawyer offers a free LLC Operating Agreement template with AI and legal pro insights. Multiple other platforms (Wonder.Legal, Signeasy, FilingFox) offer free templates for single-member LLC operating agreements, service agreements, and other foundational documents.
- **Why it's ideal:** The foundational legal documents—LLC operating agreement, client service agreements, and liability waivers—can be drafted from free, legally-vetted templates. These should be reviewed by a qualified attorney before use, but the template provides the starting structure at zero cost.
- **Free tier:** Templates are free. Some platforms offer limited free document creation.

---

## 11. Web Analytics & Performance Monitoring

### 11.1 Privacy-First Analytics: Umami
- **What it is:** A modern, privacy-focused, open-source web analytics platform. A cookie-free, GDPR-compliant alternative to Google Analytics.
- **Why it's ideal:** Provides essential metrics (page views, visitor sources, conversion tracking) without the complexity of Google Analytics 4. Self-hosted version is completely free and respects visitor privacy.
- **Free tier:** Open-source (MIT). Self-hosted free. Cloud version has a free hobby tier.

### 11.2 Comprehensive Alternative: Matomo (On-Premise)
- **What it is:** A full-featured, open-source analytics platform (formerly Piwik) that provides complete data ownership with no third-party sharing or sampling. Can be self-hosted.
- **Why include it:** If more advanced analytics are needed (heatmaps, session recordings, funnels), Matomo's on-premise version is free and provides enterprise-grade insights.
- **Free tier:** Open-source (GPL). Self-hosted. Cloud version has limited free tier.

### 11.3 Uptime Monitoring: Uptime Kuma
- **What it is:** A self-hosted, open-source monitoring tool supporting HTTP(S), Ping, DNS, Docker containers, and more. Provides a beautiful status dashboard and notifications via Telegram, email, Slack, etc.
- **Why it's ideal:** Monitors the website, booking system, and API endpoints 24/7. Sends instant alerts if anything goes down. Essential for a business where website availability directly impacts bookings.
- **Free tier:** Open-source (MIT). Self-hosted.

### 11.4 Google Analytics (Supplementary)
- **What it is:** The standard free analytics platform from Google.
- **Why include it:** While Umami or Matomo should be primary for privacy, GA4 provides supplementary data for Google Ads integration and SEO validation.
- **Free tier:** Completely free, unlimited.

---

## 12. Forms, Surveys & Client Feedback

### 12.1 Open-Source Form Builder: HeyForm
- **What it is:** An open-source conversational form builder designed as an alternative to Google Forms and Typeform. No coding required to create engaging surveys, quizzes, and polls.
- **Why it's ideal:** For pre-qualification questionnaires, client intake forms, and post-trip feedback surveys. The conversational format increases completion rates.
- **Free tier:** Open-source. Self-hosted.

### 12.2 Advanced Survey Platform: LimeSurvey
- **What it is:** A free and open-source online survey platform used by businesses of all sizes. Supports complex branching logic, multiple question types, and statistical analysis.
- **Why it's ideal:** For detailed post-trip NPS surveys and client satisfaction tracking. The advanced features support the KPI measurement framework defined in the business plan.
- **Free tier:** Open-source (GPL). Self-hosted.

### 12.3 NPS-Specific Tool: Formbricks
- **What it is:** A free and open-source surveying platform for gathering feedback at every point in the user journey. Supports in-app, website, link, and email surveys.
- **Why it's ideal:** Specifically designed for product-led businesses. Can deploy NPS surveys at specific journey points (post-booking, post-trip, 30-day follow-up).
- **Free tier:** Open-source. Free for personal and commercial use.

---

## 13. Cloud Storage & File Management

### 13.1 Primary Storage: Google Drive (15GB Free)
- **What it is:** 15GB of free cloud storage included with every Google account, shared across Drive, Gmail, and Photos.
- **Why it's ideal:** For storing business documents, client records (non-PHI), marketing assets, and financial reports. 15GB is substantial for document-based storage. Multiple free accounts can be created if more space is needed.
- **Free tier:** 15GB free forever per account.

### 13.2 Large File Transfer: TransferOne
- **What it is:** A secure, GDPR-compliant large file transfer platform. Free of charge with no hidden conditions. Supports transfers up to 100GB.
- **Why it's ideal:** For sending large files (imaging studies, veterinary records) between partner clinics without compression or quality loss.
- **Free tier:** Completely free. Up to 100GB per transfer.

---

## 14. Social Media Management

### 14.1 Scheduling & Publishing: Postiz
- **What it is:** An open-source social media automation and scheduling platform supporting 19 social media channels including Instagram, Facebook, TikTok, Reddit, LinkedIn, X, Threads, BlueSky, Mastodon, YouTube, Pinterest, and more.
- **Why it's ideal:** Manages all social media publishing from a single dashboard. Schedule educational content, client testimonials, and promotional posts across all platforms at zero cost.
- **Free tier:** Open-source. Self-hosted. Unlimited channels and posts.

---

## 15. Google Business Profile & Local SEO (Free Marketing Engine)

### 15.1 Google Business Profile
- **What it is:** A completely free business listing that appears on Google Search and Maps. 86% of GBP views come from category-based searches. Essential for local SEO dominance.
- **Why it's ideal:** This is the primary free marketing channel. A fully optimized GBP with accurate information, professional photos, active review responses, and regular posts will drive significant local traffic for "pet surgery Florida" and related queries. It's free, high-intent, and builds trust through reviews.
- **Free tier:** Completely free, unlimited.

### 15.2 Google Ads Promotional Credits
- **What it is:** New Google Ads advertisers can receive $500 in free ad credits after spending their first $500 on ads within 60 days. This effectively doubles the initial ad budget.
- **Why it's ideal:** While paid advertising is the one exception to the zero-cost principle, the $500 promotional credit effectively halves the cost of the initial geo-fencing campaign targeting veterinary specialty hospitals. This is a strategic investment with measurable ROI.
- **Terms:** Spend $500, get $500 credit (must be claimed within 60 days of account creation).

---

## 16. Password & Credential Management

### 16.1 Team Password Manager: Passbolt (Community Edition)
- **What it is:** An open-source password manager designed for team collaboration. Securely generates, stores, manages, and monitors credentials. Supports multiple browsers and mobile devices.
- **Why it's ideal:** As the business grows beyond a solo operator, secure credential sharing for partner clinic portals, social media accounts, and administrative systems becomes essential. Passbolt provides enterprise-grade security at zero cost.
- **Free tier:** Open-source (AGPL). Self-hosted Community Edition is free and unlimited.

---

## 17. Agent Skill Summary: Complete Configuration Map

Below is the complete mapping of business functions to recommended tools, organized for straightforward agent configuration and deployment:

| Business Function | Primary Tool | Backup/Alternative | Deployment | Cost |
|------------------|-------------|-------------------|------------|------|
| **Website** | Hugo + GitHub Pages | WordPress.com (Free) | Git repo → auto-deploy | $0 |
| **Design & Branding** | Inkscape + Penpot | Namecheap Logo Maker | Desktop + Browser | $0 |
| **Stock Images** | Pixabay | Pexels / Unsplash | Browser | $0 |
| **SEO & Keywords** | Google Search Console + Ahrefs WMT | Google Trends | Browser | $0 |
| **Content AI** | Opace AI Scribe | Manual writing | WordPress Plugin | $0 |
| **CRM** | EspoCRM | Twenty CRM | Self-hosted Docker | $0 |
| **Email Marketing** | phpList / Listmonk | AWS SES (transactional) | Self-hosted Docker | $0 |
| **Project Mgmt** | Vikunja | DokuWiki (docs) | Self-hosted Docker | $0 |
| **Workflow Automation** | n8n (self-hosted) | Telegram Bot API | Self-hosted Docker | $0 |
| **Live Chat Support** | Chatwoot | n8n chatbot | Self-hosted Docker | $0 |
| **Video Calls** | Jitsi Meet | Google Meet (free) | Browser / Self-host | $0 |
| **Booking/Scheduling** | Easy!Appointments | LibreBooking | Self-hosted PHP | $0 |
| **Accounting** | GnuCash | Invoice Ninja | Desktop / Self-host | $0 |
| **E-Signatures** | OpenSign | Documenso | Self-hosted Docker | $0 |
| **Web Analytics** | Umami | Matomo (on-premise) | Self-hosted Docker | $0 |
| **Uptime Monitoring** | Uptime Kuma | OpenStatus | Self-hosted Docker | $0 |
| **Forms & Surveys** | HeyForm + Formbricks | LimeSurvey | Self-hosted Docker | $0 |
| **Cloud Storage** | Google Drive (15GB) | TransferOne (large files) | Browser | $0 |
| **Social Media** | Postiz | Manual posting | Self-hosted Docker | $0 |
| **Local SEO** | Google Business Profile | — | Browser | $0 |
| **Advertising** | Google Ads ($500 credit) | — | Browser | $0* |
| **Password Mgmt** | Passbolt CE | Bitwarden (free) | Self-hosted Docker | $0 |

*\*Google Ads is the only tool with a cost component, but the $500 promotional credit effectively eliminates the initial ad spend.*

---

## 18. Implementation Priority (Agent Configuration Sequence)

The tools should be installed and configured in this order to maximize value while minimizing dependencies:

1. **GitHub + Hugo + GitHub Pages** — Establish the web presence foundation (Day 1)
2. **Google Business Profile** — Claim and optimize immediately (Day 1)
3. **Google Search Console + Analytics** — Begin collecting data (Day 1)
4. **n8n (Self-Hosted)** — Set up the automation backbone (Week 1)
5. **EspoCRM** — Configure client tracking pipeline (Week 1)
6. **Chatwoot** — Deploy live chat widget on website (Week 1)
7. **Easy!Appointments** — Enable online booking (Week 2)
8. **phpList/Listmonk** — Prepare email marketing infrastructure (Week 2)
9. **Inkscape + Pixabay** — Create brand assets and marketing materials (Week 2)
10. **Vikunja + DokuWiki** — Build internal operations system (Week 2)
11. **Umami** — Replace/supplement Google Analytics (Week 3)
12. **Uptime Kuma** — Activate monitoring (Week 3)
13. **OpenSign** — Prepare legal document workflows (Week 3)
14. **Postiz** — Schedule social media content (Week 4)
15. **Jitsi Meet** — Configure for client consultations (Week 4)
16. **GnuCash + Invoice Ninja** — Financial tracking before first transaction (Week 4)
17. **Passbolt** — Secure credentials as team grows (When needed)
18. **Google Ads** — Launch geo-fencing campaign with $500 credit (When site is ready)

---

## 19. Cost Summary: The Zero-Dollar Tech Stack

| Category | Monthly Cost | Annual Cost |
|----------|-------------|-------------|
| Website & Hosting | $0 | $0 |
| Design & Branding | $0 | $0 |
| CRM & Customer Support | $0 | $0 |
| Email Marketing | $0 | $0 |
| Project Management | $0 | $0 |
| Workflow Automation | $0 | $0 |
| Analytics & Monitoring | $0 | $0 |
| E-Signatures & Legal | $0 | $0 |
| Accounting & Invoicing | $0 | $0 |
| Cloud Storage | $0 | $0 |
| Social Media Management | $0 | $0 |
| Google Business Profile | $0 | $0 |
| **Server/Hosting (VPS for self-hosted tools)** | **~$5–10/mo** | **~$60–120/yr** |
| Domain Name | **~$1/mo** | **~$12/yr** |
| **Total Annual Technology Cost** | | **~$72–132** |

The only unavoidable costs are a domain name (~$12/year) and a small VPS for hosting the self-hosted tools (~$5–10/month). Everything else runs on free, open-source software. If even the VPS cost is a barrier, many of these tools can run on a local machine or a free-tier cloud instance (Oracle Cloud free tier, Google Cloud free tier, or AWS free tier) for the first year.

This configuration provides an AI agent with every capability needed to autonomously build the MedPup website, manage customer relationships, automate marketing, process bookings, track finances, and monitor operations—all at effectively zero financial cost.