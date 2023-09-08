import { loadScript, getMetadata } from '../../scripts/lib-franklin.js';
import { cleanVariations } from '../../scripts/scripts.js';
import { getEnv } from '../../utils/env.js';
import createTag from '../../utils/tag.js';
import { changeTag, returnLinkTarget } from '../../utils/helpers.js';

const ICON_ROOT = '/img';
const BRAND_LOGO = '<img loading="lazy" alt="Adobe" width="27" height="27" src="/blocks/header/adobe-franklin-logo.svg">';
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5
16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z">
</path>
</svg>`;
const IS_OPEN = 'is-open';
const MENU_ICON_COLOR_PATTERN = [
  ['lightgreen', 'pink', 'purple'],
  ['black', 'black', 'black', 'black'],
];
const DESKTOP_BREAKPOINT = 1200;

class Gnav {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.env = getEnv();
    this.desktop = window.matchMedia('(min-width: 1200px)');
  }

  initHeader = () => {
    this.state = {};
    this.curtain = createTag('div', { class: 'gnav-curtain' });
    const nav = createTag('nav', { class: 'gnav' });

    // whole mobile menu toggle
    const mobileToggle = this.decorateToggle(nav);
    nav.append(mobileToggle);

    const brand = this.decorateBrandLogo();
    if (brand) {
      const brandWrapper = createTag('div', { class: 'gnav-brand-wrapper' });
      brandWrapper.append(brand);
      nav.append(brandWrapper);
    }

    const ctaButtonWrapper = this.decorateCTAButton();
    const mobileCTAButton = ctaButtonWrapper.cloneNode(true);

    const mainNav = this.decorateHeaderMainNav();
    mobileCTAButton.classList.add('mobile');
    mainNav.append(mobileCTAButton);
    if (mainNav) {
      nav.append(mainNav);
    }

    ctaButtonWrapper.classList.add('desktop');
    if (ctaButtonWrapper) {
      nav.append(ctaButtonWrapper);
    }

    // TODO: kept this for now as unsure about its purpose
    // tbc implement this in redesign if confirmed as neeede
    const profile = this.decorateProfile();
    const profileWrapper = createTag('div', { class: 'profile' }, '');
    if (profile) {
      profileWrapper.append(profile);
      nav.append(profileWrapper);
    } else {
      nav.append(profileWrapper);
    }
    // above keeping ends

    // disabled search as not in desktop design
    const enableSearch = getMetadata('enable-search');
    if (!enableSearch || enableSearch !== 'no') {
      const div = createTag('div', { class: 'search' });
      div.innerHTML = '<p>Search</p>';
      this.body.append(div);

      this.search = this.decorateSearch();
      if (this.search) {
        const mainNavWrapper = nav.querySelector('.gnav-mainnav');
        mainNavWrapper.classList.add('with-search');
        nav.append(this.search);
      }
    }

    // empty div in nav-menu grid to close mobile menu
    // when clicked on curtain area
    const mobileCurtainArea = createTag('div', { class: 'mobile-curtain-area' });
    mobileCurtainArea.addEventListener('click', () => {
      mobileToggle.click();
    });
    nav.append(mobileCurtainArea);

    // used `franklin` to separate the styles
    const wrapper = createTag('div', { class: 'gnav-wrapper franklin' }, nav);
    this.el.append(this.curtain, wrapper);

    window.addEventListener('resize', this.resizeContent);
  };

  decorateToggle = (nav) => {
    const toggle = createTag('button', { class: 'gnav-toggle', 'aria-label': 'Navigation menu', 'aria-expanded': false });
    const onMediaChange = (e) => {
      if (e.matches) {
        nav.classList.remove(IS_OPEN);
        this.curtain.classList.remove(IS_OPEN);
      }
    };
    toggle.addEventListener('click', async () => {
      const searchInput = document.querySelector('.gnav-search-input');
      if (nav.classList.contains(IS_OPEN)) {
        nav.classList.remove(IS_OPEN);
        this.curtain.classList.remove(IS_OPEN);
        this.desktop.removeEventListener('change', onMediaChange);
        if (searchInput) this.clearSearchInput(searchInput);
      } else {
        nav.classList.add(IS_OPEN);
        this.desktop.addEventListener('change', onMediaChange);
        this.curtain.classList.add(IS_OPEN);

        // disabled search on mobile
        if (this.search) { this.loadSearch(); }
      }
    });
    return toggle;
  };

  // left logo + brand name
  decorateBrandLogo = () => {
    const brandBlock = this.body.querySelector('.gnav-brand');
    if (!brandBlock) return null;

    const brand = brandBlock.querySelector('a');
    brand.classList.add('gnav-brand', 'link-highlight-colorful-effect-hover-wrapper');
    brand.innerHTML = `<span class="link-highlight-colorful-effect">${brand.textContent}</span>`;

    if (brandBlock.classList.contains('with-logo')) {
      brand.insertAdjacentHTML('afterbegin', BRAND_LOGO);
    }
    return brand;
  };

  decorateHeaderMainNav = () => {
    const mainNavWrapper = this.body.querySelector('div:nth-child(2)');
    const mainNavLinkWrappers = mainNavWrapper.querySelectorAll('h2');

    if (mainNavLinkWrappers.length === 0) {
      return null;
    }

    const mainNav = createTag('div', { class: 'gnav-mainnav' });

    mainNavLinkWrappers.forEach((linkWrapper, index) => {
      const navItem = createTag('div', { class: 'gnav-navitem' });
      const navMainLink = linkWrapper.querySelector('a');
      const navMainLinkText = navMainLink.textContent ? navMainLink.textContent : '';

      const subMenuWrapper = createTag('div', { class: 'submenu-wrapper' });
      let nextSibling = linkWrapper.nextElementSibling;

      while (nextSibling && nextSibling.tagName !== 'H2') {
        subMenuWrapper.appendChild(nextSibling.cloneNode(true));
        nextSibling = nextSibling.nextElementSibling;
      }

      if (subMenuWrapper.childElementCount > 0) {
        // toggle submenu logic
        const id = `navmenu-${index}`;
        subMenuWrapper.id = id;
        navItem.classList.add('has-menu');
        navMainLink.setAttribute('role', 'button');
        navMainLink.setAttribute('aria-expanded', false);
        navMainLink.setAttribute('aria-controls', id);
        navMainLink.setAttribute('aria-label', `${navMainLink.textContent} Submenu`);
        // navMainLink.setAttribute('tabindex', 1);
        navMainLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMenu(navItem);
        });
        // for keyboard navigation accessibility
        navMainLink.addEventListener('focus', () => {
          window.addEventListener('keydown', this.toggleOnSpace);
        });
        navMainLink.addEventListener('blur', () => {
          window.removeEventListener('keydown', this.toggleOnSpace);
        });

        // reorganize submenu items
        // eslint-disable-next-line max-len
        const decoratedSubMenu = this.decorateHeaderSubMenu(subMenuWrapper, index, navMainLinkText, navMainLink);
        subMenuWrapper.innerHTML = '';
        subMenuWrapper.append(decoratedSubMenu);
      }

      navItem.append(navMainLink, subMenuWrapper);
      mainNav.append(navItem);
    });

    return mainNav;
  };

  // NOTE: decorate svg not available in header, using .png directly instead
  // eslint-disable-next-line class-methods-use-this
  decorateIcon(spanElement, altText = '') {
    const icon = spanElement.classList[1].substring(5);
    const imgSrc = `${ICON_ROOT}/${icon}.png`;
    const image = document.createElement('img');
    image.src = imgSrc;
    image.alt = altText;
    image.classList.add('bounce-item-effect');
    spanElement.appendChild(image);
  }

  decorateHeaderSubMenu = (subMenuWrapper, index, navLinkTitle, navMainLink) => {
    const currentColorPattern = MENU_ICON_COLOR_PATTERN[index];
    const newSubMenuWrapper = createTag('div', { class: 'submenu-content' }, '');

    // add a info div if there's description <p/>
    if (subMenuWrapper.querySelector('p')) {
      const infoDiv = createTag('a', {
        class: 'navmenu-info link-highlight-colorful-effect-hover-wrapper',
        href: navMainLink.href,
        target: returnLinkTarget(navMainLink.href),
      }, '');
      const infoTitle = createTag('h3', { class: 'link-highlight-colorful-effect' }, navLinkTitle);
      const infoDescription = subMenuWrapper.querySelector('p');
      const infoImage = subMenuWrapper.querySelector('img');
      infoDiv.append(infoTitle, infoDescription, infoImage);
      newSubMenuWrapper.append(infoDiv);
    }

    // create submenu divs based on ul
    const subMenuList = subMenuWrapper.querySelector('ul');
    const subMenuListItems = subMenuList.querySelectorAll(':scope > li');
    subMenuListItems.forEach((item, idx) => {
      const submenuLink = item.querySelector('a');
      const submenuTitleText = submenuLink.textContent;
      submenuLink.classList.add('submenu', 'link-highlight-colorful-effect-hover-wrapper', 'bounce-item-effect-hover-wrapper');
      submenuLink.innerHTML = '';
      submenuLink.setAttribute('target', returnLinkTarget(submenuLink.href));

      const submenuIcon = item.querySelector('span.icon');
      if (submenuIcon) {
        this.decorateIcon(submenuIcon, submenuTitleText);
        const iconWrapper = createTag('div', {
          class: `icon-wrapper colored-tag circle ${currentColorPattern[idx]}`,
        }, '');
        iconWrapper.append(submenuIcon);
        submenuLink.append(iconWrapper);
      }

      const title = createTag('h3', { class: 'link-highlight-colorful-effect submenu-title' }, submenuTitleText);
      submenuLink.append(title);

      const submenuDescription = item.querySelector('li');
      if (submenuDescription) {
        const description = changeTag(submenuDescription, 'p', '');
        submenuLink.append(description);
      }

      // close menu on click
      submenuLink.addEventListener('click', () => {
        const navbar = document.querySelector('.gnav');
        navbar.classList.remove(IS_OPEN);
        this.closeMenu();
      });

      const removeTrailingSlash = (url) => url.replace(/\/$/, '');

      // add active status to main link
      const navUrlObject = new URL(submenuLink.href);
      const currentPathWithoutTrailingSlash = removeTrailingSlash(window.location.pathname);
      const linkPathWithoutTrailingSlash = removeTrailingSlash(navUrlObject.pathname);
      if (currentPathWithoutTrailingSlash === linkPathWithoutTrailingSlash) {
        navMainLink.classList.add('active');
      }

      newSubMenuWrapper.append(submenuLink);
    });

    return newSubMenuWrapper;
  };

  // right side cta button
  decorateCTAButton = () => {
    const ctaButton = this.body.querySelector('.adobe-cta a');
    ctaButton.classList.add('gnav-cta-button', 'button');
    ctaButton.setAttribute('aria-label', ctaButton.textContent);
    const ctaText = ctaButton.textContent;
    const ctaTextWrapper = createTag('span', { }, ctaText);

    ctaButton.innerHTML = '';
    ctaButton.append(ctaTextWrapper);
    const ctaButtonWrapper = createTag('div', { class: 'gnav-cta-button-wrapper' }, ctaButton);
    return ctaButtonWrapper;
  };

  // search on mobile menu (Disabled for now)
  decorateSearch = () => {
    const searchBlock = this.body.querySelector('.search');
    if (searchBlock) {
      const label = searchBlock.querySelector('p').textContent;
      const searchEl = createTag('div', { class: 'gnav-search' });
      const searchBar = this.decorateSearchBar(label);
      const searchButton = createTag(
        'button',
        {
          class: 'gnav-search-button',
          'aria-label': label,
          'aria-expanded': false,
          'aria-controls': 'gnav-search-bar',
        },
        SEARCH_ICON,
      );
      searchButton.addEventListener('click', () => {
        this.loadSearch(searchEl);
        this.toggleMenu(searchEl);
      });
      searchEl.append(searchButton, searchBar);
      return searchEl;
    }
    return null;
  };

  decorateSearchBar = (label) => {
    const searchBar = createTag('aside', { id: 'gnav-search-bar', class: 'gnav-search-bar' });
    const searchField = createTag('div', { class: 'gnav-search-field' }, SEARCH_ICON);
    const searchInput = createTag('input', { class: 'gnav-search-input', placeholder: label });
    const searchResults = createTag('div', { class: 'gnav-search-results' });

    const clearButton = createTag('button', { class: 'clear-results-button' }, '✕');
    clearButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.clearSearchInput(searchInput);
    });
    searchField.append(clearButton);

    searchInput.addEventListener('input', (e) => {
      this.onSearchInput(e.target.value, searchResults);
    });

    searchField.append(searchInput);
    searchBar.append(searchField, searchResults);
    return searchBar;
  };

  loadSearch = async () => {
    if (this.onSearchInput) return;
    const gnavSearch = await import('./gnav-search.js');
    this.onSearchInput = gnavSearch.default;
  };

  /**
   * Toggles menus when clicked directly
   * @param {HTMLElement} el the element to check
   */
  toggleMenu = (el) => {
    const isSearch = el.classList.contains('gnav-search');
    const sameMenu = el === this.state.openMenu;
    if (this.state.openMenu) {
      this.closeMenu();
    }
    if (!sameMenu) {
      this.openMenu(el, isSearch);
    }
  };

  closeMenu = () => {
    const nav = this.el.querySelector('.gnav');
    this.state.openMenu.classList.remove(IS_OPEN);
    document.removeEventListener('click', this.closeOnDocClick);
    window.removeEventListener('keydown', this.closeOnEscape);
    const menuToggle = this.state.openMenu.querySelector('[aria-expanded]');
    menuToggle.setAttribute('aria-expanded', false);

    // only close curtain if the main menu is closed
    if (!nav.classList.contains(IS_OPEN)) {
      this.curtain.classList.remove(IS_OPEN);
    }
    this.state.openMenu = null;
  };

  openMenu = (el, isSearch) => {
    el.classList.add(IS_OPEN);

    const menuToggle = el.querySelector('[aria-expanded]');
    menuToggle.setAttribute('aria-expanded', true);

    document.addEventListener('click', this.closeOnDocClick);
    window.addEventListener('keydown', this.closeOnEscape);
    if (!isSearch) {
      this.curtain.classList.add(IS_OPEN);
      const desktop = window.matchMedia('(min-width: 1200px)');
      if (desktop.matches) {
        document.addEventListener('scroll', this.closeOnScroll, { passive: true });
      }
    } else {
      this.curtain.classList.add(IS_OPEN);
      el.querySelector('.gnav-search-input').focus();
    }
    this.state.openMenu = el;
  };

  toggleOnSpace = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      const parentEl = e.target.closest('.has-menu');
      this.toggleMenu(parentEl);
    }
  };

  closeOnScroll = () => {
    let scrolled;
    if (!scrolled) {
      if (this.state.openMenu) {
        this.toggleMenu(this.state.openMenu);
      }
      scrolled = true;
      document.removeEventListener('scroll', this.closeOnScroll);
    }
  };

  closeOnDocClick = (e) => {
    const closest = e.target.closest(`.${IS_OPEN}`);
    const isCurtain = e.target === this.curtain;
    if ((this.state.openMenu && !closest) || isCurtain) {
      this.toggleMenu(this.state.openMenu);
    }
  };

  closeOnEscape = (e) => {
    if (e.code === 'Escape') {
      this.toggleMenu(this.state.openMenu);
    }
  };

  resizeContent = () => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      const openedMenu = this.el.querySelector('.gnav-navitem.is-open');
      if (openedMenu) {
        const mainLink = openedMenu.querySelector('a');
        mainLink.click();
      }
    }
  };

  // eslint-disable-next-line
  clearSearchInput = (searchInput) => {
    searchInput.value = '';
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    searchInput.dispatchEvent(inputEvent);
  };

  // TODO: for adobe.com login status purposes, out of working scope,
  // will need Adobe team's help on this to function properly
  decorateProfile = () => {
    const blockEl = this.body.querySelector('.profile');
    if (!blockEl) return null;
    const profileEl = createTag('div', { class: 'gnav-profile' });

    window.adobeid = {
      client_id: 'bizweb',
      scope: 'AdobeID,openid,gnav',
      locale: 'en_US',
      autoValidateToken: true,
      environment: this.env.ims,
      useLocalStorage: false,
      onReady: () => { this.imsReady(blockEl, profileEl); },
    };
    loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');

    return profileEl;
  };

  imsReady = async (blockEl, profileEl) => {
    const accessToken = window.adobeIMS.getAccessToken();
    if (accessToken) {
      const ioResp = await fetch(`https://${this.env.adobeIO}/profile`, {
        headers: new Headers({ Authorization: `Bearer ${accessToken.token}` }),
      });
      if (ioResp.status === 200) {
        const profile = await import('./gnav-profile.js');
        profile.default(blockEl, profileEl, this.toggleMenu, ioResp);
      } else {
        this.decorateSignIn(blockEl, profileEl);
      }
    } else {
      this.decorateSignIn(blockEl, profileEl);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  decorateSignIn = (blockEl, profileEl) => {
    const signIn = blockEl.querySelector('a');
    signIn.classList.add('gnav-signin');
    profileEl.append(signIn);
    profileEl.addEventListener('click', (e) => {
      e.preventDefault();
      window.adobeIMS.signIn();
    });
  };
  // TODO: above comment ends
}

async function fetchGnav(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  return html;
}

export default async function init(blockEl) {
  // OLD CODE: const url = getMetadata('gnav') || '/gnav';
  const url = '/new-nav';
  const html = await fetchGnav(url);

  if (html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      cleanVariations(doc);
      const gnav = new Gnav(doc.body, blockEl);
      gnav.initHeader();
    } catch (e) {
      const { debug } = await import('../../utils/console.js');
      if (debug) {
        debug('Could not great global navigation', e);
      }
    }
  }
}
