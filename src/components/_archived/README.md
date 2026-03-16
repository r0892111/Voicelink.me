# Archived Components (TEMPORARY)

These components were temporarily replaced during the Early Access test user campaign.

## How to revert:
1. In `Homepage.tsx`: uncomment `import { PricingSection }` and replace `<EarlyAccessSection />` with `<PricingSection openContactModal={openContactModal} />`
2. In `App.tsx`: revert the desktop and mobile nav CTA buttons from scrolling to `#pricing` back to `navigateWithTransition(withUTM('/signup'))`
3. In `HeroDemo.tsx`: revert the two "Get Started Free" buttons from scrolling to `#pricing` back to `navigateWithTransition(withUTM('/signup'))`
4. In `Homepage.tsx`: revert the integrations "Try for free", Final CTA "Start Free Trial", and footer "Start Free Trial" buttons back to `navigateWithTransition(withUTM('/signup'))`
5. In `ContactFormModal.tsx`: the webhook was also updated — keep the new webhook as it's an improvement
6. Remove the `earlyAccess` keys from all 4 locale JSON files (nl, en, fr, de)
7. Delete `EarlyAccessSection.tsx`

All changes are marked with `TEMPORARY` comments in the code for easy search.
