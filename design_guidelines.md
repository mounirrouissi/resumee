# Resumax - Mobile Design Guidelines

## Architecture Decisions

### Authentication
**Decision: No Authentication Required**
- The app is a utility/single-user focused tool for resume improvement
- Data is processed and stored locally on device
- **Profile/Settings Screen Required**:
  - User-customizable avatar (1 preset professional avatar - minimalist silhouette in app accent color)
  - Display name field for personalization
  - App preferences: theme toggle (light/dark), notification settings for processing completion

### Navigation Architecture
**Root Navigation: Tab Navigation (3 tabs)**

The app has 3 distinct feature areas:
1. **Home Tab** (Upload & Process) - Core action center
2. **History Tab** - Past processed resumes
3. **Profile Tab** - Settings and preferences

Tab bar positioning:
- Upload positioned in center tab as the core action
- Order: History | Upload | Profile

**Information Architecture:**
```
├── Home Stack
│   ├── Upload Screen (initial)
│   └── Processing Screen (modal overlay)
│   └── Preview Screen (pushed)
├── History Stack
│   ├── History List Screen
│   └── Resume Detail Screen (pushed)
└── Profile Stack
    └── Profile/Settings Screen
```

## Screen Specifications

### 1. Upload Screen (Home Tab - Initial Screen)
**Purpose:** Primary interface for uploading and initiating resume improvement

**Layout:**
- **Header:** Transparent, custom navigation header
  - Left: None
  - Right: Info icon (shows tips modal)
  - Title: "Resumax"
  - Top inset: headerHeight + Spacing.xl

- **Main Content:** Scrollable view
  - Large upload zone (dashed border card, centered icon and text)
  - "Choose PDF" primary action button
  - Recent upload preview (if exists) below upload zone
  - Safe area bottom inset: tabBarHeight + Spacing.xl

- **Components:**
  - Upload zone card (min height 200px, dashed border, tap to select)
  - Primary button with document picker
  - File name display chip (when selected)
  - Floating "Process Resume" button (appears after file selected)

**Floating Button Shadow (if used):**
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

### 2. Processing Screen (Modal Overlay)
**Purpose:** Visual feedback during AI processing and PDF generation

**Layout:**
- **Full-screen modal** with semi-transparent backdrop
- Centered content card with:
  - Animated processing indicator (Lottie or system ActivityIndicator)
  - Processing stage text ("Extracting text..." → "Improving content..." → "Generating PDF...")
  - Progress percentage (if backend provides)
  - Cancel button (bottom, text button)

- **No safe area adjustments** (modal centers itself)

### 3. Preview Screen (Pushed from Home)
**Purpose:** Review improved resume text and download final PDF

**Layout:**
- **Header:** Default navigation header with back button
  - Title: "Improved Resume"
  - Right: Share icon button
  - Non-transparent header
  - Top inset: Spacing.xl

- **Main Content:** Scrollable view showing improved text
  - Text diff view (optional: highlight changes)
  - Side-by-side comparison toggle
  - Bottom inset: tabBarHeight + Spacing.xl

- **Floating Action:**
  - Fixed bottom button: "Download PDF" (primary color)
  - Positioned above tab bar with proper safe area
  - Shadow applied per floating button specs

**Components:**
- Text display card with improved resume content
- Comparison toggle switch
- Download button (fixed, not scrollable)
- Success toast on download

### 4. History Screen (History Tab)
**Purpose:** View and access previously processed resumes

**Layout:**
- **Header:** Transparent, default navigation
  - Title: "History"
  - Right: Clear all button (text)
  - Top inset: headerHeight + Spacing.xl

- **Main Content:** FlatList/ScrollView
  - Empty state with illustration and "No resumes yet" message
  - List of resume cards (newest first)
  - Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Resume history card (shows: original filename, date processed, preview snippet)
- Swipe actions: Delete, Share
- Empty state illustration

### 5. Profile/Settings Screen (Profile Tab)
**Purpose:** User personalization and app preferences

**Layout:**
- **Header:** Transparent, default navigation
  - Title: "Profile"
  - Top inset: headerHeight + Spacing.xl

- **Main Content:** Scrollable form-style layout
  - Avatar selection (circular, 80px diameter)
  - Display name input field
  - Theme toggle (Light/Dark/System)
  - Notification preferences toggle
  - About section (app version, privacy policy placeholder, terms placeholder)
  - Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Avatar picker (circular image with edit overlay icon)
- Text input field (display name)
- Toggle switches for preferences
- Section headers and dividers
- List items for links (chevron right indicators)

## Design System

### Color Palette
**Primary:** Professional Blue
- Primary: #2563EB (Modern, trustworthy blue)
- Primary Light: #60A5FA
- Primary Dark: #1E40AF

**Neutrals:**
- Background Light: #F9FAFB
- Background Dark: #111827
- Surface Light: #FFFFFF
- Surface Dark: #1F2937
- Text Primary Light: #111827
- Text Primary Dark: #F9FAFB
- Text Secondary Light: #6B7280
- Text Secondary Dark: #9CA3AF
- Border Light: #E5E7EB
- Border Dark: #374151

**Semantic:**
- Success: #10B981 (processing complete)
- Error: #EF4444 (upload/processing errors)
- Warning: #F59E0B (file size warnings)

### Typography
**Font Family:** System default (San Francisco on iOS, Roboto on Android)

**Type Scale:**
- Hero: 32px, Bold (Upload screen headline)
- H1: 28px, Bold (Screen titles)
- H2: 20px, Semibold (Section headers)
- Body: 16px, Regular (Main content)
- Body Small: 14px, Regular (Secondary info)
- Caption: 12px, Regular (Metadata, timestamps)
- Button: 16px, Semibold (All buttons)

### Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### Component Specifications

**Buttons:**
- Primary: Filled background (Primary color), white text, height 48px, border radius 12px
- Secondary: Outlined (1px Primary color), Primary text, height 48px, border radius 12px
- Text: No background, Primary color text
- All buttons: Visual press feedback (opacity 0.7 on press)

**Cards:**
- Background: Surface color
- Border radius: 16px
- Padding: Spacing.lg
- No shadow for standard cards
- Border: 1px solid Border color

**Upload Zone:**
- Dashed border: 2px dashed Border color
- Border radius: 16px
- Padding: Spacing.2xl
- Tap feedback: Border color changes to Primary

**Input Fields:**
- Height: 48px
- Border radius: 12px
- Border: 1px solid Border color
- Focus state: Border color Primary, 2px width
- Padding horizontal: Spacing.lg

**Icons:**
- Use Feather icons from @expo/vector-icons
- Standard size: 24px
- Tab bar icons: 24px
- Button icons: 20px
- Color: Match text color hierarchy

### Critical Assets

**Required Generated Assets:**
1. **Profile Avatar** (1 preset):
   - Minimalist professional silhouette in Primary color
   - Circular, 400x400px
   - Clean, modern aesthetic suitable for professional app
   - Export as PNG with transparency

2. **Empty State Illustration** (History screen):
   - Simple illustration of document/folder
   - Matches app color palette
   - 200x200px
   - Line art style

**System Icons (Feather Icons):**
- Upload: upload-cloud
- File: file-text
- Settings: settings
- Profile: user
- History: clock
- Download: download
- Share: share-2
- Info: info
- Check: check-circle
- Close: x

### Accessibility Requirements
- Minimum touch target: 44x44px (all interactive elements)
- Color contrast: WCAG AA compliant (4.5:1 for text)
- VoiceOver/TalkBack labels for all interactive elements
- Loading states announced to screen readers
- Error messages clearly communicated
- Support for system font scaling
- Keyboard navigation support where applicable