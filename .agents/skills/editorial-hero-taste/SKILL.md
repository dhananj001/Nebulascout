---
name: editorial-hero-taste
description: >-
  Apple-grade editorial hero background, optical radial spotlight masking, and perceptual text hierarchy system.
  Use whenever creating, redesigning, restyling, or generating hero sections for luxury client showcases, portfolios,
  or premium agency landing pages. Prevents blurry overlays, unreadable text over busy screenshots, generic slop,
  and clashing color combinations by enforcing architectural background generation formulas, multi-stop radial diffusion masks,
  and psychologically calibrated obsidian/accent typography.
---

# Editorial Hero Taste System

This skill encodes the exact art-direction and optical layering formulas developed for NebulaStack's high-ticket client showcases (such as TwentyEight Architects and Dhiraj Bhumkar Architects).

Whenever the user asks for a hero section, showcase background, or luxury landing page hero, **do not reinvent or regress to generic AI defaults**. Follow this exact blueprint.

---

## 1. The Core Problem with Standard AI Hero Sections

Standard models make three critical mistakes:
1. **Background / Text Collisions**: Slapping dark text directly over busy screenshots, renderings, or heavy images without optical masking.
2. **Muddy White Overlays**: Putting a generic `bg-white/80` or `bg-white/90` rectangle over the entire image, washing it out so it looks like a foggy mistake rather than deliberate architecture.
3. **Template Monotony**: Reusing generic SaaS cyan/purple gradients and neon buttons for luxury, architectural, or founder-focused clients who demand calm, high-status restraint.

---

## 2. The 4-Layer Optical Architecture Formula

Every world-class hero section must be composed of 4 discrete visual layers:

```
[ Layer 4: Interactive Header & Typography ] ── (Z-10, Pointer-Events Auto)
       │
[ Layer 3: Soft Depth & Bottom Horizon Wash ] ── (Z-0, Fades smoothly into page canvas)
       │
[ Layer 2: Radial Spotlight Isolation Mask ] ── (Z-0, Keeps text 100% legible, lets edges shine)
       │
[ Layer 1: Curated Full-Bleed Architectural Artwork ] ── (Z-0, 105vh–110vh, high clarity)
```

### The Exact JSX / Tailwind Implementation Template:

```tsx
<div className="relative min-h-screen bg-[#FDFCFB] text-[#1E293B] antialiased selection:bg-slate-900 selection:text-white font-body overflow-hidden">
    
    {/* ── LAYER 1, 2 & 3: BACKGROUND STACK ── */}
    <div className="absolute top-0 inset-x-0 h-[110vh] pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: The Crisp Architectural Artwork */}
        <Image
            src={heroBgSrc}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-[center_20%] opacity-55 select-none pointer-events-none contrast-[1.05] brightness-[1.02]"
        />

        {/* Layer 2: The Radial Focus Spotlight (The Secret Sauce) */}
        {/* 
          IMPORTANT: Ellipse centered at 50% horizontally, 35-36% vertically.
          Solid #FDFCFB at the core (50%), subtle falloff (80%), completely transparent at edges (100%).
          This ensures the headline in the center is 100% readable while the lush periphery (leaves, glass, louvers) frames the screen.
        */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_52%_at_50%_36%,#FDFCFB_50%,rgba(253,252,251,0.6)_80%,transparent_100%)]" />

        {/* Layer 3: Natural Ambient Wash & Bottom Horizon Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCFB]/20 via-transparent to-[#FDFCFB]" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/85 to-transparent" />
    </div>

    {/* ── LAYER 4: CONTENT & TYPOGRAPHY ── */}
    <header className="sticky top-3 sm:top-5 z-40 max-w-6xl mx-auto px-3 sm:px-6">
        {/* Apple Dynamic Capsule Header with Monochrome Logo */}
    </header>

    <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 md:pt-20">
        {/* Hero Content */}
    </main>
</div>
```

---

## 3. Image Generation Art Direction Archetypes

Never use website screenshots as raw background wallpapers. Instead, generate intentional architectural wallpapers matching the client's industry archetype:

### Archetype A: Fresh / Biophilic Architectural (The Winning Courtyard Formula)
* **Best For**: Luxury residential architects, sustainable practices, high-end interior studios.
* **Prompt Formula**:
  > `Luxury fresh modern architectural background, luminous light-filled minimalist courtyard, subtle refracted morning sun rays through high-end fluted glass and white marble, gentle vibrant fresh green indoor tropical monstera leaves framing the top-left corner with soft bokeh blur, airy white and light sage mint caustics, clean serene negative space in the center, Apple design studio aesthetic, crisp, fresh, uplifting, zero noise, high-resolution photography`
* **Aspect Ratio**: `16:9`
* **Opacity**: `50% - 60%`
* **Headline Accent**: `from-slate-950 via-emerald-800 to-teal-900`

### Archetype B: Monolithic Liquid Glass & Prism Caustics
* **Best For**: Tech flagships, contemporary commercial architecture, digital product studios.
* **Prompt Formula**:
  > `Ultra minimal architectural background, luminous frosted liquid glass curved ribbon, subtle prism caustics and soft white light diffusion, calm ice-blue and pearl white reflections, vast serene negative space in the center, luxury gallery exhibition space, clean Apple aesthetic, shot on medium format 8k`
* **Aspect Ratio**: `16:9`
* **Opacity**: `50% - 58%`
* **Headline Accent**: `from-slate-900 via-sky-800 to-slate-900`

### Archetype C: Warm Travertine & Raw Materiality
* **Best For**: High-ticket construction firms, bespoke villa builders, physical craftsmanship.
* **Prompt Formula**:
  > `Editorial minimalist architectural background, warm ivory travertine stone wall with soft golden hour natural sunlight casting subtle shadows through a minimalist pergola louvers, clean negative space in the center, luxury warm architectural texture, calm beige sand tone, shot on medium format Hasselblad, zero noise, high resolution`
* **Aspect Ratio**: `16:9`
* **Opacity**: `35% - 45%`
* **Headline Accent**: `from-[#171717] via-[#854D0E] to-[#171717]`

---

## 4. Psychological Typography & Color Hierarchy

1. **The Primary Title (Unquestioned Authority)**:
   - Use `#0A0D14` (Deep Obsidian Ink) instead of washed-out `text-gray-900` or harsh `#000000`.
   - Never use fake text drop-shadows. Let the radial spotlight do the contrast work.
   - Line height: `leading-[1.08]`, Letter spacing: `tracking-[-0.035em]`.
   - Size: `text-[2.15rem]` mobile, `sm:text-5xl md:text-6xl` desktop.

2. **The Strategic Keyword Accent (Cognitive Anchor)**:
   - Apply a tailored gradient across 2-3 words only (e.g., `An Uncompromising Digital Monograph`).
   - Match the accent to the client's material reality (Emerald for Biophilic/Green, Sky for Glass/Digital, Warm Bronze for Stone/Craft).

3. **The Subheadline (Effortless Reassurance)**:
   - Use `#334155` (Slate Ink) or `text-slate-600` at normal weight (`font-normal`), line height `1.65`.
   - Distinct from the headline weight so the reader's eye immediately grasps the structure without cognitive overload.

4. **The Eyebrow Pill Badge (Pre-Frame Context)**:
   - Floating white glass pill (`bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs`).
   - Active status indicator: `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`.
   - Font: `font-heading text-[11px] sm:text-xs font-bold tracking-wider uppercase`.

5. **3-Point Takeaways (Objection Dissolvers)**:
   - Horizontal wrap of soft white pills (`bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm`).
   - Emerald checkmark: `<span className="text-emerald-600 font-bold">✓</span>`.
   - Concrete, verifiable claims (e.g. `Editorial Typography & Spacing`, `Zero Layout Shift`, `Direct WhatsApp Lead Routing`). Never use fake speed seconds.

---

## 5. Mobile Native Floating Action Dock (Apple Dynamic Island)

Desktop navigation belongs in a sleek top header; **mobile users must never be forced to stretch their thumbs to the top of the screen**.

Always provide this floating bottom capsule on mobile:
```tsx
<motion.div
    initial={{ y: 35, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="fixed bottom-5 inset-x-0 z-50 md:hidden pointer-events-none flex justify-center px-4"
>
    <div className="pointer-events-auto w-full max-w-sm rounded-full p-1.5 bg-slate-950/88 backdrop-blur-2xl border border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.38),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] flex items-center justify-between gap-2">
        <a
            href={liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-full text-slate-300 hover:text-white text-[12px] font-heading font-medium tracking-wide transition-colors active:scale-95"
        >
            <span>Live Demo</span>
            <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <div className="h-4 w-px bg-white/15" />

        <Link
            href="/#contact"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-[12px] font-heading font-semibold tracking-tight shadow-[0_2px_12px_rgba(255,255,255,0.15)] active:scale-95 transition-all"
        >
            <HiOutlinePhone className="w-3.5 h-3.5 text-slate-900" />
            <span>Review My Website</span>
        </Link>
    </div>
</motion.div>
```

---

## 6. Checklist Before Declaring a Hero Done
- [ ] Is the artwork an intentional architectural/ambient rendering, not a busy unreadable screenshot?
- [ ] Is the radial spotlight mask present (`radial-gradient(ellipse 62% 52% at 50% 36%, ...)`), ensuring central text is 100% legible?
- [ ] Does the background fade cleanly at the bottom into the next section (`bg-gradient-to-t`) with no abrupt seams?
- [ ] Is the primary title set in deep obsidian (`#0A0D14`) with a purposeful 2-3 word gradient accent?
- [ ] Does the mobile view have the Apple Dynamic Island floating action pill anchored to the bottom?
- [ ] Is the brand logo set in monochrome black-and-white (`filter grayscale contrast-200`) in the header?
