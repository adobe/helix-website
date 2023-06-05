## Footer

Notes:

##### Custom Classes 
|  Class | Function   |  
|--------|------------|
| N/A |  Default Footer |  

#### Example:

See Live output:
https://redesign-new-footer--helix-website--adobe.hlx.page/drafts/redesign/new-home

#### Content Structure:

See Content in Document (Link):
https://docs.google.com/document/d/1Qr26pZVperklcaRuErsE1qZ1ebl1lL6tNodMN28SdEU/edit

- the new footer styles are now shown based on the path in the url. When migrate, we'll need to update the code and release the logic to global
- the styles are handled separately in mobile vs desktop, where there's one div for mobile version, and another div for desktop version.

top section (wrapped by <hr/> in document):
- h3 -> heading link
- ul -> sublinks under the heading link
- link in bolded -> cta button, which only shows on desktop only

bottom section (wrapped by <hr/> in document:
- p -> copyright text, separate lines on mobile, same line on desktop

Animation styles
- from global class: `.link-underline-effect`

[Decoration Code](footer.js)

The CSS Styling is very project specific and gets adjusted as needed for a project or block by block.

[Styling Code](footer.css)