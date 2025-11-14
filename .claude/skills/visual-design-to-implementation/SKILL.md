---
name: Visual Design to Implementation
description: Analyze screenshots or mockups of UI designs (web and mobile) and implement them by either modifying existing blocks or creating new ones. Use this skill when you have a visual reference of what needs to be built or changed.
---

# Visual Design to Implementation

This skill helps you take screenshots, mockups, or visual references and transform them into working AEM Edge Delivery blocks. It bridges the gap between design and implementation by analyzing visual designs, determining the best implementation approach, and coordinating with other skills to execute the work.

## Related Skills

- **block-collection-and-party**: Find existing blocks with similar patterns
- **content-modeling**: Design content models based on visual requirements
- **building-blocks**: Create or significantly modify blocks
- **content-driven-development**: Full CDD workflow for new blocks
- **testing-blocks**: Validate implementation matches the design

## When to Use This Skill

Use this skill when:
- You have screenshots or mockups of a UI component to build
- You need to match an existing design or brand guideline
- You want to recreate a UI pattern you've seen elsewhere
- You're doing visual QA and need to match a reference design
- You have both mobile and desktop designs to implement

## Prerequisites

**Required:**
- Visual reference (screenshot, mockup, or detailed description)
- Understanding of what the component should do (functionality)

**Helpful:**
- Multiple viewport sizes (mobile, tablet, desktop)
- Interactive state examples (hover, active, etc.)
- Content requirements or examples

## Process Overview

1. Analyze the Visual Design
2. Identify UI Components and Patterns
3. Determine Implementation Approach
4. Search for Existing Similar Blocks
5. Execute Implementation
6. Visual Validation

## Detailed Process

### Step 1: Analyze the Visual Design

**Examine the provided screenshot/mockup and identify:**

**Visual Elements:**
- Layout structure (grid, flex, absolute positioning)
- Typography (sizes, weights, colors, hierarchy)
- Color scheme and themes
- Spacing and padding patterns
- Borders, shadows, and visual effects
- Icons and imagery
- Responsive behavior (if multiple views provided)

**Interactive Elements:**
- Buttons and CTAs
- Links and navigation
- Forms and inputs
- Hover/focus states
- Animations or transitions
- Modal/tooltip/dropdown behavior

**Content Structure:**
- What content types are present (text, images, videos, etc.)
- How content is organized and grouped
- Repeating patterns or collections
- Semantic hierarchy (headings, lists, etc.)

**Document your analysis:**
```markdown
## Visual Design Analysis

### Layout
[Describe the overall layout structure]

### Components Identified
- [Component 1: Description]
- [Component 2: Description]

### Responsive Behavior
- Mobile: [Observations]
- Tablet: [Observations]
- Desktop: [Observations]

### Interactive Elements
- [Element: Behavior description]

### Content Requirements
- [What content is needed]
```

### Step 2: Identify UI Components and Patterns

**Map visual elements to AEM patterns:**

**Ask these questions:**
- Is this a complete page layout or a reusable component?
  - Page layout → May need multiple blocks
  - Reusable component → Likely single block

- Does this component already exist in the project?
  - Use the Glob tool to search for similar block names
  - Use the block-collection-and-party skill to find similar patterns

- What canonical block model fits best?
  - Standalone: Unique visual element (hero, blockquote)
  - Collection: Repeating items (cards, gallery)
  - Configuration: Dynamic/API-driven content
  - Auto-Blocked: Complex nesting or transformation

- Are there variants or multiple states?
  - Document each variant separately

### Step 3: Determine Implementation Approach

**Choose the right approach:**

#### Option A: Modify Existing Block
Choose this when:
- An existing block does 80%+ of what's needed
- Changes are primarily CSS/styling
- Functionality is the same, just visual differences
- You're adding a new variant to an existing block

**Process:**
1. Identify the target block to modify
2. Read the existing JS and CSS
3. Make targeted changes (prefer CSS over JS when possible)
4. Test the changes don't break existing usage

#### Option B: Create New Block
Choose this when:
- No existing block is close enough (< 50% similar)
- Functionality is significantly different
- Content model is completely different
- Combining with existing block would create too much complexity

**Process:**
1. Invoke the **content-driven-development** skill for full CDD workflow
2. The CDD skill will handle content modeling, implementation, and testing

#### Option C: Modify Utility/Shared Code
Choose this when:
- The design affects multiple blocks (e.g., button styles, tooltips)
- Changes should be global (e.g., spacing system, typography)
- It's a shared pattern used across the site

**Process:**
1. Identify the appropriate shared CSS file (styles/*.css)
2. Make changes to the global styles
3. Test across multiple blocks/pages to ensure no regressions

### Step 4: Search for Existing Similar Blocks

**Before implementing, always search for reusable patterns:**

1. **Search local codebase:**
   ```
   - Use Glob to find blocks: `blocks/**/*.js`
   - Grep for similar functionality or patterns
   - Read similar blocks for code reuse opportunities
   ```

2. **Search Block Collection:**
   - Invoke the **block-collection-and-party** skill
   - Provide description of what you're looking for
   - Review any relevant reference implementations

3. **Document findings:**
   - Note any reusable patterns found
   - Identify code that can be borrowed/adapted
   - Note any anti-patterns to avoid

### Step 5: Execute Implementation

**Based on your chosen approach:**

#### For Modifying Existing Blocks:

1. **Read existing code:**
   - Read the block's JS file
   - Read the block's CSS file
   - Understand the current content model

2. **Plan changes:**
   - List specific changes needed (CSS vs JS)
   - Identify potential side effects
   - Consider backwards compatibility

3. **Implement changes:**
   - Start with CSS changes (less risk)
   - Make JS changes if needed
   - Add new variants if applicable
   - Preserve existing functionality

4. **Update documentation:**
   - Add code comments for complex changes
   - Update author documentation if content model changed

#### For Creating New Blocks:

1. **Invoke content-driven-development skill:**
   - Provide the visual reference
   - Share your visual design analysis
   - Let CDD handle the full workflow

#### For Modifying Shared Styles:

1. **Identify the right file:**
   - `styles/styles.css` - Core global styles
   - `styles/typography.css` - Type system
   - `styles/button.css` - Button styles
   - `styles/utils.css` - Utility classes
   - Other specialized files as needed

2. **Make targeted changes:**
   - Preserve existing functionality
   - Use CSS custom properties for flexibility
   - Consider responsive behavior
   - Test across multiple contexts

### Step 6: Visual Validation

**Compare implementation to design:**

1. **Test locally:**
   - View in browser at actual size
   - Test all responsive breakpoints
   - Test interactive states (hover, focus, active)
   - Test with real content (long text, no images, etc.)

2. **Side-by-side comparison:**
   - Place browser window next to design reference
   - Check spacing, sizing, colors, typography
   - Verify alignment and layout
   - Check that animations/transitions match

3. **Take screenshots for validation:**
   - Capture key states and viewports
   - Document any intentional deviations from design
   - Note any technical limitations encountered

4. **Iterate as needed:**
   - Make refinements based on comparison
   - Test edge cases
   - Ensure accessibility requirements are met

## Special Considerations

### Responsive Design

When provided with multiple viewport designs:
1. Implement mobile-first (start with smallest viewport)
2. Use media queries to progressively enhance for larger screens
3. Test all breakpoints, not just the ones shown in designs
4. Consider in-between sizes (what happens at 768px if designs show 375px and 1024px?)

### Interactive Elements

For tooltips, modals, dropdowns, etc.:
1. Consider semantic HTML and accessibility
2. Use existing utilities when possible (check `utils/` directory)
3. Handle keyboard navigation
4. Test touch vs mouse interactions
5. Consider z-index and stacking context

### Design-to-Code Translation

**Common translation patterns:**

- **Spacing in designs:** Often shown in px, but implement with CSS custom properties (`var(--spacing-m)`)
- **Colors:** Use CSS custom properties (`var(--primary)`, `var(--text-color)`)
- **Typography:** Use established type scale (`var(--heading-font-size-xl)`)
- **Shadows:** Often need adjustment for web vs design tools
- **Borders and radius:** May need to match existing design system values

**When designs don't match existing patterns:**
- Prefer consistency with existing codebase over pixel-perfect match
- Document why you deviated from the design
- Discuss with designer/user if significant differences are needed

## Example Workflows

### Example 1: Tooltip Modification (This Interaction)

**Scenario:** Screenshot shows tooltip should have a callout pointer

**Process:**
1. ✅ Analyzed visual: Tooltip with angled callout pointer
2. ✅ Identified pattern: Shared tooltip component, not block-specific
3. ✅ Determined approach: Modify shared CSS (Option C)
4. ✅ Implemented: Added pseudo-elements to create pointer
5. ✅ Iterated: Refined based on feedback (size, position, border)
6. ✅ Validated: Visual match confirmed

**Result:** Modified `styles/share.css` to add dialog-style pointer

### Example 2: New Hero Block

**Scenario:** Screenshot shows hero section with video background and centered text

**Process:**
1. Analyze visual: Full-width video, overlay text, centered layout
2. Identify components: Hero block (standalone)
3. Search existing: Found similar hero block without video
4. Determine approach: Create new variant or new block?
   - Decision: New block (significantly different functionality)
5. Invoke content-driven-development skill
6. CDD handles: Content model, implementation, testing

**Result:** New hero-video block created with proper content model

### Example 3: Card Grid Update

**Scenario:** Screenshot shows card grid with new styling

**Process:**
1. Analyze visual: Same layout, new spacing, shadows, hover effects
2. Identify components: Existing cards block
3. Determine approach: Modify existing block CSS (Option A)
4. Search patterns: Check other card-style blocks for inspiration
5. Implement: Update `blocks/cards/cards.css`
6. Validate: Test across all pages using cards block

**Result:** Updated cards block matches new design

## Tips for Success

**Do:**
- Always analyze the full design before starting implementation
- Search for existing patterns before building from scratch
- Start with CSS changes when possible (lower risk)
- Test responsive behavior thoroughly
- Consider accessibility from the start
- Document your decisions

**Don't:**
- Jump straight to implementation without analysis
- Recreate patterns that already exist in the codebase
- Make global changes without testing impact
- Ignore responsive design requirements
- Forget about interactive states (hover, focus, etc.)
- Skip validation against the original design

## Integration with Other Skills

This skill acts as an entry point and coordinator:

**Receives:** Visual designs, screenshots, mockups
**Analyzes:** Design patterns, components, requirements
**Coordinates:** Calls other skills based on needs
**Returns:** Implemented design matching visual reference

**Common skill flows:**

```
Visual Design → This Skill → Block Collection (search) → Modify Existing
Visual Design → This Skill → Content Modeling → Building Blocks → Testing
Visual Design → This Skill → CDD (full workflow)
Visual Design → This Skill → Direct CSS modification
```

## Key Takeaways

1. **Always start with analysis** - understand before implementing
2. **Reuse existing patterns** - don't reinvent the wheel
3. **Choose the right approach** - modify vs create vs shared styles
4. **Validate visually** - compare implementation to design
5. **Consider all viewports** - responsive design is critical
6. **Document decisions** - especially deviations from design

Visual design to implementation is as much about understanding existing patterns as it is about building new ones. Take time to analyze and search before you build.
