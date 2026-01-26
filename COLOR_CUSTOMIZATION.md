# Color Customization Guide

## 🎨 Where to Customize Colors

All primary colors are defined in **ONE SINGLE FILE** for easy customization:

### 📍 Location: `app/globals.css`

Open `app/globals.css` and look for the `:root` section at the top. All color variables are defined there.

## 🎨 Current Color Scheme

The app uses a **dark theme** with **purple and pink accents**:

### Background Colors
- `--bg-primary`: Main dark background (`#0f0a1a`)
- `--bg-secondary`: Secondary dark background for cards/panels (`#1a0f2e`)
- `--bg-tertiary`: Tertiary dark background for hover states (`#251a3a`)

### Purple Colors (Primary Accent)
- `--purple-primary`: Main purple for buttons, links (`#9333ea`)
- `--purple-secondary`: Hover states (`#7c3aed`)
- `--purple-light`: Light purple for highlights (`#a855f7`)
- `--purple-dark`: Dark purple for borders/shadows (`#6b21a8`)

### Pink Colors (Secondary Accent)
- `--pink-primary`: Main pink for accents (`#ec4899`)
- `--pink-secondary`: Hover states (`#db2777`)
- `--pink-light`: Light pink for highlights (`#f472b6`)
- `--pink-dark`: Dark pink for borders (`#be185d`)

### Text Colors
- `--text-primary`: Primary text (white - `#ffffff`)
- `--text-secondary`: Secondary text (light gray - `#e5e7eb`)
- `--text-muted`: Muted text (gray - `#9ca3af`)

### Status Colors
- `--status-success`: Green for success (`#10b981`)
- `--status-warning`: Orange for warnings (`#f59e0b`)
- `--status-error`: Red for errors (`#ef4444`)
- `--status-info`: Blue for info (`#3b82f6`)

### Border Colors
- `--border-primary`: Primary border (`#4b5563`)
- `--border-secondary`: Secondary border (`#374151`)

## 🔧 How to Change Colors

1. **Open** `app/globals.css`
2. **Find** the `:root` section (lines 8-45)
3. **Change** any hex color value to your preferred color
4. **Save** the file - changes will apply automatically!

### Example: Change Primary Purple

```css
:root {
  /* Change this line */
  --purple-primary: #9333ea;  /* Your new color here */
  
  /* ... rest of colors */
}
```

## 📝 Usage in Components

Colors are used throughout the app via Tailwind classes:

- `bg-bg-primary` → Uses `--bg-primary`
- `text-purple-primary` → Uses `--purple-primary`
- `text-pink-primary` → Uses `--pink-primary`
- `border-border-primary` → Uses `--border-primary`

All components automatically use these variables, so changing them in `globals.css` updates the entire app!

## 🎯 Quick Color Swaps

### Want a Different Purple?
Change `--purple-primary`, `--purple-secondary`, `--purple-light`, and `--purple-dark` in `globals.css`

### Want a Different Pink?
Change `--pink-primary`, `--pink-secondary`, `--pink-light`, and `--pink-dark` in `globals.css`

### Want a Lighter/Darker Background?
Change `--bg-primary`, `--bg-secondary`, and `--bg-tertiary` in `globals.css`

### Want Different Text Colors?
Change `--text-primary`, `--text-secondary`, and `--text-muted` in `globals.css`

## 💡 Pro Tips

1. **Keep contrast in mind**: Ensure text remains readable on backgrounds
2. **Test hover states**: Make sure hover colors are visible
3. **Use color pickers**: Tools like [Coolors](https://coolors.co) can help generate color palettes
4. **Maintain consistency**: Keep similar elements using the same color variables

## 🔍 Where Colors Are Used

- **Purple**: Headings, primary buttons, links, navigation
- **Pink**: Section headings, secondary accents, bold text
- **Backgrounds**: Cards, modals, panels, main app background
- **Text**: All text content (white/light gray)
- **Status**: Success/warning/error/info badges and messages

All of these are controlled by the variables in `app/globals.css`!
