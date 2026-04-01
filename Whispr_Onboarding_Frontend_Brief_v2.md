**WHISPR**

**Organizer Onboarding**

**Frontend Engineering Brief**

Derived from Organizer Onboarding PRD v2.0

Scope: Client-side simulation architecture, fixture data system,
onboarding context provider, UI components (progress widget, context
banners, tooltip overlay, persona switch interstitial), stage-by-stage
screen builds, and integration with backend onboarding API.

  ------------------------ ----------------------------------------------
  **Document Type**        Frontend Engineering Brief

  **Derived From**         Organizer Onboarding PRD v2.0

  **Date**                 April 2, 2026

  **Author**               Saad Noor

  **Audience**             Frontend Engineering Team

  **Stack**                React + existing component library

  **Backend Dependency**   Backend Onboarding API --- COMPLETED (10
                           endpoints under /api/onboarding/)

  **Estimated Effort**     5--7 weeks
  ------------------------ ----------------------------------------------

1\. Overview for Frontend Team

The onboarding experience is primarily a frontend project. The backend
provides state persistence, WhatsApp delivery, and draft event creation
--- but the simulation itself (everything the organizer sees and
interacts with during Stages 2--4) runs entirely in the browser using
fixture data and the same UI components already in the codebase.

+---+--------------------------------------------------------------------+
|   | **BACKEND STATUS: COMPLETE**                                       |
|   |                                                                    |
|   | The backend API is built and ready. 10 endpoints under             |
|   | /api/onboarding/ using OrganizerOnboardingController +             |
|   | OrganizerOnboardingService. Key implementation note: the           |
|   | /whatsapp/ticket-confirmed endpoint handles QR generation, S3      |
|   | upload, and WhatsApp delivery internally via the existing          |
|   | TicketService --- no QR image is needed from the frontend. Only 2  |
|   | of the 3 WhatsApp messages use 360dialog templates                 |
|   | (application-received, application-approved); the ticket           |
|   | confirmation uses sendMessage(). Rate limiting uses file-based     |
|   | caching. Auth via existing jwt.auth middleware.                    |
+---+--------------------------------------------------------------------+

1.1 What You Are Building

**1. OnboardingProvider** --- A React context that wraps the app, reads
onboarding state from the backend on load, and controls which
data-fetching hooks return fixture data vs. real API responses.

**2. Fixture Data System** --- A set of typed JSON files that replicate
exact Laravel API response shapes for events, applications, tickets, and
applicant profiles. These feed the simulation.

**3. Stage Flows** --- The screen-by-screen experience for each
onboarding stage: attendee tour (S2), organizer tour (S3), optional
event setup (S4), and dashboard orientation (S5).

**4. Onboarding Shell Components** --- Persistent progress widget,
context banners, persona switch interstitial, tour overlay tooltips, and
the inline notification preview card.

**5. Backend Integration** --- API calls to the onboarding state
endpoints (advance, skip, navigate-back, reinvoke, tooltip) and
fire-and-forget WhatsApp trigger calls.

2\. Client-Side Simulation Architecture

2.1 The Core Pattern: Service-Layer Interception

The simulation works by intercepting data at the service layer --- the
functions or hooks that call Laravel APIs and return typed data to
components. When onboarding mode is active and the current stage is a
simulation stage, these hooks return fixture data instead of making
network requests. Components never know they're in onboarding mode. They
receive the same data shapes they always do.

+---+--------------------------------------------------------------------+
|   | **WHY SERVICE LAYER**                                              |
|   |                                                                    |
|   | Not component level (too many components to patch, fragile). Not   |
|   | network level (too coarse --- some calls during onboarding are     |
|   | real, like state persistence and WhatsApp). Service layer is the   |
|   | sweet spot: one interception point per data type, clean            |
|   | separation, and components stay untouched.                         |
+---+--------------------------------------------------------------------+

2.2 OnboardingProvider

A React context provider that wraps the application root. It exposes
onboarding state and controls simulation behavior.

**Context Shape**

> interface OnboardingContext {
>
> // State from backend
>
> isOnboarding: boolean;
>
> currentStage: Stage;
>
> completedStages: Stage\[\];
>
> skippedStages: Stage\[\];
>
> tooltipState: Record\<string, boolean\>;
>
> // Derived
>
> isSimulationActive: boolean; // true when currentStage is S2, S3, or
> S4
>
> currentPersona: \'attendee\' \| \'organizer\' \| null;
>
> // Actions (call backend API + update local state)
>
> advanceStage: (completed: Stage, next: Stage) =\> Promise\<void\>;
>
> skipStage: (skipped: Stage, next: Stage) =\> Promise\<void\>;
>
> navigateBack: (target: Stage) =\> Promise\<void\>;
>
> reinvoke: () =\> Promise\<void\>;
>
> dismissTooltip: (tooltipId: string) =\> Promise\<void\>;
>
> // Simulation-specific
>
> simulationState: SimulationState;
>
> updateSimulationState: (patch: Partial\<SimulationState\>) =\> void;
>
> }

**SimulationState**

Local (non-persisted) state that tracks the organizer's progress within
a simulation stage. This drives the phase-by-phase progression in S2 and
the applicant interaction tracking in S3.

> interface SimulationState {
>
> // S2 Attendee Tour
>
> attendeePhase: \'discovery\' \| \'application\' \| \'review\' \|
> \'approved\' \| \'payment\' \| \'ticket\' \| null;
>
> applicationSubmitted: boolean;
>
> paymentSimulated: boolean;
>
> // S3 Organizer Tour
>
> applicantsActioned: number; // Count of approve/reject actions taken
>
> applicantActions: Record\<string, \'approved\' \| \'rejected\' \|
> \'waitlisted\'\>;
>
> showNotificationPreview: string \| null; // Applicant ID to show
> preview for
>
> // S4 Event Setup
>
> guidedSetupChosen: boolean \| null; // null = choice not yet made
>
> draftEventData: Partial\<DraftEvent\>;
>
> }

**Initialization Flow**

On app load, the provider calls GET /api/onboarding/state. If
is_onboarding is true, it initializes the onboarding context and renders
the onboarding shell components (progress widget, banners). If
is_onboarding is false or the field is missing/null, the provider
renders children normally with no onboarding UI. The provider must
handle the case where the backend field does not exist (pre-migration
records) --- treat null/undefined as false.

2.3 Service-Layer Interception Pattern

For each data type involved in the simulation, the existing
data-fetching hook needs a conditional branch.

**Example: Event Data**

> // Before (existing)
>
> function useEventDetails(eventId: string) {
>
> return useQuery(\[\'event\', eventId\], () =\> api.getEvent(eventId));
>
> }
>
> // After (with onboarding interception)
>
> function useEventDetails(eventId: string) {
>
> const { isSimulationActive } = useOnboarding();
>
> return useQuery(
>
> \[\'event\', eventId, isSimulationActive\],
>
> () =\> {
>
> if (isSimulationActive) {
>
> return Promise.resolve(DEMO_EVENT_FIXTURE);
>
> }
>
> return api.getEvent(eventId);
>
> }
>
> );
>
> }

+---+--------------------------------------------------------------------+
|   | **PATTERN RULE**                                                   |
|   |                                                                    |
|   | The interception returns a Promise.resolve() of the fixture data,  |
|   | not the raw fixture. This keeps the return type identical to the   |
|   | real API call and ensures loading/error states behave              |
|   | consistently.                                                      |
+---+--------------------------------------------------------------------+

**Hooks Requiring Interception**

  ---------------------------- ------------------------------ -----------------
  **Hook / Service Function**  **Fixture Returned During      **Used In Stage**
                               Simulation**                   

  useEventList() or            Array containing single        S2 (discovery)
  fetchEvents()                DEMO_EVENT_FIXTURE             

  useEventDetails(id)          DEMO_EVENT_FIXTURE             S2 (discovery,
                                                              application)

  useApplicationStatus()       Fixture cycling through states S2 (all phases)
                               based on attendeePhase         

  useTicketDetails()           TICKET_FIXTURE with generated  S2 (ticket phase)
                               QR data                        

  useApplicantQueue(eventId)   APPLICANT_POOL_FIXTURE (8--12  S3
                               randomly sampled)              

  useApplicantDetails(id)      Individual applicant from      S3
                               APPLICANT_POOL_FIXTURE         

  useEventDashboard(eventId)   DEMO_EVENT_DASHBOARD_FIXTURE   S3
  ---------------------------- ------------------------------ -----------------

Hooks not in this list (organization profile, account data, settings)
are NOT intercepted --- they always hit the real API, even during
onboarding.

3\. Fixture Data System

3.1 File Structure

> src/
>
> onboarding/
>
> fixtures/
>
> demo-event.ts // EventResponse type
>
> demo-event-dashboard.ts // EventDashboardResponse type
>
> applicant-pool.ts // ApplicantResponse\[\] (20 profiles)
>
> application-states.ts // ApplicationStatusResponse variants
>
> ticket.ts // TicketResponse type
>
> index.ts // Exports + random sampling helper
>
> context/
>
> OnboardingProvider.tsx
>
> useOnboarding.ts
>
> types.ts
>
> components/
>
> ProgressWidget/
>
> ContextBanner/
>
> PersonaSwitchInterstitial/
>
> TooltipOverlay/
>
> NotificationPreview/
>
> ChoiceScreen/
>
> TransitionScreen/
>
> stages/
>
> S0AccountSetup/
>
> S1OrgSetup/
>
> S2AttendeeTour/
>
> S3OrganizerTour/
>
> S4EventSetup/
>
> S5DashboardOrientation/

3.2 Fixture Data Contract

+---+--------------------------------------------------------------------+
|   | **CRITICAL RULE**                                                  |
|   |                                                                    |
|   | Every fixture file must export data that exactly matches the       |
|   | TypeScript type of the corresponding Laravel API response. Not the |
|   | shape after transformation, not a simplified version --- the exact |
|   | API response type. If the API returns { data: { event: { \... } }  |
|   | }, the fixture must include that wrapper. If the API returns       |
|   | snake_case, the fixture uses snake_case. This is the #1 thing that |
|   | will break the simulation if done wrong.                           |
+---+--------------------------------------------------------------------+

**Fixture Validation Strategy**

Each fixture file should satisfy the API response type at compile time.
If the API response types are defined as TypeScript interfaces (they
should be), the fixture export should be typed as that interface. Any
API response shape change will produce a compile error in the fixture
file, forcing an update.

> // Example: demo-event.ts
>
> import type { EventResponse } from \'@/api/types\';
>
> export const DEMO_EVENT_FIXTURE: EventResponse = {
>
> data: {
>
> event: {
>
> id: \'onboarding-demo-event\',
>
> name: \'Whispr Demo Night\',
>
> venue: \'Undisclosed Location, Karachi\',
>
> date: new Date(Date.now() + 7 \* 86400000).toISOString(),
>
> capacity: 150,
>
> dress_code: \'All black. No exceptions.\',
>
> screening_questions: \[
>
> { id: \'sq1\', text: \'How did you hear about us?\' },
>
> { id: \'sq2\', text: \'Describe your ideal night out\' },
>
> \],
>
> lineup: \[
>
> { name: \'KAEF\', genre: \'Deep House\' },
>
> { name: \'Noor Jehan Redux\', genre: \'Techno\' },
>
> { name: \'Saroor\', genre: \'Minimal\' },
>
> \],
>
> // \... every field the real API returns
>
> }
>
> }
>
> };

3.3 Applicant Pool and Random Sampling

The applicant pool contains 20 profiles. On each onboarding session (or
S3 entry), 8--12 are randomly sampled. The sampling happens client-side
when the fixture is first loaded for S3. The sampled set is stored in
SimulationState so it persists across re-renders within the session.

> // applicant-pool.ts
>
> import type { ApplicantResponse } from \'@/api/types\';
>
> export const FULL_APPLICANT_POOL: ApplicantResponse\[\] = \[
>
> // 20 profiles, each conforming to ApplicantResponse
>
> // Mix: 6-7 strong fits, 5-6 poor fits, 5-6 borderline,
>
> // 1 mutual connection, 1 repeat attendee
>
> \];
>
> export function sampleApplicants(min = 8, max = 12):
> ApplicantResponse\[\] {
>
> const count = Math.floor(Math.random() \* (max - min + 1)) + min;
>
> const shuffled = \[\...FULL_APPLICANT_POOL\].sort(() =\>
> Math.random() - 0.5);
>
> return shuffled.slice(0, count);
>
> }

3.4 Dynamic Fixture Fields

Some fixture fields cannot be static --- they depend on the current date
or the organizer's data. These are computed at fixture-load time.

  ------------------ ----------------------- ---------------------------------
  **Field**          **Fixture File**        **Dynamic Rule**

  Demo event date    demo-event.ts           NOW + 7 days, computed when
                                             fixture is loaded

  Demo event lineup  demo-event.ts           Shuffled on each load for variety
  order                                      

  Applicant sample   applicant-pool.ts       Random 8--12 from pool of 20
  set                                        

  Ticket QR code     ticket.ts               Generated client-side from a
  data                                       deterministic string (e.g.,
                                             "onboarding-\[org-id\]")

  Application        application-states.ts   Relative to NOW (submitted 2 min
  timestamps                                 ago, approved 1 min ago, etc.)
  ------------------ ----------------------- ---------------------------------

4\. Onboarding Shell Components

These components are rendered by the OnboardingProvider when
is_onboarding is true. They overlay the existing application UI without
modifying it. All components use the Whispr design system: dark
backgrounds (#111, #1A1A1A), copper accents (#D4A574), Monument Extended
for headings, system font for body.

4.1 ProgressWidget

A persistent floating element anchored to the bottom-left of the
viewport. Always visible during onboarding. Two states: collapsed and
expanded.

Collapsed State

  ------------------ ----------------------------------------------------
  **Property**       **Value**

  Size               280px wide, \~80px tall

  Position           Fixed, bottom-left, 16px from edges

  Contents           Thin copper progress bar (proportional to completed
                     stages), current stage label in Monument Extended,
                     "Next: \[action\]" in system font #999

  Interaction        Click anywhere to expand

  Z-index            1000

  Background         #111111 with subtle border #333
  ------------------ ----------------------------------------------------

Expanded State

  ------------------ ----------------------------------------------------
  **Property**       **Value**

  Size               360px wide, viewport height minus 32px

  Position           Fixed, bottom-left, 16px from edges

  Contents           Full stage list with states (completed = checkmark
                     in copper, current = highlighted, skipped =
                     strike-through #666, pending = dimmed). Each
                     completed/skipped stage is clickable (triggers
                     navigate-back). "Skip" link next to each skippable
                     stage. "Skip to dashboard" CTA at bottom.

  Animation          200ms ease-out expand/collapse

  Close              Chevron toggle or click outside

  Background         #111111
  ------------------ ----------------------------------------------------

+---+--------------------------------------------------------------------+
|   | **RE-INVOCATION ENTRY**                                            |
|   |                                                                    |
|   | After onboarding is complete and the widget is gone, the           |
|   | re-invocation entry point is in the organizer's account Settings   |
|   | page. A button: "Replay onboarding tour" that calls POST           |
|   | /api/onboarding/reinvoke.                                          |
+---+--------------------------------------------------------------------+

4.2 ContextBanner

A thin, persistent banner at the top of the viewport during S2 and S3.
Communicates which persona the organizer is currently experiencing.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Height           40px

  Position         Fixed, top: 0, full width

  Z-index          999

  S2 variant       Background: subtle copper gradient (left to right, 8%
                   to 0% opacity). Icon: eye. Text: "You're viewing
                   Whispr as an attendee" in 13px system font, #CCC

  S3 variant       Background: #111 with 2px copper left border. Icon:
                   shield. Text: "You're managing Whispr Demo Night" in
                   13px system font, #CCC

  Push content     The banner pushes page content down by 40px (add
                   padding-top to main container when banner is visible)
  ---------------- ------------------------------------------------------

4.3 PersonaSwitchInterstitial

Full-screen takeover that plays during the single persona switch between
S2 (attendee tour complete) and S3 (organizer tour start). This is a
theatrical moment --- it should feel like a reveal, not a loading
screen.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Background       #0A0A0A, full viewport

  Primary text     "Now let's see what it looks like from behind the
                   curtain" --- Monument Extended, 28px, #FFFFFF,
                   centered

  Subtext          "Switching to organizer view..." --- system font,
                   14px, #666, appears 0.5s after primary

  Animation        Primary text fades in (0.3s). Subtext fades in (0.3s,
                   0.5s delay). Entire screen fades out (0.5s, after 2s
                   total). Organizer dashboard fades in behind.

  Duration         \~2.5 seconds total. Not user-dismissible --- it's a
                   transition, not a modal.

  Z-index          2000 (above everything)
  ---------------- ------------------------------------------------------

4.4 TooltipOverlay

Reusable tooltip component used across all stages. Anchors to a target
DOM element, dims the background, highlights the target, and displays
guidance content.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Backdrop         Full viewport, #000 at 40% opacity, pointer-events:
                   none

  Target highlight Target element receives: 2px copper glow (box-shadow:
                   0 0 0 2px #D4A574), elevated z-index (1001),
                   pointer-events: auto

  Card             #1A1A1A background, 1px #333 border, 8px
                   border-radius, max-width 320px, 16px padding

  Card position    Dynamic --- positioned relative to target. Prefer
                   bottom-right placement. If overflow, flip to top or
                   left. 12px gap from target.

  Title            14px Monument Extended, #FFFFFF

  Body             13px system font, #999999, max 3 lines

  Step counter     12px system font, #666, bottom-left: "1 of 4"

  CTA button       Copper background, #111 text, 12px font, pill shape.
                   Label: "Continue" during sequences, "Got it" for
                   standalone

  Z-index          Card at 1002, backdrop at 999
  ---------------- ------------------------------------------------------

**Tooltip Data Structure**

> interface TooltipConfig {
>
> id: string;
>
> targetSelector: string; // CSS selector for anchor element
>
> title: string;
>
> body: string;
>
> placement?: \'top\' \| \'bottom\' \| \'left\' \| \'right\'; // Hint,
> auto-flips on overflow
>
> sequence?: {
>
> group: string; // e.g., \'s1_org_setup\', \'s5_orientation\'
>
> index: number; // Position in sequence
>
> total: number; // Total in sequence
>
> };
>
> onDismiss?: () =\> void; // Optional callback (e.g., advance
> simulation phase)
>
> }

4.5 NotificationPreviewCard

Inline preview card shown during S3 when the organizer approves or
rejects an applicant. Slides in from the right, mimics a WhatsApp
notification appearance, and auto-dismisses after 4 seconds.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Position         Fixed, right: 24px, bottom: 120px (above progress
                   widget)

  Size             320px wide, auto height

  Background       #1A1A1A with subtle green-tinted left border for
                   approvals, red-tinted for rejections

  Header           Whispr icon + "This attendee just received this:" in
                   12px #999

  Content          Simulated message bubble showing the
                   approval/rejection notification text

  Animation        Slide in from right (0.3s ease-out). Auto-dismiss
                   after 4s or on click (0.2s fade-out).

  Z-index          998 (below tooltip overlay if both visible)
  ---------------- ------------------------------------------------------

4.6 S4ChoiceScreen

Full-width screen shown after S3 completes. Presents two paths. Not a
modal --- it replaces the main content area.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Layout           Centered content, max-width 600px, vertical stack

  Heading          "Ready to create your first event?" --- Monument
                   Extended, 24px, #FFF

  Subtext          "We can walk you through it, or you can explore on
                   your own." --- 14px, #999

  Option A button  Primary CTA: copper background, dark text, full-width,
                   "Yes, guide me through it"

  Option B button  Secondary CTA: transparent with #666 border, #CCC
                   text, full-width, "Not yet --- let me explore"

  Spacing          32px between heading and options, 16px between options
  ---------------- ------------------------------------------------------

4.7 TransitionScreen

Reusable component for breathing-room moments between S2 phases and
between stages. Centered text on dark background with a subtle
animation.

  ---------------- ------------------------------------------------------
  **Property**     **Value**

  Background       #0A0A0A, full content area (not full viewport ---
                   progress widget and banner remain)

  Primary text     Monument Extended, 20px, #FFF, centered

  Subtext          System font, 13px, #666, centered, appears 0.3s after
                   primary

  Duration         Configurable: 3--4 seconds for auto-advance, or until
                   CTA clicked

  CTA (optional)   Copper pill button if user-paced, hidden if timed

  Loading          Subtle pulsing copper dot or line if the screen is
  indicator        simulating a wait (e.g., "reviewing your application")
  ---------------- ------------------------------------------------------

5\. Stage-by-Stage Screen Specifications

5.1 S0: Account Setup

This is the existing signup flow. The only change is that on successful
account creation, the backend sets is_onboarding = true and
onboarding_current_stage = S0. After signup completes:

> ▸ Frontend calls PUT /api/onboarding/advance with { completed_stage:
> \'S0\', next_stage: \'S1\' }
>
> ▸ OnboardingProvider initializes and renders the progress widget
>
> ▸ User is routed to the org setup screen

+---+--------------------------------------------------------------------+
|   | **NO UI CHANGES TO SIGNUP**                                        |
|   |                                                                    |
|   | The signup form itself does not change. The onboarding shell       |
|   | (progress widget, etc.) only appears after the account is created  |
|   | and the user lands on the dashboard for the first time.            |
+---+--------------------------------------------------------------------+

5.2 S1: Organization Setup

This is the existing org setup form, enhanced with tour overlay
tooltips. The form writes real data to Airtable via the existing API.

**Tooltip Sequence (3 tooltips, group: s1_org_setup)**

  ----------- --------------- ------------------ ------------------------------
  **Index**   **Target**      **Title**          **Body**

  1 of 3      Org name input  Your brand         This appears on every event
                              identity           you create and in attendee
                                                 notifications.

  2 of 3      Logo upload     First impressions  Shows in the event feed and on
              area                               tickets. Square format, dark
                                                 backgrounds work best.

  3 of 3      Tagline input   One line. Make it  Tells attendees what your
                              count.             events are about. Think
                                                 editorial, not corporate.
  ----------- --------------- ------------------ ------------------------------

**Completion**

When the org setup form is submitted successfully, call PUT
/api/onboarding/advance with { completed_stage: \'S1\', next_stage:
\'S2\' }. The attendee tour begins.

5.3 S2: Attendee Tour

This is the longest and most complex stage. It consists of 4 phases,
each advancing the simulationState.attendeePhase. The context banner
renders in attendee mode throughout.

Phase A: Discovery

> ▸ Render the event feed (useEventList returns \[DEMO_EVENT_FIXTURE\])
>
> ▸ Tooltip: "This is what your attendees see. Every event on Whispr
> looks and feels like this." anchored to the event card
>
> ▸ User taps on the demo event → event detail screen renders
> (useEventDetails returns DEMO_EVENT_FIXTURE)
>
> ▸ Tooltip: "Tap Apply to start your application. Every attendee goes
> through this." anchored to the Apply button
>
> ▸ On Apply tap: set attendeePhase = \'application\'

Phase B: Application

> ▸ Application form renders with 2 screening questions from the fixture
>
> ▸ Tooltip: "The Whispr team reviews every application so you don't
> have to. This is our job, not yours."
>
> ▸ User fills in answers and submits
>
> ▸ On submit: call POST /api/onboarding/whatsapp/application-received
> (fire and forget)
>
> ▸ Show confirmation screen from fixture (applicationStatus =
> \'submitted\')
>
> ▸ Set attendeePhase = \'review\'

Phase C: Review and Approval

> ▸ TransitionScreen: "The Whispr team is reviewing your application..."
> with pulsing indicator
>
> ▸ Duration: 3--4 seconds (not user-dismissible --- this communicates
> screening is a real process)
>
> ▸ After timer: call POST /api/onboarding/whatsapp/application-approved
> (fire and forget)
>
> ▸ Render approval screen from fixture (applicationStatus =
> \'approved\')
>
> ▸ Tooltip: "This is what every approved attendee sees. The Whispr team
> curates the guest list for your events."
>
> ▸ CTA: "Continue to payment" button (user-paced, not auto-advance)
>
> ▸ On CTA click: set attendeePhase = \'payment\'

Phase D: Payment and Ticket

> ▸ Payment screen renders with "Simulate Payment" button replacing real
> gateway
>
> ▸ Amount displayed: PKR 3,000
>
> ▸ On click: 2-second loading animation, then success
>
> ▸ Call POST /api/onboarding/whatsapp/ticket-confirmed (fire and
> forget, no body required --- backend generates QR and sends via
> existing TicketService)
>
> ▸ Ticket screen renders from TICKET_FIXTURE: event name, date,
> attendee name, QR code
>
> ▸ QR code generated client-side using a library (e.g., qrcode.react)
> for on-screen display only --- backend handles its own QR for WhatsApp
> delivery
>
> ▸ Tooltip: "This QR code is their entry pass. They'll also get it on
> WhatsApp."
>
> ▸ Final screen: "Your night is confirmed" with full ticket details
>
> ▸ CTA: "See what it looks like from the other side" → triggers persona
> switch

**On S2 Completion**

Call PUT /api/onboarding/advance with { completed_stage: \'S2\',
next_stage: \'S3\' }. Render PersonaSwitchInterstitial (2.5 seconds).
Initialize S3.

5.4 S3: Organizer Tour

After the interstitial, the organizer dashboard renders with the context
banner in organizer mode. The event dashboard shows Whispr Demo Night
with a pre-populated applicant queue.

**Screen: Applicant Queue**

> ▸ useApplicantQueue returns sampled fixture applicants (8--12
> profiles)
>
> ▸ Tooltip: "These are your applicants. Review each one and decide who
> gets in." anchored to the queue
>
> ▸ Each applicant card shows: name, photo, screening answers (identical
> layout to production)
>
> ▸ Actions: Approve (green), Reject (red), Waitlist (amber) ---
> standard action buttons
>
> ▸ On any action: update simulationState.applicantActions, increment
> applicantsActioned
>
> ▸ On approve action: render NotificationPreviewCard showing what the
> attendee just received
>
> ▸ On reject action: render NotificationPreviewCard showing the
> rejection message

**Guided Interactions**

> ▸ Tooltip after first action: "Notice the notification? That's what
> your attendees receive instantly."
>
> ▸ After 3 actions: tooltip "You've got the hang of it. Try the filters
> or use bulk approve for efficiency."
>
> ▸ Demonstrate: quick filters (pending / approved / rejected) --- these
> filter the fixture data client-side
>
> ▸ Demonstrate: bulk approve --- select multiple, approve all

**Completion Trigger**

The organizer must action at least 3 applicants (any combination of
approve/reject/waitlist). Once 3 are actioned, a CTA appears:
"Continue". On click: call PUT /api/onboarding/advance with {
completed_stage: \'S3\', next_stage: \'S4\' }. Render S4ChoiceScreen.

5.5 S4: Event Setup

S4ChoiceScreen renders. Two paths:

Path A: Guided Setup

> ▸ Event creation form with real inputs (this writes real data)
>
> ▸ Pre-populated: event name = "\[Org Name\] Presents: " with cursor in
> the blank
>
> ▸ Tooltips on each field (see PRD v2 section 4, S4 for full tooltip
> content)
>
> ▸ On submit: call POST /api/onboarding/create-draft-event with form
> data and guided: true
>
> ▸ Success screen: "Your event is saved as a draft. When you're ready,
> hit Publish."
>
> ▸ Call PUT /api/onboarding/advance with { completed_stage: \'S4\',
> next_stage: \'S5\' }

Path B: Skip

> ▸ Call PUT /api/onboarding/skip with { skipped_stage: \'S4\',
> next_stage: \'S5\' }
>
> ▸ Call POST /api/onboarding/create-draft-event with guided: false
> (creates default draft)
>
> ▸ Both calls can fire in parallel

5.6 S5: Dashboard Orientation

No simulation. The organizer is on their real dashboard with real data
(their org, their draft event). Tooltips fire progressively as described
in the PRD --- each tooltip triggers on first visit to its section.

**Implementation**

Register 8 tooltip configs with the TooltipOverlay system. Each tooltip
has a condition function that checks: (a) the current route/section
matches, and (b) the tooltip ID is not in the dismissedTooltips set from
onboarding state. On tooltip dismiss: call PUT /api/onboarding/tooltip
with the tooltip_id. If the backend returns all_dismissed: true, call
PUT /api/onboarding/advance with { completed_stage: \'S5\', next_stage:
\'S6\' }.

**Alternative Completion**

S5 also completes if the organizer publishes their first event (a strong
signal they don't need more orientation). Listen for the event-publish
action and auto-advance to S6 if onboarding is active.

**Dismiss All**

The progress widget's expanded view has a "Dismiss all tooltips" link
during S5. On click: batch-dismiss all remaining tooltips (single API
call per tooltip or a batch endpoint if the backend supports it) and
advance to S6.

6\. Backend API Integration Reference

The backend is implemented and ready. The frontend calls the following
endpoints via OrganizerOnboardingController. Auth is handled by the
existing jwt.auth middleware using
\$request-\>attributes-\>get(\'jwt_user\'). All endpoints are under
/api/onboarding/.

6.1 State Management Calls

  ----------------------- --------------------------- -----------------------
  **Endpoint**            **When Called**             **Error Handling**

  GET                     App load (if                On failure: treat as
  /api/onboarding/state   authenticated). Cached for  is_onboarding = false.
                          session, refreshed on stage Do not block app load.
                          transitions.                

  PUT /advance            Every stage completion      On 422 (validation):
                          trigger. See per-stage      show error toast, do
                          specs above.                not advance. On 5xx:
                                                      retry once, then show
                                                      error.

  PUT /skip               Skip link in progress       Same as /advance.
                          widget or "Skip to          
                          dashboard" CTA.             

  PUT /navigate-back      Stage tap in expanded       On 422: disable back
                          progress widget.            navigation for that
                                                      target. On 5xx: retry
                                                      once.

  POST /reinvoke          Settings page "Replay       On failure: show error
                          onboarding" button.         toast. Do not change
                                                      local state.

  PUT /tooltip            Each tooltip dismiss in S5. On failure: mark as
                                                      dismissed locally
                                                      anyway. Retry silently
                                                      on next app load.
  ----------------------- --------------------------- -----------------------

6.2 WhatsApp Calls

  -------------------------------- ------------------------ ----------------------
  **Endpoint**                     **When Called**          **Error Handling**

  POST                             S2 Phase B: after        Fire and forget. On
  /whatsapp/application-received   application form         failure: no
                                   submission               user-facing error. Log
                                                            to console.

  POST                             S2 Phase C: after 3--4s  Same. Simulation
  /whatsapp/application-approved   review pause ends        continues regardless.

  POST /whatsapp/ticket-confirmed  S2 Phase D: after        Same. No request body
                                   payment simulation       needed --- backend
                                   completes                generates QR and
                                                            handles delivery
                                                            internally via
                                                            TicketService.
  -------------------------------- ------------------------ ----------------------

+---+--------------------------------------------------------------------+
|   | **NEVER BLOCK ON WHATSAPP**                                        |
|   |                                                                    |
|   | All three WhatsApp calls are fire-and-forget. The simulation must  |
|   | never wait for a response, show a loading state, or halt on        |
|   | failure. Call the endpoint, move on. The backend handles retries   |
|   | internally.                                                        |
+---+--------------------------------------------------------------------+

6.3 Draft Event Call

  --------------------- --------------------------- -----------------------
  **Endpoint**          **When Called**             **Error Handling**

  POST                  S4 completion (guided: true On failure: show error
  /create-draft-event   with form data) or S4 skip  toast with retry. This
                        (guided: false with null    is the only onboarding
                        fields)                     API call where failure
                                                    should be surfaced
                                                    prominently, because it
                                                    affects real data.
  --------------------- --------------------------- -----------------------

7\. Frontend Analytics Events

The backend fires analytics for state transitions and WhatsApp delivery.
The frontend is responsible for interaction-level analytics that the
backend cannot observe.

  ------------------------------------- ------------------------- --------------------------------------------------------
  **Event Name**                        **Trigger**               **Properties**

  onboarding_widget_expanded            Progress widget expanded  current_stage

  onboarding_widget_collapsed           Progress widget collapsed current_stage

  onboarding_skip_clicked               Skip link clicked (before stage_to_skip
                                        API call)                 

  onboarding_back_clicked               Back navigation clicked   from_stage, to_stage

  onboarding_persona_switch_viewed      Interstitial rendered     from_persona, to_persona

  onboarding_s2_phase_entered           Phase transition within   phase
                                        S2                        (discovery/application/review/approved/payment/ticket)

  onboarding_s2_application_submitted   Application form          time_on_form_seconds
                                        submitted in S2           

  onboarding_s2_payment_simulated       Simulate Payment clicked  time_since_approval_seconds

  onboarding_s3_applicant_actioned      Approve/reject/waitlist   action, applicant_archetype, action_count
                                        in S3                     

  onboarding_s3_filter_used             Quick filter used in S3   filter_type (pending/approved/rejected)

  onboarding_s3_bulk_action_used        Bulk approve used in S3   count_selected

  onboarding_s4_choice_made             Option A or B selected on choice (guided/skip), time_on_screen_seconds
                                        choice screen             

  onboarding_s5_tooltip_viewed          Dashboard tooltip         tooltip_id, section
                                        rendered                  

  onboarding_s5_dismiss_all_clicked     Dismiss all tooltips      tooltips_remaining
                                        clicked                   

  onboarding_reinvoke_clicked           Replay onboarding button  days_since_completion
                                        in settings               
  ------------------------------------- ------------------------- --------------------------------------------------------

8\. Frontend Edge Cases

  ------------------------ ----------------------------------------------
  **Scenario**             **Handling**

  Browser refresh mid-S2   SimulationState is local and will reset. This
                           is acceptable --- the fixture data reloads and
                           the user replays the current stage from the
                           beginning. Backend state (current_stage = S2)
                           is preserved, so they don't restart from S0.

  Browser refresh mid-S3   Same as S2. Applicant pool is re-sampled
                           (different random set). This is fine --- the
                           simulation is not meant to be deterministic
                           across refreshes.

  Backend /state returns   Pre-migration organizer records. Treat all
  null fields              null onboarding fields as: is_onboarding =
                           false. No onboarding UI rendered.

  /advance returns 422     State mismatch (e.g., two tabs). Show toast:
                           "Onboarding state updated --- refreshing."
                           Refetch /state and re-render.

  User directly navigates  OnboardingProvider checks isOnboarding on
  to a production URL      every route. If a production route is accessed
  during onboarding        during S2/S3, redirect back to the simulation
                           with a toast: "Let's finish the tour first, or
                           skip to your dashboard."

  QR code generation fails Use a fallback static image (a Whispr-branded
                           placeholder QR). Log error. The QR is visual
                           only during simulation --- it doesn't need to
                           scan.

  Very fast completion     WhatsApp messages may stack. This is
  (under 2 min)            acceptable --- the transition screens provide
                           minimum pacing. Do not add artificial delays
                           beyond the 3--4s review screen.

  User resizes browser     TooltipOverlay recalculates position on window
  during tooltip           resize. Use ResizeObserver on the target
                           element for layout shifts.
  ------------------------ ----------------------------------------------

9\. Recommended Implementation Order

This order is designed so that each piece can be tested independently
before the next one is built. The backend API is already complete and
deployed --- you can integrate against real endpoints from Week 1.

**Week 1--2: Foundation**

> ▸ OnboardingProvider context and useOnboarding hook
>
> ▸ OnboardingProvider initialization: call GET /state on load, handle
> null/missing fields
>
> ▸ ProgressWidget (collapsed + expanded) with hardcoded stages --- no
> real state transitions yet
>
> ▸ ContextBanner component with attendee/organizer variants
>
> ▸ TooltipOverlay component with anchoring, positioning, and dismiss
> logic
>
> ▸ TransitionScreen reusable component
>
> ▸ PersonaSwitchInterstitial component

Test: all shell components render correctly when isOnboarding = true is
hardcoded.

**Week 3--4: Fixture Data + S2**

> ▸ Create all fixture files with correct API response types
>
> ▸ Implement service-layer interception on all hooks listed in section
> 2.3
>
> ▸ Build S2 Phase A (discovery): event feed + event detail with fixture
> data
>
> ▸ Build S2 Phase B (application): form + submission + WhatsApp call
>
> ▸ Build S2 Phase C (review + approval): transition screen +
> auto-advance + WhatsApp call
>
> ▸ Build S2 Phase D (payment + ticket): simulate payment + QR
> generation + WhatsApp call
>
> ▸ Wire up PUT /advance call at S2 completion

Test: complete S2 end-to-end. Verify fixture data renders correctly in
existing components. Verify 3 WhatsApp calls fire.

**Week 5: S3 + S4**

> ▸ Build S3: applicant queue from sampled fixtures,
> approve/reject/waitlist actions, NotificationPreviewCard, filters,
> bulk approve
>
> ▸ Wire up completion trigger (3 actions) and advance call
>
> ▸ Build S4ChoiceScreen
>
> ▸ Build S4 guided event creation form with tooltips and
> /create-draft-event call
>
> ▸ Build S4 skip path with /create-draft-event (guided: false) call

Test: complete S3 end-to-end. Test both S4 paths. Verify draft event
creation.

**Week 6: S5 + Navigation + Re-Invocation**

> ▸ Build S5 progressive tooltip system with conditional triggers per
> section
>
> ▸ Implement backward navigation in progress widget
>
> ▸ Implement skip logic (including S2 auto-skips S3)
>
> ▸ Implement "Skip to dashboard" flow
>
> ▸ Build re-invocation entry point in Settings page
>
> ▸ Build "Welcome back" resume message for returning users

Test: full flow, skip-all flow, back navigation, re-invocation, browser
refresh at each stage.

**Week 7: Polish + Analytics + QA**

> ▸ Wire up all frontend analytics events
>
> ▸ Animation polish on all transitions and tooltips
>
> ▸ Error handling for all backend calls (toasts, retries, fallbacks)
>
> ▸ Cross-browser testing (Chrome, Firefox, Safari on desktop)
>
> ▸ Full end-to-end regression testing
>
> ▸ Code review and cleanup

10\. Open Questions (Frontend-Specific)

  ------------------------ ---------------------------- -----------------
  **Question**             **Context**                  **Needs Input
                                                        From**

  QR code library:         Need a lightweight           Engineering lead
  qrcode.react or          client-side QR generator for 
  alternative?             on-screen ticket display     
                           only (backend handles its    
                           own QR for WhatsApp).        
                           qrcode.react is \~12KB       
                           gzipped.                     

  Should SimulationState   Currently resets on refresh  Product
  persist to localStorage  (S2/S3 replay from phase     
  for refresh resilience?  start). Persisting would     
                           prevent replay but adds      
                           complexity.                  

  Tooltip positioning      Need robust auto-flip        Engineering lead
  library: Floating UI,    positioning. Floating UI is  
  Popper, or custom?       modern and small (\~3KB).    

  How should fixture files CI check that validates      Engineering lead
  be versioned alongside   fixture shapes against API   
  API types?               types? Or manual discipline? 

  Should the demo event    Static is simpler. CDN       Design +
  artwork be a static      allows updating without a    Engineering
  asset or fetched from a  deploy.                      
  CDN?                                                  

  What are the 20          Need AI-generated or stock   Design
  applicant profile        photos designed for the      
  photos?                  Karachi market. Design team  
                           deliverable.                 

  Should the persona       Could enhance the theatrical Design + Product
  switch interstitial have moment. Might be annoying on 
  sound/haptics?           repeat.                      

  How should we handle the Blocking production routes   Engineering lead
  route redirect during    during S2/S3 requires        
  simulation?              intercepting React Router.   
                           Could use a route guard HOC  
                           or a redirect in             
                           OnboardingProvider.          
  ------------------------ ---------------------------- -----------------

10.1 Questions for Backend Team

*The QR image delivery question from v1 is resolved: the backend's
TicketService generates the QR internally, uploads to S3, and sends via
sendMessage(). The frontend does not need to provide a QR image for
WhatsApp delivery. Only 2 WhatsApp templates require Meta approval
(application-received and application-approved); the ticket confirmation
uses the existing sendMessage() pattern.*

  ------------------------------------- ---------------------------------
  **Question**                          **Impact**

  Can /tooltip support batch dismiss    Needed for "Dismiss all" in S5.
  (multiple IDs in one call)?           Without batch, frontend fires 8
                                        sequential PUT calls.

  Will /advance to S6 auto-trigger      If yes, frontend doesn't need to
  /create-draft-event if no draft       call /create-draft-event
  exists?                               separately when skipping S4 and
                                        then skipping S5 quickly.
  ------------------------------------- ---------------------------------

--- End of Brief ---
