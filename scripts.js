const LIVE_DOMAIN = 'https://www.hlx.live';

export const config = {
    blocks: {
        'header': {
            location: '/blocks/header/',
            scripts: 'header.js',
            styles: 'header.css',
        },
        '.marquee': {
            location: '/blocks/marquee/',
            scripts: 'marquee.js',
        },
        '.feature-list': {
            location: '/blocks/feature-list/',
            styles: 'feature-list.css',
        },
        '.get-started': {
            location: '/blocks/get-started/',
            styles: 'get-started.css',
        },
        '.z-pattern': {
            location: '/blocks/z-pattern/',
            styles: 'z-pattern.css',
            scripts: 'z-pattern.js',
        },
        '.fragment': {
            location: '/blocks/fragment/',
            scripts: 'fragment.js',
        },
        '.sidekick-generator': {
            location: '/blocks/sidekick/',
            scripts: 'generator.js',
            styles: 'generator.css',
        },
        '.service-status': {
            lazy: true,
            location: '/blocks/service-status/',
            scripts: 'service-status.js',
            styles: 'service-status.css',
        },
        'a[href^="https://www.youtube.com"]': {
            lazy: true,
            location: '/blocks/embed/',
            styles: 'youtube.css',
            scripts: 'youtube.js',
        },
        'a[href^="https://gist.github.com"]': {
            lazy: true,
            location: '/blocks/embed/',
            styles: 'gist.css',
            scripts: 'gist.js',
        },
    },
    templates: {
        'docs': {
            location: '/templates/docs/',
            styles: 'docs.css',
            class: 'docs-template',
        }
    },
};

export function getCurrentDomain(location) {
    const { protocol, hostname, port } = location || window.location;
    const domain = `${protocol}//${hostname}`;
    return port ? `${domain}:${port}` : domain;
}

export function setDomain(anchor, currentDomain) {
    const { href, textContent } = anchor;
    if (!href.includes(LIVE_DOMAIN)) return href;
    anchor.href = href.replace(LIVE_DOMAIN, currentDomain);
    anchor.textContent = textContent.replace(LIVE_DOMAIN, currentDomain);
};

export function setSVG(anchor) {
    const { href, textContent } = anchor;
    const ext = textContent.substr(textContent.lastIndexOf('.') + 1);
    if (ext !== 'svg') return;
    const img = document.createElement('img');
    img.src = textContent;
    if (textContent === href ) {
        anchor.parentElement.append(img);
        anchor.remove();
    } else {
        anchor.textContent = '';
        anchor.append(img);
    }
}

export function decorateAnchors(element) {
    const anchors = element.getElementsByTagName('a');
    const currentDomain = getCurrentDomain();
    return Array.from(anchors).map((anchor) => {
        setDomain(anchor, currentDomain);
        setSVG(anchor);
        return anchor;
    });
}

export function getMetadata(name) {
    const meta = document.head.querySelector(`meta[name="${name}"]`);
    return meta && meta.content;
};

export function loadScript(url, callback, type) {
    const script = document.createElement('script');
    script.onload = callback;
    script.setAttribute('src', url);
    if (type) { script.setAttribute('type', type); }
    document.head.append(script);
    return script;
}

export async function loadStyle(url, onLoad) {
    const duplicate = document.head.querySelector(`link[href^="${url}"]`);
    if (duplicate) {
        if (onLoad) { onLoad(); }
        return duplicate;
    }
    const element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('href', url);
    if (onLoad) {
        element.addEventListener('load', onLoad);
    }
    document.querySelector('head').appendChild(element);
    return element;
}

/**
 * Clean up variant classes
 * Ex: marquee--small--contained- -> marquee small contained
 * @param {HTMLElement} parent
 */
export function cleanVariations(parent) {
    const variantBlocks = parent.querySelectorAll('[class$="-"]');
    return Array.from(variantBlocks).map((variant) => {
        const { className } = variant;
        const classNameClipped = className.slice(0, -1);
        variant.classList.remove(className);
        const classNames = classNameClipped.split('--');
        variant.classList.add(...classNames);
        return variant;
    });
}

export function loadTemplate(config) {
    if (!config.templates) return;
    const template = getMetadata('template');
    if (!template) return;
    const templateConf = config.templates[template];
    if (!templateConf) return;
    document.body.classList.add('has-Template');
    if (templateConf.class) {
        document.body.classList.add(templateConf.class);
    }
    if (templateConf.styles) {
        loadStyle(`${templateConf.location}${templateConf.styles}`);
    }
}

export function decorateBlocks(element) {
    const isDoc = element instanceof Document;
    const parent = isDoc ? document.body : element;
    cleanVariations(parent);

    const bls = Object.keys(config.blocks).reduce((decoratedBlocks, block) => {
        const elements = parent.querySelectorAll(block);
        elements.forEach((el) => {
            el.setAttribute('data-block-select', block);
            decoratedBlocks.push(el);
        });
        return decoratedBlocks;
    }, []);
    return bls;
}

async function initJs(element, block) {
    if (!block.module) {
        block.module = await import(`${block.location}${block.scripts}`);
    }
    // If this block type has scripts and they're already imported
    if (block.module) {
        block.module.default(element);
    }
};

/**
 * Load each element
 * @param {HTMLElement} element
 */
export async function loadElement(element, blockConf) {
    if (blockConf) {
        if (blockConf.scripts) {
            await initJs(element, blockConf);
        }
        if (blockConf.styles) {
            loadStyle(`${blockConf.location}${blockConf.styles}`, () => {
                blockConf.loaded = true;
                element.classList.add('is-Loaded');
            });
        } else {
            blockConf.loaded = true;
            element.classList.add('is-Loaded');
        }
    }
    return element;
};

export async function loadBlocks(blocks, config) {
    /**
     * Iterate through all entries to determine if they are intersecting.
     * @param {IntersectionObserverEntry} entries
     * @param {IntersectionObserver} observer
     */
    const onIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const { blockSelect } = entry.target.dataset;
                const blockConf = config.blocks[blockSelect];
                observer.unobserve(entry.target);
                loadElement(entry.target, blockConf);
            }
        });
    };

    const options = { rootMargin: config.lazyMargin || '1600px 0px' };
    const observer = new IntersectionObserver(onIntersection, options);
    return await Promise.all(blocks.map(async (block) => {
        const { blockSelect } = block.dataset;
        const blockConf = config.blocks[blockSelect];
        if (blockConf?.lazy) {
            observer.observe(block);
        } else {
            return await loadElement(block, blockConf);
        }
    }));
}

function postLCP(type) { window[type] = true; }

export function setLCPTrigger(lcp) {
    if (lcp) {
        if (lcp.complete) { postLCP('lcpComplete'); return; }
        lcp.addEventListener('load', () => { postLCP('lcpLoad'); });
        lcp.addEventListener('error', () => { postLCP('lcpError'); });
        return;
    }
    postLCP('noLcp');
}
decorateAnchors(document);
loadTemplate(config);
const blocks = decorateBlocks(document);
loadBlocks(blocks, config);
const lcp = document.querySelector('img');
setLCPTrigger(lcp);