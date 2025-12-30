# Logo Setup Guide for QTech Mobile App

## Where to Place Your Logo Files

Place your logo files in the **`mobile/assets/`** directory. You should include multiple sizes:

### Recommended Logo Files:
- `logo.png` or `logo.jpg` - Main logo (recommended size: 512x512px or higher)
- `logo-small.png` - Smaller version for app headers (256x256px)
- `icon.png` - App icon (1024x1024px for best quality)

### File Structure:
```
mobile/
  assets/
    logo.png          (Main logo - 512x512px or higher)
    logo-small.png    (Small logo - 256x256px)
    icon.png          (App icon - 1024x1024px)
```

## Steps to Add Your Logo:

1. **Place your logo files** in `mobile/assets/` folder
2. **Recommended format**: PNG with transparent background (for logo.png)
3. **Recommended sizes**:
   - Main logo: 512x512px (or 1024x1024px for retina displays)
   - Small logo: 256x256px
   - App icon: 1024x1024px (square, will be used for app icon)

## After Uploading:

The logo will automatically be used in:
- ✅ Login Screen (logoContainer)
- ✅ Register Screen (logoContainer)
- ✅ App Icon (if you update app.json)

You can also use it in other screens if needed.

## Notes:
- Use PNG format with transparent background for best results
- Ensure your logo looks good on both light and dark backgrounds (if you support dark mode in the future)
- The logo will automatically scale to fit the container size

