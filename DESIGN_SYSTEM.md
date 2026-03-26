# CasusApp Design System v2.5
## Premium Travel App Aesthetic - Nature-Inspired Refinement

---

## 🎨 Color Palette

### Primary Brand Colors (Soft Forest Green)
A lighter, more inviting forest green palette inspired by soft sage and peaceful nature tones.

**Full Scale:**
- `50` - `#E8F3EF` - Lightest tint, backgrounds
- `100` - `#C7E3D8` - Light hover states, subtle backgrounds
- `200` - `#A5D4C1` - Soft highlights
- `300` - `#7FC4A6` - Medium-light accents
- `400` - `#59B48B` - Active states
- `500` - `#34856C` - **Primary brand color** ⭐
- `600` - `#2A6D59` - Primary hover, darker CTAs
- `700` - `#205446` - Pressed states
- `800` - `#163B33` - Dark text on light backgrounds
- `900` - `#0C2520` - Darkest, high contrast text

**Primary Usage:**
- Primary buttons, links: `primary-600` (#2A6D59)
- Primary hover: `primary-700` (#205446)
- Primary backgrounds: `primary-50` (#E8F3EF)
- Primary text: `primary-900` (#0C2520)

### Secondary Brand Colors (Sandy Beige)
Warm, earthy beige tones for secondary actions, backgrounds, and creating visual warmth.

**Full Scale:**
- `50` - `#FAF7F3` - Lightest cream, page backgrounds
- `100` - `#F0EAE1` - Light card backgrounds, hover
- `200` - `#E8DFD3` - Soft beige surfaces
- `300` - `#D9CABA` - Medium beige accents
- `400` - `#C4B39C` - Active beige elements
- `500` - `#A89379` - **Secondary brand color** ⭐
- `600` - `#8F7A62` - Secondary hover
- `700` - `#6F5F4D` - Pressed beige states
- `800` - `#564A3D` - Dark beige text
- `900` - `#3D342B` - Darkest beige

**Beige Usage:**
- Secondary buttons: `beige-500` (#A89379)
- Card backgrounds (warm): `beige-50` (#FAF7F3)
- Section dividers: `beige-200` (#E8DFD3)
- Subtle highlights: `beige-100` (#F0EAE1)

### Neutral Colors (Soft Whites & Refined Grays)
Clean, modern neutrals for text hierarchy and surface elevation.

**Full Scale:**
- `50` - `#FEFEFE` - Pure white, primary surfaces
- `100` - `#F9F9F8` - Off-white, page backgrounds
- `200` - `#F1F0EF` - Light gray surfaces
- `300` - `#E2E1DF` - Subtle borders, dividers
- `400` - `#B8B6B3` - Muted elements
- `500` - `#8B8885` - Secondary text
- `600` - `#6A6764` - Body text
- `700` - `#504E4B` - Headings, important text
- `800` - `#353431` - High contrast text
- `900` - `#1F1E1C` - Maximum contrast, darkest text

**Neutral Usage:**
- Page background: `neutral-100` (#F9F9F8)
- Card surface: `neutral-50` (#FEFEFE)
- Borders: `neutral-300` (#E2E1DF)
- Body text: `neutral-700` (#504E4B)
- Headings: `neutral-900` (#1F1E1C)

### Semantic Colors
- **Success**: `#10B981` - Confirmations, positive actions
- **Error**: `#EF4444` - Errors, destructive actions
- **Warning**: `#F59E0B` - Warnings, attention
- **Info**: `#3B82F6` - Information, neutral actions

---

## 📐 Spacing System - Generous Whitespace

**8px Grid Base Unit - Increased for Premium Breathing Room**
- `xs` - 4px (Micro gaps, tight element spacing)
- `sm` - 8px (Small internal spacing)
- `md` - 12px (Component internal padding)
- `lg` - 20px (Card padding, generous spacing) ⭐ **INCREASED**
- `xl` - 24px (Section spacing, comfortable gaps)
- `2xl` - 32px (Major containers, page sections)
- `3xl` - 40px (Large page sections)
- `4xl` - 48px (Hero sections, major divisions)
- `5xl` - 64px (Extra large spacing)

**Application Patterns (Updated for Breathing Room):**
- Cards: `p-lg` (20px padding) - Increased from 16px ⭐
- Section spacing: `gap-xl` or `gap-2xl` (24-32px) between major sections
- Buttons: `px-lg py-md` (horizontal 20px, vertical 12px)
- Modals: `p-2xl` (32px padding)
- Lists: `gap-md` (12px) or `gap-lg` (20px) between items
- Page containers: `px-lg` (20px) with `py-xl` (24px) for generous margins
- Between card groups: `mb-xl` or `mb-2xl` (24-32px)

**Breathing Room Philosophy:**
Let content breathe with generous padding and margins. Premium travel experiences deserve spacious, uncluttered layouts.

---

## 🔲 Border Radius

**Consistent 16px for Premium Feel**
- `xs` - 4px (Very small elements)
- `sm` - 8px (Input fields, small controls)
- `md` - 12px (Medium components)
- `lg` - 16px (Cards, buttons, modals) ⭐ PRIMARY
- `xl` - 20px (Large modals, hero sections)
- `2xl` - 24px (Extra large containers)
- `full` - 9999px (Circular elements)

**Application:**
- All cards: `rounded-lg`
- All buttons: `rounded-lg`
- Modals: `rounded-xl`
- Input fields: `rounded-md` to `rounded-lg`
- Images in cards: `rounded-lg`
- User avatars: `rounded-full`

---

## 🌟 Shadows

**Subtle Soft Shadows for Premium Depth**

```css
/* Extra Small - Barely visible depth */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Small - Slight elevation */
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* Medium - Standard elevation */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Large - Premium depth (PRIMARY) */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); ⭐

/* Extra Large - Hero/modal depth */
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);

/* 2XL - Floating layers */
box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);

/* Inner - Inset shadows for depth */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
```

**Application:**
- Cards: `shadow-lg` (primary shadow)
- Buttons: `shadow-lg` (depth without hover)
- Modals: `shadow-2xl` (maximum depth)
- Elevated elements: `shadow-xl`
- Subtle backgrounds: `shadow-xs` or `shadow-sm`
- Floating action buttons: `shadow-xl`

---

## 📱 Typography

**Font Family:** Outfit (system-ui fallback)

### Size Scale
- `xs` 12px / 16px - Small labels, captions, badges
- `sm` 13px / 18px - Secondary text
- **`md` 16px / 24px - Body text (default)**
- `lg` 18px / 28px - Subheadings
- `xl` 20px / 28px - Headings (medium)
- `2xl` 24px / 32px - Headings (large)
- `3xl` 30px / 36px - Hero/page titles

### Font Weights
- **Regular** 400 - Body text
- **Medium** 500 - Labels, highlights
- **Semibold** 600 - Buttons, subheadings
- **Bold** 700 - Headings, CTAs

### Text Colors
- **Primary Text (Headings)**: `neutral-900` (#1F1E1C) - Maximum contrast
- **Body Text**: `neutral-700` (#504E4B) - Comfortable reading
- **Secondary Text**: `neutral-600` (#6A6764) - Supporting information
- **Tertiary Text**: `neutral-500` (#8B8885) - Least important text
- **Accent Text**: `primary-600` (#2A6D59) - Links, highlights
- **On Dark Backgrounds**: `neutral-50` (#FEFEFE)
- **Disabled Text**: `neutral-400` (#B8B6B3)

---

## 🔘 Components

### Buttons

**Solid Variant (Primary CTA)**
- Background: `primary-600` (#2A6D59)
- Text: White
- Padding: `px-lg py-md` (20px × 12px) ⭐ **INCREASED**
- Border Radius: `lg` (16px)
- Shadow: `lg` (0 4px 20px rgba(0,0,0,0.08))
- Hover: `primary-700` (#205446)
- Pressed State: `opacity-90 scale-98.5`
- Font Weight: `600` (semibold)

```tsx
<Button 
  bg="primary.600" 
  rounded="lg" 
  px="lg" 
  py="md" 
  shadow="lg"
  _pressed={{ opacity: 0.9, transform: [{ scale: 0.985 }] }}
>
  Action
</Button>
```

**Outline Variant (Secondary)**
- Border: `1.5px primary-600` (#2A6D59)
- Text: `primary-600`
- Background: Transparent
- Padding: `px-lg py-md` (20px × 12px)
- Border Radius: `lg` (16px)
- Hover: `bg-primary-50` (#E8F3EF)

**Ghost Variant (Minimal)**
- Background: Transparent
- Text: `primary-600` (#2A6D59)
- Padding: `px-lg py-md` (20px × 12px)
- Hover: `bg-primary-50` (#E8F3EF)
- Pressed: `bg-primary-100` (#C7E3D8)

**Beige Variant (Secondary CTA)** ⭐ **NEW**
- Background: `beige-500` (#A89379)
- Text: White
- Padding: `px-lg py-md` (20px × 12px)
- Border Radius: `lg` (16px)
- Shadow: `lg`
- Hover: `beige-600` (#8F7A62)

**Beige Outline Variant**
- Border: `1.5px beige-500` (#A89379)
- Text: `beige-700` (#6F5F4D)
- Background: Transparent or `beige-50` (#FAF7F3)
- Padding: `px-lg py-md`
- Border Radius: `lg`

### Cards

- Background: `neutral-50` (#FEFEFE) or `beige-50` (#FAF7F3) for warm variant
- Padding: `lg` (20px) ⭐ **INCREASED**
- Border Radius: `lg` (16px)
- Shadow: `lg` (0 4px 20px rgba(0,0,0,0.08))
- Border: None (clean look)
- Spacing below: `xl` or `2xl` (24-32px) in lists for breathing room

```tsx
<Card rounded="lg" shadow="lg" bg="white" p="lg">
  {/* content */}
</Card>
```

### Input Fields

- Border Radius: `lg` (16px) - Consistent with buttons
- Border Width: `1.5px`
- Border Color: `neutral-300` (#E2E1DF)
- Padding: `px-lg py-md` (20px × 12px)
- Background: `neutral-50` (#FEFEFE)
- Focus State:
  - Border Color: `primary-600` (#2A6D59)
  - Shadow: `lg` (subtle focus glow)
- Disabled State:
  - Opacity: `0.6`
  - Background: `neutral-200` (#F1F0EF)

### Form Labels

- Font Size: `sm` (13px)
- Font Weight: `600` (semibold)
- Color: `neutral-700` (#504E4B)
- Margin Bottom: `sm` (8px)

### Badges

- Padding: `px-md py-sm`
- Border Radius: `md` (12px)
- Font Size: `xs`
- Font Weight: `600`

**Solid Primary**: `bg-primary-600 text-white` (#2A6D59)
**Solid Beige**: `bg-beige-500 text-white` (#A89379)
**Subtle Primary**: `bg-primary-50 text-primary-800` (#E8F3EF / #163B33)
**Subtle Beige**: `bg-beige-100 text-beige-800` (#F0EAE1 / #564A3D)
**Outline**: `border-primary-600 text-primary-600`

### Cards with Images

- Image border radius: `lg` (16px) — rounded corners
- Image aspect ratio: `16 / 9` (standard for activities)
- Image height: `200px` minimum for thumbnails
- Overlay gradients for text readability

### Activity Cards (Premium Pattern)

```tsx
<Card rounded="lg" shadow="lg" overflow="hidden">
  <Image rounded="lg" source={{uri: imageUrl}} h="200px" />
  <Box p="lg">
    <Text fontSize="lg" fontWeight="700" color="neutral.900">
      Activity Title
    </Text>
    <Text fontSize="sm" color="neutral.600">
      Location • Category
    </Text>
    <HStack justify="space-between" mt="md">
      <Rating score={4.5} />
      <Text fontSize="lg" fontWeight="700" color="primary.600">
        €50
      </Text>
    </HStack>
  </Box>
</Card>
```

---

## 📏 Whitespace Strategy

**Breathing Room is Premium**

### Horizontal Spacing
- Between inline elements: `gap-sm` (8px)
- Between large elements: `gap-lg` to `gap-xl` (16-20px)
- Form fields: `gap-md` (12px) between label and input

### Vertical Spacing
- Between paragraphs: `mt-lg` (16px)
- Between sections: `mt-2xl` to `mt-3xl` (24-32px)
- Between major sections: `mt-3xl` to `mt-4xl` (32-40px)
- List item spacing: `gap-md` (12px) between items

### Card Spacing in Lists
- Gap between cards: `gap-lg` (16px)
- Horizontal padding (list container): `px-lg` (16px)
- Bottom padding (scroll space): `pb-2xl` (24px)

### Inside Cards
- Padding: `lg` (16px) — generous internal spacing
- Between card elements: `gap-md` (12px)
- Image-to-content gap: `md` (12px) or `lg` (16px)

---

## 🌙 Dark Mode Considerations

**Current Implementation:** No dark mode active  
**Future Implementation:** Use NativeBase/Tailwind color system
- Background: `neutral.900` or darker
- Surface: `neutral.800`
- Text: `neutral.50` (off-white)
- Maintain same accent colors for contrast

---

## ✨ Micro-interactions

### Button Press State
