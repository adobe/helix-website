## Hero

Notes:

##### Custom Classes 
|  Class | Function   |  
|--------|------------|
| N/A |  Default Home Hero: text in center, image at bottom, colorful checkerboard pattern background |  
| side-by-side | 50% detail, 50% image in same row  |  
| square-image | image will become 1:1 in aspect ratio  |  
| mutiple-cta  | decorate multiple cta buttons with black border styles (ul a) |
| page-not-found | page not found ui |

#### Example:

See Live output (Link):
https://redesign-hero-and-logo-wall--helix-website--adobe.hlx.page/drafts/redesign/blocks/hero 
TBC: https://website-redesign--helix-website--adobe.hlx.page/drafts/redesign/blocks/hero 

#### Content Structure:

See Content in Document (Link):
https://docs.google.com/document/d/1LfT3loAme82XIWhWAUOaWK1aPP42XzZ1GVjwHYtk0Zc/edit#

#### Code:
- Background Image: display image from 1st table row as cover. If no image provided, it will fallback to default grey checkerboard background
- Text Content from 2nd table row
    - h1 -> heading
    - a -> cta-button
    - p -> description
    - ul list with multiple <a> elements -> cta button list (need to use with .multple-cta on block)
- Content Image from 3rd table row

[Decoration Code](hero.js)

The CSS Styling is very project specific and gets adjusted as needed for a project or block by block.

[Styling Code](hero.css)