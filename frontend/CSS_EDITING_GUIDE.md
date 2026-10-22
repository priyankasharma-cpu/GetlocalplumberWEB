# CSS editing guide

This is an organization refactor. Existing colors, typography, route behavior, data, and animations are retained. All paths below are relative to the repository root.

## Shared foundations

- `frontend/src/styles/global.css`: reset, root defaults, basic link/button normalization, focus outlines, skip link, smooth scrolling, and reduced-motion accessibility. No page/component layouts belong here.
- `frontend/src/styles/variables.css`: the existing brand colors, typography sizes, container width, spacing, radii, and header/logo dimensions. The font-family token retains the same Inter/Segoe UI/Arial fallback stack. Navbar size remains 15px.
- `frontend/src/styles/typography.css`: genuine base body, paragraph, heading, and label typography.
- `frontend/src/styles/utilities.css`: intentionally shared section, breadcrumb, toolbar, search field, feature-icon, badge, checklist, and action-row primitives.
- `frontend/src/styles/sectionTokens.css`: three shared section token bindings loaded after component imports, preserving the original final section width and vertical spacing cascade. Keep this late import in `main.jsx`; moving it changes existing page geometry.
- `frontend/src/styles.css`: foundation import manifest. Component rules are not collected here.
- `frontend/src/components/ui/Button.css`, `Form.css`, `FormPage.css`, and `EmptyState.css`: intentional reusable primitives. Generic button/input classes are shared by design, rather than accidental component globals.

## Header, footer, and branding

Edit `frontend/src/components/layout/Header.css` for the sticky header, navigation, dropdown, tablet menu, and placement of location/call/account controls. The header has a `site-header` root and a `site-header-strip` sibling. Its navigation consumes `--navbar-font-size: 15px`.

Edit `frontend/src/components/layout/Footer.css` for footer CTA, columns, trust message, links, headings, and copyright. Rules are scoped to `site-footer` using zero-specificity `:where()` guards so they cannot affect the header or service cards.

Edit `frontend/src/components/layout/Brand.css` for the shared vector logo/wordmark. Header/footer placement overrides stay with their parent, while brand visuals remain shared. `MobileNav.css` owns the five mobile destinations and safe-area behavior.

## Homepage sections

`frontend/src/pages/Home.css` contains only the page root. Each actual section imports its own CSS: Hero, TrustStrip, ServicesSection, WhyChooseUs, HowItWorks, EmergencyCTA, LocationsPreview, ProjectsPreview, and FAQSection under `frontend/src/components/home/`.

Home.jsx still owns GSAP setup, scoped selectors, and cleanup. Section extraction adds no DOM wrappers. The existing `.hero .reveal` and `.scroll-reveal` targets remain intact.

## Services and detail pages

- Directory root: `frontend/src/pages/Services.css`.
- Shared collection layout: `frontend/src/components/services/ServiceGrid.css`. It retains two columns through tablet and four from 1024px.
- List variant: `frontend/src/components/services/ServiceList.css`, imported by the collection/card. It is a variant of the same card and Motion node, so no redundant ServiceList React component was introduced.
- Toggle: `frontend/src/components/services/ViewToggle.css`.
- Card appearance and interactions: `frontend/src/components/services/ServiceCard.css`.
- Missing-image fallback: `frontend/src/components/services/ServiceImage.css`.
- Three-image collage: `frontend/src/components/services/ServiceCollage.css`.
- Estimator: `frontend/src/components/services/CostEstimator.css`.
- Detail hero, facts, checklist layout, call process, and related-services container: `frontend/src/pages/ServiceDetail.css`.
- Shared FAQ accordion: `frontend/src/components/ui/FAQs.css`. The section layout is `frontend/src/components/home/FAQSection.css`, intentionally reused by the detail-page FAQ section.

Existing routes and service image mappings remain in place. See EDITING_GUIDE.md for replacing images/content.

## Planner and dialogs

The existing `frontend/src/components/Planner.jsx` keeps state, draft recovery, answer choices, ticket saving, focus handling, and API integration. Its own `Planner.css` handles modal-specific labels. Shared overlay/dialog geometry lives in `frontend/src/components/Dialog.css`, also explicitly imported by the planner and confirmation dialog.

Questions/options/progress: `frontend/src/components/callPlanner/CallPlannerSteps.css`. Final ticket: `frontend/src/components/callPlanner/CallTicket.css`. Quote form overrides: `frontend/src/components/dashboard/QuoteModal.css`. ConfirmationDialog has no unique visual rules, so it deliberately reuses Dialog.css rather than creating an empty stylesheet.

## Account and My Projects

Account.css and Contact.css are in `frontend/src/pages/`. Shared responsive form-page geometry is `frontend/src/components/ui/FormPage.css`, and form controls/cards use Form.css. Login, registration, and profile retain the same page/state logic and share those forms.

`frontend/src/pages/Projects.css` owns dashboard-level layout and guest-import information. Individual cards use `frontend/src/components/dashboard/ProjectCard.css`, progress uses `ProjectProgress.css`, and quotes use `QuoteModal.css`. Presentation components receive the existing mutation callbacks; guest storage and authenticated ownership logic have not moved into CSS or been rewritten.

## Locations

Directory grid: `frontend/src/pages/Locations.css`. Individual state cards: `frontend/src/components/locations/StateCard.css`. State detail: `frontend/src/pages/StateDetail.css`. City drawer/modal: `frontend/src/components/locations/LocationSelector.css`. Header location control: LocationButton.css. Greeting/location row: GreetingRow.css in the same folder.

LocationContext.jsx retains selection, persistence, and geographic search. Context primitives and label helpers are separate from presentation to avoid import cycles.

## Responsive rules and animations

Each component stylesheet contains its own existing media queries. There is no catch-all responsive stylesheet. Base and later token refinements sometimes remain separate blocks to preserve the original order relative to overlapping breakpoints; do not arbitrarily sort these rules.

The shared phone ringing keyframes live in `frontend/src/animations/phoneRing.css`, imported explicitly by CallButton and MobileNav. Motion card settings remain in `frontend/src/animations/animationVariants.js`. Framer Motion transitions remain next to their components. GSAP cleanup remains in Home.jsx. Global reduced-motion rules stay in global.css.

## Safe editing workflow

1. Locate the owning JSX/CSS pair in the mapping below.
2. Change shared colors/fonts/spacing in variables.css first; preserve the existing token names and aliases.
3. Keep component selectors under their existing root or a component-prefixed class. `:where()` guards isolate descendants without increasing specificity.
4. Import a new component's stylesheet directly from that component. Do not add its layout rules to global.css.
5. Load parent placement styles after child component imports. Preserve the late shared section token import in main.jsx.
6. Keep responsive adjustments in that component file, beside its base styles. Do not add !important to fight another component.
7. Run build, lint, tests, and browser regression checks after changes.

## Verification commands

From the repository root: `npm run build`, `npm run lint -w frontend`, and `npm test`. CSS architecture tests verify imports, parsing, duplicate selector/property definitions within the same condition, the clean reset, and absence of local React import cycles.

`node frontend/scripts/qa-server.mjs` serves development-only checks: `/__qa` tests responsive layouts; `/__visual?width=390&page=%2F` shows a page at a chosen CSS viewport; `/__css` records computed styles; `/__css?mode=before` uses the preserved original CSS against the equivalent rendered component structure. Run `node frontend/scripts/build-css-baseline.mjs` to rebuild the historical CSS fixture. These tools and fixtures are never deployed as application routes.

Baseline screenshots and before/after computed-style reports are stored in `frontend/test-results/css-refactor/`. Browser zoom adds padding around screenshot frames; the review iframe itself uses the requested CSS viewport. Compare only matching frames.

## Complete JSX-to-stylesheet mapping

All paths below exist in the final checkout. Facades and behavior-only modules deliberately have no empty stylesheet.

- `frontend/src/App.jsx` → `frontend/src/App.css`
- `frontend/src/components/callPlanner/CallPlannerSteps.jsx` → `frontend/src/components/callPlanner/CallPlannerSteps.css`
- `frontend/src/components/callPlanner/CallTicket.jsx` → `frontend/src/components/callPlanner/CallTicket.css`
- `frontend/src/components/ConfirmDialog.jsx` → `frontend/src/components/Dialog.css`
- `frontend/src/components/dashboard/ProjectCard.jsx` → `frontend/src/components/dashboard/ProjectCard.css`
- `frontend/src/components/dashboard/ProjectProgress.jsx` → `frontend/src/components/dashboard/ProjectProgress.css`
- `frontend/src/components/dashboard/QuoteModal.jsx` → `frontend/src/components/dashboard/QuoteModal.css`
- `frontend/src/components/Dialog.jsx` → `frontend/src/components/Dialog.css`
- `frontend/src/components/home/EmergencyCTA.jsx` → `frontend/src/components/home/EmergencyCTA.css`
- `frontend/src/components/home/FAQSection.jsx` → `frontend/src/components/home/FAQSection.css`
- `frontend/src/components/home/Hero.jsx` → `frontend/src/components/home/Hero.css`
- `frontend/src/components/home/HowItWorks.jsx` → `frontend/src/components/home/HowItWorks.css`
- `frontend/src/components/home/LocationsPreview.jsx` → `frontend/src/components/home/LocationsPreview.css`
- `frontend/src/components/home/ProjectsPreview.jsx` → `frontend/src/components/home/ProjectsPreview.css`
- `frontend/src/components/home/ServicesSection.jsx` → `frontend/src/components/services/ServiceGrid.css`, `frontend/src/components/home/ServicesSection.css`
- `frontend/src/components/home/TrustStrip.jsx` → `frontend/src/components/home/TrustStrip.css`
- `frontend/src/components/home/WhyChooseUs.jsx` → `frontend/src/components/home/WhyChooseUs.css`
- `frontend/src/components/layout/Brand.jsx` → `frontend/src/components/layout/Brand.css`
- `frontend/src/components/layout/Footer.jsx` → `frontend/src/components/layout/Footer.css`
- `frontend/src/components/layout/Header.jsx` → `frontend/src/components/layout/Header.css`
- `frontend/src/components/layout/MobileNav.jsx` → `frontend/src/animations/phoneRing.css`, `frontend/src/components/layout/MobileNav.css`
- `frontend/src/components/Layout.jsx` → re-export facade; exported components own their styles
- `frontend/src/components/locations/GreetingRow.jsx` → `frontend/src/components/locations/GreetingRow.css`
- `frontend/src/components/locations/LocationButton.jsx` → `frontend/src/components/locations/LocationButton.css`
- `frontend/src/components/locations/LocationSelector.jsx` → `frontend/src/components/locations/LocationSelector.css`
- `frontend/src/components/locations/StateCard.jsx` → `frontend/src/components/locations/StateCard.css`
- `frontend/src/components/Planner.jsx` → `frontend/src/components/Dialog.css`, `frontend/src/components/Planner.css`
- `frontend/src/components/SEO.jsx` → behavior/context/metadata module; no visual style ownership
- `frontend/src/components/services/CostEstimator.jsx` → `frontend/src/components/services/CostEstimator.css`
- `frontend/src/components/services/ServiceCard.jsx` → `frontend/src/components/services/ServiceList.css`, `frontend/src/components/services/ServiceCard.css`
- `frontend/src/components/services/ServiceCollage.jsx` → `frontend/src/components/services/ServiceCollage.css`
- `frontend/src/components/services/ServiceGrid.jsx` → `frontend/src/components/services/ServiceList.css`, `frontend/src/components/services/ServiceGrid.css`
- `frontend/src/components/services/ServiceIcon.jsx` → Lucide SVG props and inherited color; no unique stylesheet
- `frontend/src/components/services/ServiceImage.jsx` → `frontend/src/components/services/ServiceImage.css`
- `frontend/src/components/services/ViewToggle.jsx` → `frontend/src/components/services/ViewToggle.css`
- `frontend/src/components/ServiceSearch.jsx` → `frontend/src/components/ServiceSearch.css`
- `frontend/src/components/ui/CallButton.jsx` → `frontend/src/animations/phoneRing.css`, `frontend/src/components/ui/CallButton.css`
- `frontend/src/components/ui/FAQs.jsx` → `frontend/src/components/ui/FAQs.css`
- `frontend/src/components/ui/SectionTitle.jsx` → `frontend/src/components/ui/SectionTitle.css`
- `frontend/src/components/UI.jsx` → re-export facade; exported components own their styles
- `frontend/src/context/LocationContext.jsx` → behavior/context/metadata module; no visual style ownership
- `frontend/src/context.jsx` → behavior/context/metadata module; no visual style ownership
- `frontend/src/hooks/ScrollToHash.jsx` → behavior/context/metadata module; no visual style ownership
- `frontend/src/main.jsx` → `frontend/src/styles.css`, `frontend/src/styles/sectionTokens.css`
- `frontend/src/pages/Account.jsx` → `frontend/src/components/ui/FormPage.css`, `frontend/src/pages/Account.css`
- `frontend/src/pages/Contact.jsx` → `frontend/src/components/ui/FormPage.css`, `frontend/src/pages/Contact.css`
- `frontend/src/pages/Home.jsx` → `frontend/src/pages/Home.css`
- `frontend/src/pages/Locations.jsx` → `frontend/src/pages/Locations.css`
- `frontend/src/pages/NotFound.jsx` → shared section, button, and EmptyState primitives; no unique stylesheet
- `frontend/src/pages/Projects.jsx` → `frontend/src/pages/Projects.css`
- `frontend/src/pages/ServiceDetail.jsx` → `frontend/src/components/services/ServiceGrid.css`, `frontend/src/components/home/FAQSection.css`, `frontend/src/pages/ServiceDetail.css`
- `frontend/src/pages/Services.jsx` → `frontend/src/pages/Services.css`
- `frontend/src/pages/StateDetail.jsx` → `frontend/src/pages/StateDetail.css`

## Refactor inventory

The application source contains 55 CSS files. Compared with the four previous files, 52 CSS files were created, three existing files were modified (styles.css, styles/variables.css, and styles/typography.css), and styles/globals.css was removed after its rules were assigned to owners. Historical fixtures are outside src and are not application styles.


## Final verification and intentional correction

- All 55 source stylesheets are referenced; no orphan or broken stylesheet imports were found.
- Production build and ESLint pass. All 23 automated tests pass: 11 backend tests and 12 frontend tests, including four architecture checks.
- Responsive browser harness: 147/147 cases pass at all 11 original widths, including 320, 360, 375, 390, 430, 768, 1024, and 1440px. The directory remains two columns through tablet and four from 1024px, with no detected overflow or broken images.
- Compared 105,024 computed properties across nine routes at 390px and 1440px. Every difference was inside the navbar and resulted from the explicit correction below; no differences were recorded outside it. This includes page geometry, typography, colors, backgrounds, borders, shadows, forms, footer, and service layouts in those recorded states.
- The actual navbar token was 17px when inspected. It was restored to the required 15px. Font/line-height and text-box changes within navigation are intentional; the architecture refactor otherwise preserves recorded styling. The regression fixture retains the original 17px value so this correction stays visible in comparisons.
- Actual browser checks passed for homepage keyboard service search, Grid/List filtering, three-image collage, four planner questions/final ticket/close, existing saved project rendering, quote modal opening, city selection/persistence/clear, and login/registration form switching. No new console errors were recorded during these checks. Existing guest projects and quotes were preserved.
- Removed 62 unconditionally superseded declarations and 11 resulting empty rule blocks during migration. Additional superseded footer-logo and section-width declarations were removed to preserve their original winning values. The architecture test rejects duplicate selector/property definitions in the same condition.
- Sixteen baseline screenshots were captured. The browser screenshot API subsequently failed for after captures, even with a visible preview and viewport retries. Full screenshot-based visual comparison remains pending; computed-style equality is not presented as successful pixel comparison. Physical-device and cross-browser audits were not performed.

The application has 52 newly created source CSS files (55 total). Three original source CSS files were modified, and the old globals.css monolith was removed. Two historical CSS fixture files under test-results are separate from application styles. Backend source and image assets were not modified.
