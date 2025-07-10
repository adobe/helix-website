import createTag from '../../utils/tag.js';
import Mustache from './mustache.js';

// HTML encode function for safe content rendering
function encode(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper to render a JSON node as nested divs
function renderJsonNodeToString(key, value) {
  // Basic sanitization for class name: replace invalid characters
  const className = String(key).replace(/[^a-zA-Z0-9-_]/g, '-') || 'item';

  let content = '';
  if (value === null || typeof value !== 'object') {
    // Primitive value (string, number, boolean, null)
    content = encode(String(value));
  } else if (Array.isArray(value)) {
    // Array value
    content = value.map((item) => renderJsonNodeToString('item', item)).join('\n');
  } else {
    // Object value
    content = Object.entries(value)
      .map(([nestedKey, nestedValue]) => renderJsonNodeToString(nestedKey, nestedValue))
      .join('\n');
  }

  return `<div class="${className}">${content}</div>`;
}

function jsonToHtmlDivs(jsonData) {
  if (jsonData === null || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
    // Handle non-objects or arrays at the top level
    // Optionally log: console.warn("Input is not a JSON object, wrapping in a 'root' div.");
    return renderJsonNodeToString('root', jsonData);
  }
  // Process top-level object properties
  return Object.entries(jsonData)
    .map(([key, value]) => renderJsonNodeToString(key, value))
    .join('\n');
}

// Default JSON data with comprehensive structure
const defaultJsonData = {
  title: 'Mustache Template Demo',
  description: 'A comprehensive demonstration of Mustache.js features',
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'en',
    },
  },
  posts: [
    {
      id: 1,
      title: 'First Post',
      content: 'This is the first post content.',
      tags: ['javascript', 'mustache'],
      published: true,
      comments: [
        { author: 'Alice', text: 'Great post!' },
        { author: 'Bob', text: 'Very helpful.' },
      ],
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is the second post content.',
      tags: ['html', 'css'],
      published: false,
      comments: [],
    },
  ],
  categories: ['Technology', 'Programming', 'Web Development'],
  metadata: {
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    version: '1.0.0',
  },
  emptyArray: [],
  nullValue: null,
  falseValue: false,
  zeroValue: 0,
};

// Comprehensive Mustache template demonstrating all features
const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <meta name="keywords" content="{{#categories}}{{.}}, {{/categories}}mustache, template">
    <meta name="author" content="{{user.name}}">
</head>
<body>
    <header></header>
    <main>
        <!-- Basic variable interpolation -->
        <section>
            <h2>User Information</h2>
            <p>Name: {{user.name}}</p>
            <p>Email: {{user.email}}</p>
            <p>Age: {{user.age}}</p>
            <p>Active: {{user.isActive}}</p>
            
            <!-- Nested object access -->
            <h3>Preferences</h3>
            <p>Theme: {{user.preferences.theme}}</p>
            <p>Language: {{user.preferences.language}}</p>
        </section>

        <!-- Section (if value exists and is truthy) -->
        <section>
            <h2>Published Posts</h2>
            {{#posts}}
                {{#published}}
                    <article>
                        <h3>{{title}}</h3>
                        <p>{{content}}</p>
                        <p>ID: {{id}}</p>
                        
                        <!-- Array iteration -->
                        <div class="tags">
                            <strong>Tags:</strong>
                            {{#tags}}
                                <span class="tag">{{.}}</span>
                            {{/tags}}
                        </div>

                        <!-- Nested section with comments -->
                        {{#comments}}
                            <div class="comment">
                                <strong>{{author}}:</strong> {{text}}
                            </div>
                        {{/comments}}
                        
                        <!-- Inverted section (if no comments) -->
                        {{^comments}}
                            <p><em>No comments yet.</em></p>
                        {{/comments}}
                    </article>
                {{/published}}
            {{/posts}}
        </section>

        <!-- Inverted section (if no published posts) -->
        {{^posts}}
            <p>No posts available.</p>
        {{/posts}}

        <!-- Array iteration with index -->
        <section>
            <h2>Categories</h2>
            <ul>
                {{#categories}}
                    <li>{{.}}</li>
                {{/categories}}
            </ul>
        </section>

        <!-- Handling empty arrays -->
        <section>
            <h2>Empty Array Test</h2>
            {{#emptyArray}}
                <p>This should not appear</p>
            {{/emptyArray}}
            {{^emptyArray}}
                <p>Array is empty (inverted section works!)</p>
            {{/emptyArray}}
        </section>

        <!-- Handling null values -->
        <section>
            <h2>Null Value Test</h2>
            {{#nullValue}}
                <p>This should not appear (null is falsy)</p>
            {{/nullValue}}
            {{^nullValue}}
                <p>Value is null (inverted section works!)</p>
            {{/nullValue}}
        </section>

        <!-- Handling boolean false -->
        <section>
            <h2>Boolean Test</h2>
            {{#falseValue}}
                <p>This should not appear (false is falsy)</p>
            {{/falseValue}}
            {{^falseValue}}
                <p>Value is false (inverted section works!)</p>
            {{/falseValue}}
        </section>

        <!-- Handling zero (truthy in Mustache) -->
        <section>
            <h2>Zero Value Test</h2>
            {{#zeroValue}}
                <p>Zero is truthy in Mustache: {{zeroValue}}</p>
            {{/zeroValue}}
        </section>

        <!-- Metadata section -->
        <section>
            <h2>Metadata</h2>
            {{#metadata}}
                <p>Created: {{createdAt}}</p>
                <p>Updated: {{updatedAt}}</p>
                <p>Version: {{version}}</p>
            {{/metadata}}
        </section>
    </main>
    <footer></footer>
</body>
</html>`;

export default function decorate(block) {
  // Create the main container
  const container = createTag('div', { class: 'json2html-simulator' });

  // Create input section
  const inputSection = createTag('div', { class: 'input-section' });

  // JSON input
  const jsonSection = createTag('div', { class: 'json-section' });
  const jsonLabel = createTag('label', { for: 'json-input' }, 'JSON Data:');
  const jsonTextarea = createTag('textarea', {
    id: 'json-input',
    placeholder: 'Enter your JSON data here...\nExample:\n{\n  "title": "John Doe",\n  "description": "A sample user.",\n  "age": 30,\n  "skills": ["JavaScript", "HTML", "CSS"]\n}',
  });

  // Add preset button for JSON
  const jsonPresetButton = createTag('button', {
    class: 'preset-btn json-preset',
    type: 'button',
  }, 'Load Demo JSON');

  jsonSection.append(jsonLabel, jsonTextarea, jsonPresetButton);

  // Template input
  const templateSection = createTag('div', { class: 'template-section' });
  const templateLabel = createTag('label', { for: 'template-input' }, 'Mustache Template (optional):');
  const templateTextarea = createTag('textarea', {
    id: 'template-input',
    placeholder: 'Enter your Mustache template here...\nExample:\n<h1>Hello {{title}}!</h1>\n<p>{{description}}</p>',
  });

  // Add preset button for template
  const templatePresetButton = createTag('button', {
    class: 'preset-btn template-preset',
    type: 'button',
  }, 'Load Demo Template');

  templateSection.append(templateLabel, templateTextarea, templatePresetButton);

  // Process button
  const processButton = createTag('button', {
    class: 'process-btn',
    type: 'button',
  }, 'Generate HTML');

  inputSection.append(jsonSection, templateSection, processButton);

  // Create output section
  const outputSection = createTag('div', { class: 'output-section' });
  const outputLabel = createTag('label', {}, 'Generated HTML:');
  const outputContainer = createTag('div', { class: 'output-container' });
  const outputPreview = createTag('div', { class: 'output-preview' });
  const outputCode = createTag('pre', { class: 'output-code' });

  outputContainer.append(outputPreview, outputCode);
  outputSection.append(outputLabel, outputContainer);

  // Add everything to container
  container.append(inputSection, outputSection);

  // Clear the block and add our content
  block.innerHTML = '';
  block.append(container);

  // Add event listeners for preset buttons
  jsonPresetButton.addEventListener('click', () => {
    jsonTextarea.value = JSON.stringify(defaultJsonData, null, 2);
    processButton.click();
  });

  templatePresetButton.addEventListener('click', () => {
    templateTextarea.value = defaultTemplate;
    processButton.click();
  });

  // Add event listener for process button
  processButton.addEventListener('click', () => {
    const jsonInput = jsonTextarea.value.trim();
    const templateInput = templateTextarea.value.trim();

    if (!jsonInput) {
      outputPreview.innerHTML = '<div class="error">Please enter JSON data</div>';
      outputCode.textContent = '';
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      let htmlOutput = '';
      let codeOutput = '';

      if (templateInput) {
        // Use template
        htmlOutput = Mustache.render(templateInput, jsonData);
        codeOutput = htmlOutput;
      } else {
        // Semantic HTML output
        const jsonLdData = {
          '@context': {
            '@vocab': 'https://schema.org/',
            values: {
              '@container': '@list',
            },
          },
          ...jsonData,
        };
        const defaultHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>${jsonData.title || 'Title'}</title>
    <meta name="description" content="${jsonData.description || ''}">
    <script type="application/ld+json">
${JSON.stringify(jsonLdData, null, 2)}
    </script>
  </head>
  <body>
    <header></header>
    <main>
      <div>
        <div>
          ${jsonData.title ? `<h1>${jsonData.title}</h1>` : ''}
          ${jsonToHtmlDivs(jsonData)}
        </div>
      </div>
    </main>
    <footer></footer>
  </body>
</html>`;
        htmlOutput = defaultHtml;
        codeOutput = defaultHtml;
      }

      outputPreview.innerHTML = htmlOutput;
      outputCode.textContent = codeOutput;
    } catch (error) {
      outputPreview.innerHTML = `<div class="error">Invalid JSON: ${error.message}</div>`;
      outputCode.textContent = '';
    }
  });

  // Add real-time preview on input change
  let debounceTimer;
  const debounce = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
  };

  const updatePreview = () => {
    processButton.click();
  };

  jsonTextarea.addEventListener('input', () => debounce(updatePreview, 500));
  templateTextarea.addEventListener('input', () => debounce(updatePreview, 500));
}
