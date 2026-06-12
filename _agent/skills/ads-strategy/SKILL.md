---
name: ads-strategy
description: Expertise in high-conversion social media ads and persuasive copywriting structure.
---

# Social Media Ads Strategy Skill

This skill defines the technical and strategic implementation of high-performance social media ads within the image converter.

## Core Framework: Hook-Value-CTA
All ad copy must follow this mental model:
1. **Gancho (Hook)**: Catch attention in <3s. Resolves a problem or asks a direct question.
2. **Desarrollo (Value)**: Concise benefit explanation.
3. **Prueba Social (Social Proof)**: Results, "X+ users", or authority (optional but recommended).
4. **CTA (Action)**: Direct instruction on what to do next.

## Technical Implementation
The strategy is implemented in `src/services/contentModes.ts` via:
- `buildContextString`: Dynamically injects type-specific rules (e.g., Stories vs. Ads).
- `defaultPrompt`: Sets the professional tone for the AI.

## Hashtag Strategy
Split into 3 tiers (5-10 total):
- **Tier 1 (Nicho)**: Specific service/product tags (e.g., #remodelacion).
- **Tier 2 (Comunidad)**: Location or interest based (e.g., #bogota).
- **Tier 3 (Marca)**: Unique brand identifier.

**CRITICAL**: For `publicationType === 'Anuncio (Ad)'`, hashtags must be OMITTED to minimize distractions from the primary conversion goal.

## Adaptability by Type
- **Stories**: Extremely brief, energética, focus on `hook_text`.
- **Carousel**: Sequence of slides (`Diapositiva 1`, `Diapositiva 2`).
- **Ads**: Conversion-first, zero hashtags.
