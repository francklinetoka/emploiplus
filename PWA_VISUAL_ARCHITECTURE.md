# 🎨 PWA Emploi+ - Visual Architecture & Component Hierarchy

## 📐 Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                              │
│  └─ <meta> tags (PWA, manifest, icons, safe-area)             │
│  └─ <link rel="manifest">                                      │
│  └─ <script> Service Worker registration                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                        src/main.tsx                             │
│  └─ import "@/styles/pwa-animations.css"                      │
│  └─ registerServiceWorker()                                    │
│  └─ <App />                                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PWALayout Component                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           HeaderMobile (md:hidden)                       │  │
│  │  [Logo] [🔍 Search] [🔔 Notification] [☰ Menu]          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                  Main Content Area                       │  │
│  │                 (Page Specific)                          │  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │  PWACard   │  │  PWACard   │  │  PWACard   │        │  │
│  │  │ (rounded   │  │   (hover   │  │  (touch    │        │  │
│  │  │   20px)    │  │   effects) │  │  44x44px)  │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────┐         │  │
│  │  │        PWAModal / PWABottomSheet           │         │  │
│  │  │     (slide-up animation 0.4s)             │         │  │
│  │  └────────────────────────────────────────────┘         │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      BottomNavigationBar (md:hidden)                     │  │
│  │                                                           │  │
│  │  [👥]  [💼]          [🏠]         [💬]  [👤]            │  │
│  │  Connexions Emplois  Fil*FAB  Messages Profil           │  │
│  │                                                           │  │
│  │  *FAB = Floating Action Button                          │  │
│  │   - Centered, -translate-x-1/2                          │  │
│  │   - Gradient: blue-500 to blue-600                      │  │
│  │   - w-14 h-14 (56px)                                    │  │
│  │   - Shadow-lg with blue glow                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Drawer (Right Slide-In Animation)               │  │
│  │     [X] User Profile                                    │  │
│  │     ├─ [Avatar] Name                                    │  │
│  │     ├─ Status: "Online" / "Offline"                    │  │
│  │     ├─ ────────────────────────                        │  │
│  │     ├─ [📚] Formations                                  │  │
│  │     ├─ [💼] Services                                    │  │
│  │     ├─ [📖] Ressources                                  │  │
│  │     ├─ [⚙️] Paramètres                                  │  │
│  │     └─ [🚪] Déconnexion (red)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│   HeaderMobile  │ ← md:hidden
├─────────────────┤
│  Main Content   │ 100% width
│                 │ Full height
├─────────────────┤
│ BottomNavBar    │ ← md:hidden
│  5 icons + FAB  │
└─────────────────┘
```

### Desktop (≥ 768px)
```
┌─────────────────────────────────────────┐
│   Traditional Header (Desktop)           │
├────────────────┬────────────────────────┤
│   Sidebar Nav  │   Main Content         │
│  (Optional)    │   (Full Width)         │
│                │                        │
├────────────────┴────────────────────────┤
│   Footer (Optional)                     │
└─────────────────────────────────────────┘
```

## 🎯 Component Hierarchy

```
PWALayout
│
├─ HeaderMobile
│  ├─ Logo (gradient bg)
│  ├─ SearchInput (expandable)
│  ├─ NotificationBell (badge)
│  └─ MenuButton (→ opens Drawer)
│
├─ Main Content Area
│  └─ Page Component
│     ├─ PWACard (multiple)
│     │  ├─ Content
│     │  └─ Actions (touch-target)
│     │
│     └─ PWAModal / PWABottomSheet (on demand)
│        ├─ Header (sticky)
│        ├─ Content (scrollable)
│        └─ Footer (buttons)
│
├─ BottomNavigationBar
│  ├─ NavItem 1 (icon + label)
│  ├─ NavItem 2
│  ├─ FAB Button (centered, floating)
│  ├─ NavItem 3
│  ├─ NavItem 4
│  └─ NavItem 5
│
└─ Drawer (when menuOpen)
   ├─ UserProfile
   ├─ MenuItems
   └─ LogoutButton
```

## 🎨 Design Tokens

### Colors
```
Primary:     #2563eb (blue-600)
Secondary:   #3b82f6 (blue-500)
Success:     #10b981 (emerald-500)
Warning:     #f59e0b (amber-500)
Error:       #ef4444 (red-500)
Neutral:     #6b7280 (gray-500)

Backgrounds:
- White:     #ffffff
- Gray:      #f9fafb (gray-50)
- Dark:      #1f2937 (gray-900)
```

### Typography
```
Heading 1:   20px, bold (font-bold)
Heading 2:   18px, bold
Heading 3:   16px, semibold
Body:        14px, regular
Caption:     12px, regular
```

### Spacing
```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
```

### Border Radius
```
Cards:       20px (rounded-[20px])
Buttons:     8px  (rounded-lg)
Inputs:      8px  (rounded-lg)
Circles:     50%  (rounded-full)
```

### Shadows
```
Small:   shadow-sm
Medium:  shadow-md
Large:   shadow-lg
Extra:   shadow-xl
```

### Touch Targets
```
Minimum:  44x44px
Padding:  12-16px
Icons:    18-24px
```

## 🎭 Animation Specifications

| Name | Duration | Easing | Use Case |
|------|----------|--------|----------|
| slide-up | 0.4s | ease-out | Modals, bottom sheets |
| slide-down | 0.3s | ease-out | Dismissing, hiding |
| fade-in | 0.3s | ease-in-out | Content load |
| scale-in | 0.3s | ease-out | Item appear |
| bounce-in | 0.6s | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Attention |
| pulse-ring | 2s | ease-in-out | Notifications |
| swing | 0.5s | ease-in-out | Emphasis |

### Animation Classes
```css
.animate-slide-up      /* translateY(100%) → 0 */
.animate-slide-down    /* translateY(-100%) → 0 */
.animate-fade-in       /* opacity: 0 → 1 */
.animate-scale-in      /* scale(0.8) → 1 */
.animate-bounce-in     /* scale + fade combo */
.animate-pulse-ring    /* scale + opacity combo */
.animate-swing         /* rotate based */
```

## 🔌 Glassmorphism Design

```
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

Used in:
- BottomNavigationBar (main)
- HeaderMobile (optional)
- Modals backdrop (semi-transparent)
- PWACard hover states (optional)
```

## 🛡️ Safe Area Support

```
Safe area = Device notch + home indicator area

/* CSS Variables */
env(safe-area-inset-top)     /* Notch height */
env(safe-area-inset-bottom)  /* Home indicator height */
env(safe-area-inset-left)    /* Side bezels */
env(safe-area-inset-right)   /* Side bezels */

Used in:
- HeaderMobile (padding-top)
- BottomNavigationBar (padding-bottom)
- PWAModal (padding adjustments)
- Sticky elements
```

## 🗂️ File Organization

```
src/
├─ components/
│  └─ layout/
│     ├─ BottomNavigationBar.tsx    (main nav)
│     ├─ Drawer.tsx                 (side menu)
│     ├─ HeaderMobile.tsx           (top bar)
│     ├─ PWACard.tsx                (card component)
│     ├─ PWAModal.tsx               (modal + bottom sheet)
│     ├─ PWALayout.tsx              (main wrapper)
│     └─ index.ts                   (barrel export)
│
├─ hooks/
│  └─ usePWA.ts                     (PWA utilities)
│
├─ styles/
│  └─ pwa-animations.css            (custom animations)
│
├─ utils/
│  └─ serviceWorkerRegistration.ts  (SW registration)
│
└─ pages/
   ├─ Newsfeed.tsx                  (wrapped with PWALayout)
   ├─ Jobs.tsx
   ├─ Formations.tsx
   └─ NewsfeedExample.tsx           (reference implementation)

public/
├─ manifest.json                    (PWA configuration)
├─ sw.js                            (Service Worker)
├─ offline.html                     (offline fallback)
└─ icons/
   ├─ icon-192x192.png
   ├─ icon-512x512.png
   ├─ maskable-192x192.png
   └─ maskable-512x512.png

root/
├─ index.html                       (with meta tags)
├─ PWA_TRANSFORMATION_GUIDE.md
├─ PWA_INTEGRATION_QUICK_GUIDE.md
├─ PWA_DEPLOYMENT_CHECKLIST.md
└─ PWA_ARCHITECTURE.md              (this file)
```

## 🔄 Data Flow

```
User Interaction
        ↓
Component Event Handler
        ↓
State Update (useState)
        ↓
Re-render
        ↓
Animation (CSS / Tailwind)
        ↓
Visual Feedback

Example:
Click Button → handleLike() → setPosts() → Re-render →
animate-scale-95 + transition-transform
```

## 🎯 Navigation Flow

### Authenticated User (Candidate)
```
Home (FAB/Fil)
├─ Connexions (1st icon)
├─ Emplois (2nd icon)  
├─ Fil d'actualité (FAB - main)
├─ Messages (4th icon) → Full-screen
└─ Profil (5th icon) → Menu
   ├─ Formations
   ├─ Services
   ├─ Ressources
   ├─ Paramètres
   └─ Déconnexion
```

### Authenticated User (Company)
```
Home (FAB/Fil)
├─ Connexions (1st icon)
├─ Candidats (2nd icon)
├─ Fil d'actualité (FAB - main)
├─ Messages (4th icon) → Full-screen
└─ Recrutement (5th icon) → Menu
   ├─ Dashboard
   ├─ Services
   ├─ Ressources
   ├─ Paramètres
   └─ Déconnexion
```

### Non-Authenticated
```
Home
├─ Accueil (1st icon)
├─ Emplois (2nd icon)
└─ Connexion (3rd icon)
```

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP (First Contentful Paint) | < 3s | TBD |
| LCP (Largest Contentful Paint) | < 4s | TBD |
| CLS (Cumulative Layout Shift) | < 0.1 | TBD |
| TTI (Time to Interactive) | < 5s | TBD |
| Lighthouse PWA Score | 90+ | TBD |
| Mobile Accessibility | 95+ | TBD |

## ✅ Browser Support

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Full | Service Workers, all APIs |
| Firefox | 88+ | ✅ Full | Service Workers, all APIs |
| Safari | 14+ | ✅ Partial | Limited PWA, no push |
| Edge | 90+ | ✅ Full | Chromium-based |
| Opera | 76+ | ✅ Full | Chromium-based |

---

**Last Updated**: 2024-12-XX  
**Version**: 1.0  
**Status**: Complete Architecture Documentation
