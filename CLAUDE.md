# CLAUDE.md - System Instructions & Guidelines

## 🚀 Project Overview
**Project:** Prompt Hub / Developer Dashboard
**Objective:** A high-density information management dashboard for developers and prompt engineers to manage, test, and organize AI prompts.

## 💻 Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI/Library**: React 19
- **Styling**: Tailwind CSS v4, Radix UI Primitives
- **Authentication**: NextAuth.js (Auth.js)
- **Database / ORM**: Prisma 
- **Validation & Forms**: Zod, React Hook Form
- **Icons**: Lucide React

## 🚀 Commands
- **Development**: `npm run dev`
- **Database Push**: `npx prisma db push`
- **Prisma Studio**: `npx prisma studio`
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`

## 🎨 Product & Design Principles

**Brand Personality**: Dark Premium Developer Tool. High-contrast, confident, and modern — inspired by cutting-edge SaaS dashboards with purposeful use of depth, glow, and color.

### Theme & Color Palette
- **Base Background**: Deep near-black (`#10071C` or `bg-zinc-950`) — rich dark, not pure black.
- **Primary Accent**: Orange `#F97316` / `#FF6B00` — used for active states, CTAs, and brand icons.
- **Secondary Accent**: Purple `#7c3aed` — used as a gradient counterpoint to orange in borders and highlights.
- **Text**: `text-white` for primary content, `text-white/40`–`text-gray-400` for secondary/muted.

### Visual Depth & Elevation
- **Tonal Layering**: Separate areas via background shades (e.g., `#10071C` card on a darker page background).
- **Gradient Borders**: Use `linear-gradient` border-box technique (orange → purple) on hero cards and featured containers to create premium depth. Example:
  ```css
  background: linear-gradient(#10071C, #10071C) padding-box,
              linear-gradient(135deg, #F97316 0%, #7c3aed 100%) border-box;
  border: 1px solid transparent;
  ```
- **Glow Shadows**: Allowed and encouraged on icons, stat cards, and active elements. Use `rgba` with low-to-mid opacity (0.2–0.4). Example: `shadow-[0_0_15px_rgba(249,115,22,0.4)]`.
- **Hover Effects**: Cards and interactive elements may use `hover:-translate-y-1` or `hover:scale-[1.02]` with an elevated shadow to reinforce interactivity. Keep transitions smooth (`duration-300`–`duration-500`).
- **Shine / Radial Overlay**: Subtle radial gradient overlays on hover (`opacity-0 → opacity-100`) are acceptable for stat cards to add a premium feel.

### Typography
- **Headlines / Display**: `font-manrope` (Modern, refined)
- **Body / Functional UI**: `font-inter` (Legible, neutral)
- **Code / Variables**: `font-mono` (Strict alignment for syntax)
- *(Note: Avoid decorative Thai fonts for core UI; fallback to standard system sans-serif for Thai text readability).*

### Visual Shapes & Border Radius
- **Inputs & Buttons**: `rounded-sm` (4px) - Engineered and precise.
- **Containers & Cards**: `rounded-xl` to `rounded-[28px]` — larger radius fits the premium dark aesthetic.
- **Badges / Status Pills**: `rounded-full` (Fully rounded).

### Sidebar Active State
- Active nav items use a left-to-right gradient: `bg-gradient-to-l from-[#FF6B00] to-[#FF6B00]/20` with `shadow-lg shadow-orange-500/50`.
- Inactive items: `text-gray-400 hover:text-white hover:bg-white/5`.
- Brand icon uses an orange glow: `shadow-[0_0_15px_rgba(249,115,22,0.4)]`.

## 🏗 Architecture & Code Style

### Next.js & React
- **App Router First**: Utilize Next.js App Router conventions (`layout.tsx`, `page.tsx`).
- **Server Components**: Default to Server Components for data fetching. Use `"use client"` only at the leaf nodes where interactivity (hooks, state) is strictly required.
- **Authentication**: Protect routes using NextAuth session validation at the server level before rendering pages or returning API responses.

### TypeScript & Prisma
- **Strict Typing**: Define precise interfaces for all component props. Do not use `any`.
- **Database Calls**: Abstract Prisma queries logically. Avoid passing raw database objects directly to client components if they contain sensitive data; map them to safe interfaces.

### UI Components & Tailwind v4
- **Modularity**: Build small, reusable components (e.g., `StatCard`, `ActionBadge`).
- **Tailwind Utility**: Rely strictly on Tailwind utility classes. Avoid writing custom CSS in global stylesheets unless absolutely necessary for complex animations.
- **Consistency**: Adhere to the defined Design Principles (spacing, radius, typography) using Tailwind's default spacing scale.

## 📱 Responsive Design

### Mobile-First Approach
- **Tailwind Breakpoints**: Design mobile-first (base classes without prefixes) and scale up using standard Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
- **Layout Shifts**:
  - **Desktop (`lg` and up)**: Display the full left sidebar and render cards in a 3-4 column grid.
  - **Tablet (`md`)**: Collapse the sidebar into an icon-only view or hide it, and display cards in a 2-column grid.
  - **Mobile (`sm` and down)**: Hide the sidebar inside a hamburger menu (Drawer/Off-canvas) and switch to a 1-column grid for comfortable vertical scrolling.

### Scaling & Spacing
- **Fluid Layouts**: Avoid strictly fixed dimensions (e.g., hardcoded `w-[500px]` or `h-X` for main containers). Utilize `w-full`, `max-w-7xl`, or flexbox/grid properties to allow the UI to flow naturally across screen sizes.
- **Touch Targets**: On mobile devices, ensure that all interactive elements (buttons, links, dropdowns) have a minimum clickable area of `44x44px` for accessibility and accurate tapping.

---

## ⚡ Performance & Optimization

### Handling Large Datasets
- **Pagination & Infinite Scroll**: NEVER fetch all records from the database at once.
  - Implement **Cursor-based Pagination** (more performant than Offset-based in Prisma) for features utilizing Infinite Scroll (e.g., scrolling down the Prompt Library).
  - Use **Offset-based Pagination** (Page 1, 2, 3...) for strict data tables where users need to jump to specific pages.
- **Virtualization (Windowing)**: If rendering extremely long lists or complex dropdowns (100+ items), use a library like `@tanstack/react-virtual` to render only the DOM elements currently visible on the screen, drastically reducing browser memory usage.

### Caching & Data Fetching
- **Next.js Data Cache**: Leverage Next.js App Router's native Route Cache and Data Cache. Configure `revalidate` intervals appropriately for data that does not require real-time accuracy.
- **SWR / React Query**: For client-side data fetching that requires frequent updates, use SWR or TanStack Query to handle caching, request deduping, and background refetching.
- **Optimistic UI Updates**: When a user performs an action (e.g., starring a favorite prompt, deleting an item), update the UI instantly before the database confirms the mutation. This ensures millisecond-level perceived performance.

### Code & Execution Optimization
- **Debouncing & Throttling**: Search inputs and complex filters MUST implement debouncing (e.g., wait 300ms after the last keystroke) before triggering database queries to prevent server overload.
- **Server Actions for Mutations**: Utilize Next.js Server Actions for database mutations to reduce client-server network overhead compared to traditional API routes.
- **Long-running Tasks**: 
  - For operations with high latency, such as testing prompts against external AI Model APIs, implement clear **Loading States** (Skeleton loaders or Spinners).
  - Do not block the UI thread. Handle these requests asynchronously so the user can navigate to other parts of the dashboard while waiting.
- **Prisma Query Optimization**: 
  - Always use the `select` property to fetch ONLY the required columns (Avoid fetching the entire row if not needed).
  - Ensure **Database Indexes** (`@@index`) are properly set up in the Prisma schema for fields that are frequently filtered, sorted, or searched (e.g., `categoryId`, `status`, `tags`).