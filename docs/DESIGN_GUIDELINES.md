# DBscope Design Guidelines

A comprehensive guide to the design system used in DBscope, ensuring consistency and visual excellence across the application.

---

## Color Palette

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `blue-600` | `#2563eb` | Primary buttons, links, accents |
| `violet-600` | `#7c3aed` | Gradient accents, secondary highlights |

### Neutral Colors
| Token | Value | Usage |
|-------|-------|-------|
| `slate-900` | `#0f172a` | Headings, important text |
| `slate-700` | `#334155` | Body text, secondary buttons |
| `slate-600` | `#475569` | Muted text, descriptions |
| `slate-400` | `#94a3b8` | Placeholder text, disabled states |
| `slate-50` | `#f8fafc` | Background tints |

### Semantic Colors
| Purpose | Color | Usage |
|---------|-------|-------|
| Success | `emerald-400` | Terminal code, success states |
| Warning | `amber-500` to `orange-500` | "Coming Soon" badges |
| Error | `red-500` | Error states, destructive actions |

---

## Typography

### Font Families
```css
--font-family-sans: Inter, ui-sans-serif, system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Font Sizes
| Class | Size | Usage |
|-------|------|-------|
| `text-7xl` | 4.5rem | Hero heading (desktop) |
| `text-5xl` | 3rem | Hero heading (mobile) |
| `text-3xl` | 1.875rem | Section headings |
| `text-2xl` | 1.5rem | Sub-section headings |
| `text-lg/xl` | 1.125-1.25rem | Lead paragraphs |
| `text-sm` | 0.875rem | Body text, buttons |
| `text-xs` | 0.75rem | Badges, captions |

### Font Weights
- **Extrabold (800)**: Hero headings
- **Bold (700)**: Section titles
- **Semibold (600)**: Buttons, card titles
- **Medium (500)**: Navigation, tags
- **Regular (400)**: Body text

---

## Shadows & Borders

### Shadow System
Use soft shadows instead of hard borders. Shadows should be tinted with brand colors on hover.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | Subtle elevation | Header, small elements |
| `shadow-lg` | Medium elevation | Cards, buttons |
| `shadow-xl` | High elevation | Hover states |
| `shadow-2xl` | Maximum elevation | Active/focused states |

### Shadow Colors
```css
/* Default shadows */
shadow-slate-200/50

/* Accent shadows (hover) */
shadow-blue-500/20
shadow-blue-600/25
shadow-blue-600/30
```

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-full` | 9999px | Badges, avatars |
| `rounded-2xl` | 1rem | Cards, modals |
| `rounded-xl` | 0.75rem | Buttons, inputs |
| `rounded-lg` | 0.5rem | Small elements |

---

## Component Patterns

### Buttons

**Primary Button**
```jsx
<button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02]">
  <Icon /> Button Text
</button>
```

**Secondary Button**
```jsx
<button className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-slate-700 shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl hover:scale-[1.02]">
  <Icon /> Button Text
</button>
```

### Cards
```jsx
<div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
  {/* Card content */}
</div>
```

### Badges
```jsx
{/* Status Badge */}
<span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
  Soon
</span>

{/* Info Badge */}
<div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-1.5 text-sm text-blue-700 shadow-sm">
  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 animate-pulse" />
  Badge Text
</div>
```

---

## Glassmorphism

Apply glass effect to fixed/floating elements:

```jsx
<header className="bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-200/50">
  {/* Content */}
</header>
```

---

## Hover Effects

### Standard Hover
```css
transition-all duration-300
hover:shadow-xl
hover:-translate-y-1
```

### Button Hover
```css
transition-all
hover:shadow-2xl
hover:scale-[1.02]
```

### Icon Hover
```css
transition-transform
group-hover:scale-110
```

---

## Gradient Patterns

### Text Gradient
```jsx
<span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
  Gradient Text
</span>
```

### Border Gradient
```jsx
<div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 p-[1px]">
  <div className="rounded-2xl bg-slate-900 p-5">
    {/* Content */}
  </div>
</div>
```

---

## Icon Guidelines

### Icon Library
Use [Lucide React](https://lucide.dev) for all icons.

### Icon Sizing
| Context | Size | Class |
|---------|------|-------|
| Navigation | 20px | `h-5 w-5` |
| Buttons | 16-20px | `h-4 w-4` to `h-5 w-5` |
| Feature icons | 24px | `h-6 w-6` |
| Large decorative | 32px+ | `h-8 w-8` |

### Brand/Tech Icons
Use CDN icons from [Devicons](https://devicon.dev):
```
https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{tech}/{tech}-original.svg
```

---

## Responsive Design

### Breakpoints
| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (none) | 0px | Mobile-first base |
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops |
| `xl` | 1280px | Large desktops |

### Common Patterns
```jsx
{/* Responsive grid */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

{/* Responsive text */}
<h1 className="text-5xl md:text-6xl lg:text-7xl">

{/* Responsive flex */}
<div className="flex flex-col sm:flex-row">
```

---

## Animation

### Transition Durations
- **Fast (150ms)**: Hover states, color changes
- **Normal (300ms)**: Card animations, transforms
- **Slow (500ms+)**: Page transitions, complex animations

### Custom Animations
```css
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient {
  animation: gradient 3s ease infinite;
}
```

---

## Accessibility

- Maintain minimum contrast ratio of 4.5:1 for text
- Use focus-visible styles for keyboard navigation
- Include alt text for all images
- Use semantic HTML elements
- Support reduced-motion preferences

---

*Last updated: January 2026*
