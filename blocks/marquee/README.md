## Marquee

Notes:

##### Custom Classes 
|  Class | Function   |  
|--------|------------|
| N/A |  Default Marquee |  
| landscape-image | Turn image in image-side into 4:3 |
| testimonial | Turn Marquee into testimonial layout |  

#### Example:

See Live output:

Marquee (testimonial) Link:
https://redesign-tabs-and-marquee--helix-website--adobe.hlx.page/drafts/redesign/blocks/customer-stories-tabs-marquee 
TBC: https://website-redesign--helix-website--adobe.hlx.page/drafts/redesign/blocks/customer-stories-tabs-marquee

#### Content Structure:

See Content in Document (Link):
https://docs.google.com/document/d/1_I1mwiaSk0CG-wikoknyjKPqEIjGmJMWINdJ8omKQBE/edit#heading=h.9p0k02gwynj6

#### Code For Marquee in Testimonial format:
- Background Image: 1st row from table
- Side Image: any column in 2nd row without headings
- Detail: any column in 2nd row with headings
    - h4 -> testimonial description
    - image -> avatar icon
    - h5 ->  name + position (italic)
    - link -> button
    - nested unordered list -> for statistics

[Decoration Code](marquee.js)

The CSS Styling is very project specific and gets adjusted as needed for a project or block by block.

[Styling Code](marquee.css)