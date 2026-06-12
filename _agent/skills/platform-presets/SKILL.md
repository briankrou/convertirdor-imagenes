---
name: platform-presets
description: Management of social media image dimensions and automated resizing presets.
---

# Platform Presets Skill

This skill manages the automated dimension configuration for different social media platforms and publication types.

## Preset Configuration
Located in `src/components/Sidebar.tsx` within the `useEffect` hook that watches `platform` and `publicationType`.

### Standards
- **Instagram Feed**: 1080×1080 (Square)
- **Instagram Stories / Reels**: 1080×1920 (Vertical 9:16)
- **Facebook Ad**: 1200×628 (Horizontal)
- **Twitter / X**: 1200×675

## Logic Flow
1. User selects a **Plataforma**.
2. User selects a **Tipo de publicación**.
3. The component auto-enables `resize` and sets the `width` and `height` based on the mapping.
4. A "Tip Pro" UI component appears for specific modes (like Ads) to guide the user.

## Extension Guide
To add a new preset:
1. Locate the `useEffect` in `Sidebar.tsx`.
2. Update the switch/mapping logic to include the new platform/type combination.
3. Ensure the `resize` settings are updated in the state via `onSettingsChange`.
