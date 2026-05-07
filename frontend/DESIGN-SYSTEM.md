# Agriqon Frontend Design System

**Date Created:** May 7, 2026  
**Reference:** PigMart + Freshco Marketplace Design  
**Status:** Component Planning Phase

---

## 📋 Table of Contents

1. [Color Palette](#color-palette)
2. [Component Architecture](#component-architecture)
3. [Reusable Components](#reusable-components)
4. [Page Layouts](#page-layouts)
5. [Design Details](#design-details)
6. [Build Priority](#build-priority)
7. [Responsive Design](#responsive-design)

---

## 🎨 Color Palette

### Primary Colors
```
Primary Green:      #0d6e3e or #1b4d2e (Dark Green - Main brand color)
Accent Orange:      #ff9500 (Orange - Highlights, CTAs)
Accent Yellow:      #ffd700 (Yellow - Promotions)
```

### Neutral Colors
```
Background:         #f5f5f5 (Light Gray)
White:              #ffffff (Cards, Sections)
Text Primary:       #333333 (Dark Gray - Main text)
Text Secondary:     #666666 (Light Gray - Descriptions)
Border:             #e0e0e0 (Light Border)
```

### Status Colors
```
Success:            #22c55e (Green - In Stock)
Warning:            #ff9500 (Orange - Limited Stock)
Error:              #ef4444 (Red - Out of Stock)
```

---

## 🏗️ Component Architecture

### Layer Structure

| Layer | Component | Count | Type | Responsive |
|-------|-----------|-------|------|-----------|
| Header | Navbar | 1 | Navigation | Sticky |
| Hero | Banner Section | 1 | Hero | Full Width |
| Browse | Category Carousel | 1 | Carousel | Scroll |
| Promo | Colored Cards | 1 Set | Grid | 3→2→1 |
| Main | Product Grid | Multiple | Grid | 4→2→1 |
| Social | Reviews Carousel | 1 | Carousel | Scroll |
| Footer | Footer | 1 | Navigation | Stacked |

---

## 🧩 Reusable Components

### 1. **Navbar**
**Path:** `components/ui/navbar.tsx` (Already exists - enhance)

**Features:**
- Logo + Brand name
- Search bar (with category filter dropdown)
- Cart icon (with item count badge)
- User menu (profile dropdown)
- Mobile hamburger menu (collapsible)
- Sticky positioning

**Props:**
```typescript
interface NavbarProps {
  cartCount?: number;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}
```

---

### 2. **Hero Section**
**Path:** `components/home/HeroSection.tsx`

**Layout:**
```
Left (60%):                     Right (40%):
├── Overline/Badge             └── Hero Image
├── Main Heading               (Farmer/Chef image)
├── Description
└── 2 CTA Buttons
    ├── Primary (Shop Now)
    └── Secondary (Explore Offers)
```

**Features:**
- Gradient background (dark green)
- Responsive text sizing
- Image with decorative elements
- Two action buttons

**Props:**
```typescript
interface HeroSectionProps {
  heading?: string;
  description?: string;
  image?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}
```

---

### 3. **Category Card**
**Path:** `components/shared/CategoryCard.tsx`

**Structure:**
```
┌─────────────┐
│   Icon/Img  │
├─────────────┤
│  Category   │
│   Name      │
└─────────────┘
```

**Features:**
- Category icon/image
- Category name
- Optional count badge
- Hover effect (scale + shadow)
- Click handler

**Props:**
```typescript
interface CategoryCardProps {
  icon?: React.ReactNode;
  image?: string;
  name: string;
  count?: number;
  onClick?: () => void;
  variant?: 'default' | 'featured';
}
```

---

### 4. **Category Carousel**
**Path:** `components/home/CategoryCarousel.tsx`

**Features:**
- Horizontal scroll layout
- Navigation arrows (next/prev)
- Shows 6-8 items on desktop, 3-4 on mobile
- Smooth scrolling
- Optional auto-scroll on mount

**Props:**
```typescript
interface CategoryCarouselProps {
  categories: CategoryCardProps[];
  onSelectCategory?: (category: string) => void;
  autoScroll?: boolean;
  itemsPerView?: number;
}
```

---

### 5. **Product Card**
**Path:** `components/shared/ProductCard.tsx`

**Structure:**
```
┌──────────────────────┐
│  Image + Wishlist ❤️  │
├──────────────────────┤
│  In Stock Badge      │
├──────────────────────┤
│  Product Name        │
│  Vendor Name         │
├──────────────────────┤
│  ⭐ 4.8 (92 orders)  │
├──────────────────────┤
│  ৳280/kg ৳350 -20%   │
├──────────────────────┤
│  Stock: 160 kg       │
├──────────────────────┤
│  [Add to Cart Button] │
└──────────────────────┘
```

**Features:**
- Product image with lazy loading
- Wishlist toggle (heart icon)
- Stock status badge
- Product name + vendor
- Rating with order count
- Price (original, current, discount%)
- Stock information
- Add to cart button with quantity

**Props:**
```typescript
interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  vendor: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: string;
  rating: number;
  orderCount: number;
  badge?: string;
  onAddToCart?: (productId: string, quantity: number) => void;
  onWishlistToggle?: (productId: string) => void;
  onCardClick?: (productId: string) => void;
}
```

---

### 6. **Promo Card**
**Path:** `components/home/PromoCard.tsx`

**Structure:**
```
┌─────────────────────────┐
│ Title + Discount Badge  │
│                         │
│      Product Image      │
│      (Optional)         │
│                         │
│  Description Text       │
│                         │
│  [Shop Now Button]      │
└─────────────────────────┘
```

**Features:**
- Colored background (3 variants: green, red, yellow)
- Title + discount percentage badge
- Optional product image
- Description text
- CTA button
- Responsive sizing

**Props:**
```typescript
interface PromoCardProps {
  title: string;
  discount?: string;
  description?: string;
  image?: string;
  backgroundColor: 'green' | 'red' | 'yellow';
  buttonText?: string;
  onButtonClick?: () => void;
  variant?: 'large' | 'small';
}
```

---

### 7. **Product Grid**
**Path:** `components/shared/ProductGrid.tsx`

**Features:**
- Responsive column layout (4 → 2 → 1)
- Grid gap and padding
- Optional loading skeleton
- Empty state handling
- Infinite scroll or pagination

**Props:**
```typescript
interface ProductGridProps {
  products: ProductCardProps[];
  columns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  loading?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}
```

---

### 8. **Review Card**
**Path:** `components/shared/ReviewCard.tsx`

**Structure:**
```
┌──────────────────────┐
│  Avatar | Name       │
│  ⭐⭐⭐⭐⭐ (5 stars) │
├──────────────────────┤
│  Review Text Content │
│  (2-3 lines)         │
└──────────────────────┘
```

**Features:**
- User avatar
- User name
- Star rating
- Review text
- Optional date

**Props:**
```typescript
interface ReviewCardProps {
  avatar: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
}
```

---

### 9. **Reviews Carousel**
**Path:** `components/home/ReviewsCarousel.tsx`

**Features:**
- Displays 4-5 reviews per view
- Auto-scroll or manual navigation
- Smooth transitions
- Responsive (shows 1-4 cards depending on screen)

**Props:**
```typescript
interface ReviewsCarouselProps {
  reviews: ReviewCardProps[];
  autoScroll?: boolean;
  interval?: number;
  itemsPerView?: number;
}
```

---

### 10. **Search Bar**
**Path:** `components/shared/SearchBar.tsx`

**Features:**
- Text input field
- Search icon button
- Category filter dropdown (optional)
- Recent searches (optional)
- Keyboard support (Enter to search)

**Props:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: (category: string) => void;
  categories?: string[];
  showFilter?: boolean;
}
```

---

### 11. **Section Header**
**Path:** `components/shared/SectionHeader.tsx`

**Structure:**
```
Title                [View All →]
Optional Subtitle
```

**Features:**
- Main heading
- Optional subtitle
- Optional "View All" link
- Responsive typography

**Props:**
```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  onViewAllClick?: () => void;
}
```

---

### 12. **Price Display**
**Path:** `components/shared/PriceDisplay.tsx`

**Features:**
- Current price (bold, large)
- Original price (strikethrough)
- Discount percentage badge
- Currency symbol

**Props:**
```typescript
interface PriceDisplayProps {
  currentPrice: number;
  originalPrice?: number;
  currency?: string;
  unit?: string;
}
```

---

### 13. **Stock Badge**
**Path:** `components/shared/StockBadge.tsx`

**Features:**
- Status text: "In Stock" / "Limited" / "Out of Stock"
- Color coding (green / orange / red)
- Optional stock quantity

**Props:**
```typescript
interface StockBadgeProps {
  status: 'in-stock' | 'limited' | 'out-of-stock';
  quantity?: string;
}
```

---

### 14. **Rating Badge**
**Path:** `components/shared/RatingBadge.tsx`

**Features:**
- Star rating (1-5)
- Order count display
- Clickable to view reviews (optional)

**Props:**
```typescript
interface RatingBadgeProps {
  rating: number;
  count: number;
  showCount?: boolean;
  onClick?: () => void;
}
```

---

## 📄 Page Layouts

### **1. Home Page** (`app/page.tsx`)

**Layout Order:**
```
1. Navbar (sticky)
2. Hero Section
   - Full width banner with image + CTA
3. Category Carousel
   - Browse categories section
4. Promo Cards (3 per row)
   - "Free Delivery" (Green)
   - "Ready to Check Out?" (Red)
   - "40% OFF" (Yellow)
5. Section: "Featured Products"
   - Product Grid (4 cols)
   - 12 products displayed
6. Section: "Daily Discover" or "Best Deals"
   - Product Grid variant
7. Section: "Today Best Deals"
   - Product cards (right sidebar style)
8. Reviews/Testimonials Carousel
9. Newsletter Signup Section
10. Footer
```

---

### **2. Marketplace/Products Page** (`app/marketplace/page.tsx`)

**Layout:**
```
Left Sidebar (25%):          Right Content (75%):
├── Category Filter          ├── Search Bar + Filters (top)
├── Price Range             ├── Sort Options
├── Rating Filter           ├── Product Grid (4 cols)
├── Stock Status            │
└── Clear Filters           └── Load More / Pagination
```

---

### **3. Product Detail Page** (`app/product/[id]/page.tsx`)

**Layout:**
```
Left (50%):                  Right (50%):
├── Product Image           ├── Product Name
├── Thumbnail Strip         ├── Rating + Reviews
│                          ├── Price Display
│                          ├── Stock Status
│                          ├── Quantity Selector
│                          ├── Add to Cart Button
│                          ├── Wishlist Button
│                          └── Product Details (tabs)
```

---

## 🎨 Design Details

### **Typography**

**Font Family:** Inter (already imported)

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Heading | 36-48px | 700 | #333 |
| Section Title | 24-32px | 600 | #333 |
| Card Heading | 16-18px | 600 | #333 |
| Product Price | 18-24px | 700 | #0d6e3e |
| Discount % | 14px | 600 | #ff9500 |
| Body Text | 14-16px | 400 | #666 |
| Small Text | 12-13px | 400 | #999 |

---

### **Spacing Scale**

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  24px
2xl: 32px
3xl: 40px
4xl: 48px
5xl: 60px
```

---

### **Border Radius**

```
sm: 4px   (Small elements)
md: 8px   (Cards, buttons)
lg: 12px  (Containers)
xl: 16px  (Large sections)
full: 9999px (Pills, avatars)
```

---

### **Shadows**

```
sm:  0 1px 2px rgba(0, 0, 0, 0.05)
md:  0 4px 6px rgba(0, 0, 0, 0.1)
lg:  0 10px 15px rgba(0, 0, 0, 0.1)
xl:  0 20px 25px rgba(0, 0, 0, 0.1)
```

---

### **Hover Effects**

- **Cards:** Scale 1.02 + shadow increase (200ms ease-out)
- **Buttons:** Brightness increase / color shift
- **Links:** Underline appears or color changes
- **Images:** Slight zoom (105%)

---

## 📱 Responsive Design

### **Breakpoints** (Tailwind)

```
Mobile:   < 640px  (1 column)
Tablet:   640px-1024px  (2 columns)
Desktop:  > 1024px  (4 columns)
```

### **Component Responsiveness**

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navbar | Hamburger menu | Hamburger menu | Full menu |
| Hero | Stacked (img below) | Side-by-side | Side-by-side |
| Categories | 3-4 visible | 5-6 visible | 8 visible |
| Promo Cards | 1 per row | 2 per row | 3 per row |
| Product Grid | 1 col | 2 cols | 4 cols |
| Reviews | 1 visible | 2 visible | 4 visible |

---

## ✅ Build Priority

### **Phase 1: Core Components** (Week 1)
1. ✅ ProductCard
2. ✅ CategoryCard
3. ✅ SearchBar
4. ✅ SectionHeader
5. ✅ PriceDisplay
6. ✅ StockBadge
7. ✅ RatingBadge

### **Phase 2: Sections** (Week 2)
8. ✅ HeroSection
9. ✅ CategoryCarousel
10. ✅ ProductGrid
11. ✅ PromoCard
12. ✅ ReviewCard
13. ✅ ReviewsCarousel

### **Phase 3: Pages** (Week 3)
14. ✅ Home Page (Combine all sections)
15. ✅ Marketplace Page (With filters)
16. ✅ Product Detail Page

### **Phase 4: Enhancement** (Week 4)
17. ✅ Cart functionality
18. ✅ Wishlist
19. ✅ AI Search integration
20. ✅ Animations + polish

---

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── navbar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── [other shadcn UI]
│   ├── shared/
│   │   ├── ProductCard.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── StockBadge.tsx
│   │   ├── RatingBadge.tsx
│   │   └── ReviewCard.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CategoryCarousel.tsx
│   │   ├── PromoCard.tsx
│   │   ├── ReviewsCarousel.tsx
│   │   └── index.ts
│   └── [other pages]
├── app/
│   ├── page.tsx (Home)
│   ├── marketplace/
│   │   └── page.tsx
│   ├── product/
│   │   └── [id]/page.tsx
│   └── [other routes]
└── [other directories]
```

---

## 🚀 Next Steps

1. Create all components in `components/shared/` and `components/home/`
2. Build Home page combining all sections
3. Build Marketplace page with filters
4. Build Product Detail page
5. Add animations and polish
6. Test responsive design
7. Integrate with API
8. Add Cart and Checkout flow

---

**Last Updated:** May 7, 2026
