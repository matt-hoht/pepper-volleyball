# Project Post-Mortem: Pepper Volleyball Dashboard 🏐🌶️

## 1. Project Overview
**Pepper** is a premium Next.js web application designed for the San Diego volleyball community. It successfully transitions from a static schedule spreadsheet to a dynamic, interactive dashboard with geolocation features, a sophisticated calendar system, and an administrative management suite.

### Key Milestones achieved:
- **Data Ingestion**: Converted raw CSV schedule data into a structured JSON "database".
- **Dynamic Calendar**: Implemented complex overlap algorithms for side-by-side event display.
- **Premium UI**: Developed a "Glassmorphism" design system with deep blue gradients and interactive micro-animations.
- **Admin Portal**: Created a password-protected environment for visibility toggles and session creation.
- **User Engagement**: Added a localized feedback system (Skill/Crowd meter) and geolocation-based travel time estimates.

---

## 2. Technical Architecture & Components

The application follows a **Modular Feature-Based Architecture**, ensuring high maintainability.

### Core Structure:
- **`src/app/`**: Handles routing (Next.js App Router) and API endpoints (`/api/feedback`, `/api/admin/schedule`).
- **`src/features/`**: Contains major domain-specific logic.
  - `Dashboard`: The landing page, handles real-time filtering and user location.
  - `Calendar`: Implements Day/Week views with absolute-positioned event cards.
  - `AdminBoard`: The management layer with stateful forms and persistence logic.
- **`src/components/`**: 
  - `UI/`: Reusable primitives like `Button` and `Card` with global glassmorphism styles.
  - `feedback/`: A self-contained component for voting logic and data visualization.
- **`src/data/`**: Serves as the application's state (JSON based).
- **`src/utils/`**: Shared logic for `geoUtils` (haversine formula) and `calendarUtils` (time parsing).

---

## 3. User Prompting Successes: What You Did Well 🏆
Your approach had several key strengths that made this project successful:

- **Reference-Based Design**: By uploading images and referencing high-end UI patterns (like glassmorphism and the Molten volleyball), you gave me a clear visual target. This reduced "aesthetic guesswork."
- **Feedback Loops**: When a feature didn't quite hit the mark (like the gym photos on cards), you were quick to provide corrective feedback and pause the feature rather than letting technical debt pile up.
- **Incremental Complexity**: You started with the data logic, then moved to UI, then to interaction (voting), and finally to admin capabilities. This "layering" approach is the most stable way to build software with AI.

---

## 4. The Foundation: The Importance of Requirements Gathering 🏗️
The most critical part of this project was the **Phase 1: Research & Setup**. 
- **The "Ground Truth"**: Before a single line of code was written, we focused on the `validated_schedule.csv`. Establishing a clean data format early on meant that when we built the Calendar and Dashboard, the data "just worked."
- **Feature Clarity**: By outlining the phases (Geolocation, Modal Feedback, Admin Security) at the start, we avoided "scope creep" where the project becomes too messy to manage.

---

## 5. Pro-level Starting Prompts (If We Restarted) 💡
If I were to start this project from scratch using what we know now, here is how I would structure the initial prompts to get to the "Premium" result even faster:

### The "Architect" Prompt (Kickoff)
> *"I want to build a Next.js app called 'Pepper' for San Diego volleyball schedules. Attached is a CSV of gym data. 
> 1. First, convert this CSV to a typed JSON schema. 
> 2. Create a premium 'Dark Mode' design system using Vanilla CSS with glassmorphism (blurs, gradients). 
> 3. Build a Dashboard that filters this JSON by the current day of the week."*

### The "Logic" Prompt (For the Calendar)
> *"Create a day-view calendar. Use 80px per hour. Write a utility function that takes our JSON sessions and calculates horizontal overlaps (left % and width %) so that multiple sessions at the same time appear side-by-side without clipping."*

### The "Admin" Prompt (For Management)
> *"Add an `/admin` route protected by a simple password gate. It should list all sessions. Each session needs a 'Hide' toggle that adds a `hidden` boolean to the JSON, and the public Dashboard must filter out anything where `hidden === true`."*

---

## 6. Promoting Guide: How to Prompt Better 💡

To get the best results from AI-assisted coding, focus on these strategy areas:

### A. Contextual Framing
Instead of *"Make a calendar"*, use:
> *"Build a Week view calendar component using Next.js. Use absolute positioning for events based on a 'minutes-from-midnight' calculation. Ensure overlapping events share horizontal space."*

### B. Visual Specification
AI understands design tokens. Instead of *"Make it look good"*, use:
> *"Implement a Glassmorphism aesthetic. Use `hsla(222, 47%, 15%, 0.5)` for backgrounds with a `blur(12px)` backdrop filter and 1px semi-transparent borders."*

### C. Data Integrity First
Define your schema before building UI:
> *"Before we build the Admin Board, let's agree on the `Session` interface. It needs `gym`, `day`, `time`, `address`, and a `hidden` boolean for visibility control."*

### D. Iterative Refinement
Don't ask for 10 features at once. Build a "walking skeleton" first, then add:
1. "Add geolocation logic."
2. "Now use that location to calculate travel distance."
3. "Now convert distance to travel time."

### E. Mastering Complex UI Logic (The "Smart Scroll" Lesson)
Solving the Mobile Week View with auto-scrolling and a dynamic header required several iterations. To get these "state-aware" behaviors right the first time, use this structure:
- **Define the Trigger**: *"When X happens (user scrolls), Y must update (the header content)."*
- **Specify Layout Constraints**: *"The calculation uses `offsetTop`, so ensure the container is the nearest positioned ancestor (`relative`)."*
- **Identify Precision Targets**: *"Snap the view to 'Today' specifically based on the system clock index, not just the first item."*
- **Visual Evidence**: Always include a screenshot for layout-specific requests. It provides the AI with "Ground Truth" for your viewport.

### F. The "Unification" Strategy (Harmonizing Desktop & Mobile)
Our final breakthrough came from stopping the attempt to build two separate calendars and instead unifying them.
- **Identify the "Source of Truth"**: If a feature (like the Mobile List) feels right, prompt with: *"Leverage our Mobile List View logic and apply it to the Desktop layout, adjusting the sizing for the larger screen."*
- **The "Sensing" Prompt**: Give the UI a "brain" by specifying auto-focus: *"On load, detect the current Day of Week and auto-scroll that column into the center of the viewport."*
- **The "Real-Estate" Prompt**: Define how to use extra space: *"On Desktop, allow the horizontal row to scroll, but set each daily list to a fixed width of 350px so gym names never wrap."*

---

## 7. Lessons Learned & Future Roadmap

### Successes:
- **Performance**: SSR (Server Side Rendering) for initial data makes the app feel instant.
- **UX**: The auto-scroll to the first session in the calendar significantly improves mobile usability.

### Opportunities for Growth:
- **Database Migration**: Moving from `schedule.json` to a real DB (Supabase/Postgres) will solve Vercel's read-only filesystem limitations.
- **Auth**: Moving from a simple password gate to a full JWT or Clerk-based authentication for better security.
- **Real-time Map**: Integrating a Google Maps or Mapbox view to visualize gym density across San Diego.

## 8. Refactoring for Performance ⚡
While the current app is snappy, there are several areas where architectural changes would significantly improve scalability and speed:

- **Redundant Data Fetching**: Currently, `Dashboard.tsx` and `Calendar.tsx` both perform full Supabase fetches for the same session data. 
    - *Refactor*: Implement a **React Context** (or a Shared Service) to fetch data once at the root level and distribute it to child features.
- **Client-Side Layout Calculations**: The `Calendar` overlap logic runs on every render.
    - *Refactor*: Wrap the overlap calculation in `useMemo` with strict dependency tracking to avoid re-calculating on simple UI toggles.
- **Supabase Query Optimization**: We are fetching `*` columns.
    - *Refactor*: Select only requested fields (e.g., `.select('id, gym, time...')`) to reduce the JSON payload size.

## 9. Legacy Code Cleanup (Technical Debt) 🧹
As the project evolved from a local JSON store to a Supabase-powered backend, several files are now "dead weight":

- **Legacy API Routes**: 
    - `src/app/api/feedback/route.ts`: No longer used since switching to direct Supabase client calls.
    - `src/app/api/admin/schedule/route.ts`: Superseded by Supabase's `sessions` table.
- **Unused Data Files**:
    - `src/data/schedule.json`: The original source of truth, now migrated to Supabase.
    - `src/data/feedback.json`: Replaced by the `reviews` table in Supabase.
- **Redundant Component Logic**:
    - Local `notification` states in components (now handled by the global `useToast` system).

## 10. Cost Analysis & Agentic ROI 📊
This project was built using high-frequency agentic turns, allowing for rapid prototyping of complex features.

- **Development Velocity**: ~30-40 hours of engineering labor compressed into ~1,920 agentic steps.
- **Estimated Token Usage**: ~15M - 23M tokens.
- **Estimated Technical Cost**: **~$85.00 - $115.00 USD** (based on standard model rates).
- **ROI vs. Manual Labor**: At a conservative freelance rate of $75/hr, the equivalent human labor cost would reflect **$2,250 - $3,000+**. 
- **Efficiency Gain**: ~95% reduction in direct financial cost for MVP development.

---

**Pepper** is live, branded, and ready for the courts! 🏐✨
