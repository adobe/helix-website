## Z Pattern

Notes:

##### Custom Classes 
|  Class | Function   |  
|--------|------------|
|  wide-text  |  Used for a more prominent text split.  |  
|  spacing-lg |  Used to increase the spacing between rows. |  
|  value-props | Used to add global classes `.icon-eyebrow` and `.main-headline`, and `colored-tag` with color class for props styling. |
|  right-first |  Default is left-side content first, with this class applied the pattern should begin with right-side content first |

#### Example:

See Live output (Link)

#### Content Structure:

See Content in Document (Link)

#### Code:
Z Patten is styled in the block CSS code.

There is Javascript code for decoration purposes primarily to alternate the layout of even and odd rows. 

- Left Side: Image
- Right Side: Content

z-pattern.value-props:
- Left Side: Image
- Right Side: Content
    - p (first p tag) -> .icon-eyebrow
    - h3 -> .main-headline
    - ul -> li  
        - bolded text -> .colored-tag with colors
        - other text in li -> .colored-tag-description

[Decoration Code](z-pattern.js)

The CSS Styling is very project specific and gets adjusted as needed for a project or block by block.

[Styling Code](z-pattern.css)
