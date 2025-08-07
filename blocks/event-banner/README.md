## Event Banner

Event banner block designed to showcase major events like Adobe Developers Live. Features a dramatic black background with colorful mesh graphics, red geometric elements, and prominent call-to-action.

#### Custom Classes 
|  Class | Function   |  
|--------|------------|
| N/A | Default Event Banner Layout |  

#### Example:

The event banner is designed to display:
- Adobe logo (automatically added)
- Event title (large heading)
- Event subtitle/description
- Event details (date, location)
- Call-to-action button

#### Content Structure:

Create a simple table in your authoring tool with the following structure:

```
| Event Banner |
|-------------|
| # Developers Live |
| Adobe Experience Manager and Adobe Commerce |
| Join us in San Jose starting November 10, 2025 |
| [Register](https://developerevents.adobe.com/events/details/adobe-developer-events-developer-experience-presents-reg-test/) |
```

The block expects content in this order:
1. **Main Heading** (h1) - Event title like "Developers Live"
2. **Subtitle** (p) - Event description like "Adobe Experience Manager and Adobe Commerce"
3. **Event Details** (p) - Date and location information
4. **CTA Button** (a) - Registration or information link

**Important**: The Adobe logo is automatically added by the JavaScript - no need to include it in your content.

#### Code:

The block automatically:
- Adds the Adobe logo at the top
- Applies proper styling to headings and paragraphs
- Styles the button with the design system
- Adds UTM parameter tracking to the registration button
- Sets button ID to "DevLiveRegButton" for analytics
- Creates the layered background with red rectangle and mesh graphics

[Decoration Code](event-banner.js)

The CSS includes:
- Black background with layered graphic elements
- Responsive typography scaling
- Button hover effects
- SVG background graphics

[Styling Code](event-banner.css)

#### Background Graphics:

The block creates layered background effects using pure CSS:
- **Black base background** - Solid black foundation
- **Red geometric shape** - CSS clip-path creates angled rectangle
- **Colorful mesh gradients** - CSS conic gradients with blur effects for the flowing mesh patterns

No SVG files are needed - everything is generated with CSS for better performance and control.
