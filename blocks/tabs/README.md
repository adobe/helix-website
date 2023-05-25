## Tabs

Notes:

##### Custom Classes 
|  Class | Function   |  
|--------|------------|
| N/A |  Default tabs |  
| image-based | Support image in top tablist |

#### Example:

See Live output:
Tabs (.image-based) Link:
https://redesign-tabs-and-marquee--helix-website--adobe.hlx.page/drafts/redesign/blocks/customer-stories-tabs-marquee 
TBC: https://website-redesign--helix-website--adobe.hlx.page/drafts/redesign/blocks/customer-stories-tabs-marquee

#### Content Structure:

See Content in Document (Link):
https://docs.google.com/document/d/1_I1mwiaSk0CG-wikoknyjKPqEIjGmJMWINdJ8omKQBE/edit#heading=h.9p0k02gwynj6

#### Code For Marquee in Testimonial format:
- Image in unordered list in google doc -> Image in tab list
- Tabs content are grouped using `---` and `section-metadata` block where `style` in `section-metadata` will need to be `Tab ${index}` 

[Decoration Code](tabs.js)

The CSS Styling is very project specific and gets adjusted as needed for a project or block by block.

[Styling Code](tabs.css)