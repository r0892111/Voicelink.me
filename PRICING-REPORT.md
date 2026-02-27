# VoiceLink Pricing Audit & Restructuring Report

## 1. Previous Structure

### What We Had
6 hidden volume-discount tiers mapped to 3 display cards:

| Tier | Users | Monthly/user | Discount |
|------|-------|-------------|----------|
| Starter | 1–4 | €29.90 | 0% |
| Team | 5–9 | €27.00 | 10% |
| Business | 10–24 | €24.00 | 20% |
| Growth | 25–49 | €21.00 | 30% |
| Scale | 50–99 | €18.00 | 40% |
| Enterprise | 100+ | €15.00 | 50% |

All plans included **"unlimited" WhatsApp voice notes** on a flat per-seat fee.

### Why It Was Problematic

1. **Uncapped cost exposure.** VoiceLink's primary cost driver is LLM token processing per message (estimated €0.10–0.30/msg depending on voice note length and language). A single heavy user sending 100+ messages/month could cost €30+ in processing alone — potentially exceeding their entire subscription fee at the Starter tier.

2. **No margin protection.** With "unlimited" messaging, there was no mechanism to cap costs or charge for excessive usage. Margin was entirely dependent on users self-moderating their usage.

3. **Complex hidden tiers.** 6 pricing tiers mapped to 3 display cards created a confusing UX. Users had to use a dropdown selector to discover pricing changes, and the relationship between tiers and cards was unclear.

4. **Volume discounts at the wrong end.** Discounts up to 50% for large teams compressed margins precisely where support and infrastructure costs scale up.

## 2. Research Summary

### Comparable SaaS Models Reviewed
- **Intercom**: Per-seat + message-based pricing with resolution limits
- **Drift**: Per-seat with conversation caps and overage fees
- **Freshdesk**: Tiered per-agent pricing with feature differentiation
- **HubSpot**: Per-seat with usage-based add-ons
- **Twilio**: Pure usage-based (per-message/per-minute)

### Key Takeaways
- Per-seat + usage caps is the dominant model for messaging/communication SaaS
- Top-up/overage mechanisms are standard and expected by B2B buyers
- 20% annual discount is industry standard
- 4-tier structures (Starter/Pro/Business/Enterprise) are most common
- Feature differentiation should increase meaningfully across tiers

## 3. New Structure

| | Starter | Professional | Business | Enterprise |
|---|---------|-------------|----------|------------|
| **Price** | €19/user/mo | €34/user/mo | €49/user/mo | Custom |
| **Users** | 1–3 | 4–10 | 11–25 | 25+ |
| **Messages/user/mo** | 30 | 60 | 100 | Negotiated |
| **Annual price** | €15/user/mo | €27/user/mo | €39/user/mo | Custom |
| **Top-up** | +25 msgs / €15 | +25 msgs / €14 | +50 msgs / €28 | — |

### Margin Analysis

**Assumptions:**
- Average LLM processing cost per message: €0.15 (blended across short/long notes)
- Infrastructure overhead per user/month: ~€2

| Tier | Monthly Revenue/user | Max Processing Cost (all msgs used) | Infrastructure | Min Margin/user | Min Margin % |
|------|---------------------|-------------------------------------|----------------|-----------------|-------------|
| Starter (€19) | €19 | €4.50 (30 × €0.15) | €2 | €12.50 | 66% |
| Professional (€34) | €34 | €9.00 (60 × €0.15) | €2 | €23.00 | 68% |
| Business (€49) | €49 | €15.00 (100 × €0.15) | €2 | €32.00 | 65% |

**Top-up margins:**
- Starter: 25 msgs for €15 → cost €3.75 → margin €11.25 (75%)
- Professional: 25 msgs for €14 → cost €3.75 → margin €10.25 (73%)
- Business: 50 msgs for €28 → cost €7.50 → margin €20.50 (73%)

**Worst-case scenario (€0.30/msg):**

| Tier | Revenue | Processing Cost | Infrastructure | Margin | Margin % |
|------|---------|----------------|----------------|--------|----------|
| Starter | €19 | €9.00 | €2 | €8.00 | 42% |
| Professional | €34 | €18.00 | €2 | €14.00 | 41% |
| Business | €49 | €30.00 | €2 | €17.00 | 35% |

Even in the worst case, all tiers maintain positive margins with clear caps.

## 4. Decision Rationale

1. **Message caps protect margins.** Every tier now has a defined message limit, ensuring LLM processing costs are bounded and predictable. No more "unlimited" exposure.

2. **Top-ups create upsell opportunities.** Users who hit their cap can purchase additional messages, generating high-margin incremental revenue rather than consuming resources for free.

3. **Simpler tier structure.** 4 clean tiers replace 6 hidden ones. Each tier maps 1:1 to a display card. No more confusing dropdown selectors.

4. **Lower entry price.** Starter at €19 (down from €29.90) lowers the barrier to entry while message caps protect against cost overruns.

5. **Better feature differentiation.** Each tier adds meaningful features (priority support, account manager, custom integrations, SLA) that justify the price increase.

6. **Enterprise as a conversation.** The Enterprise tier uses a "Get Custom Quote" CTA, allowing negotiation of message volumes, SLAs, and custom integrations for large deployments.
