import {
  loadScript, getMetadata, cleanVariations, getENVbyPath,
} from '../../scripts/scripts.js';
import { getEnv } from '../../utils/env.js';
import createTag from '../../utils/tag.js';
import { changeTag } from '../../utils/helpers.js';

// adobe icon
const BRAND_IMG = '<img loading="lazy" alt="Adobe" width="25" height="22.12" src="/blocks/header/adobe-logo.svg">';
const ICON_ROOT = '/img';
const BRAND_LOGO = '<img loading="lazy" alt="Adobe" width="27" height="27" src="/blocks/header/adobe-franklin-logo.png">';
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
</svg>`;
const IS_OPEN = 'is-open';
const MENU_ICON_COLOR_PATTERN = [
  ['lightgreen', 'pink', 'purple'],
  ['black', 'black', 'black', 'black'],
];

class Gnav {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.env = getEnv();
    this.desktop = window.matchMedia('(min-width: 1200px)');
  }

  init = () => {
    this.state = {};
    this.curtain = createTag('div', { class: 'gnav-curtain' });
    const nav = createTag('nav', { class: 'gnav' });

    const mobileToggle = this.decorateToggle(nav);
    nav.append(mobileToggle);

    const brand = this.decorateBrand();
    if (brand) {
      nav.append(brand);
    }

    const mainNav = this.decorateMainNav();
    if (mainNav) {
      nav.append(mainNav);
    }

    const profile = this.decorateProfile();
    if (profile) {
      nav.append(profile);
    }

    const logo = this.decorateLogo();
    if (logo) {
      nav.append(logo);
    }

    const enableSearch = getMetadata('enable-search');
    if (!enableSearch || enableSearch !== 'no') {
      const div = createTag('div', { class: 'search' });
      div.innerHTML = '<p>Search</p>';
      this.body.append(div);

      this.search = this.decorateSearch();
      if (this.search) {
        nav.append(this.search);
      }
    }

    const wrapper = createTag('div', { class: 'gnav-wrapper' }, nav);
    this.el.append(this.curtain, wrapper);
  };

  decorateBrand = () => {
    const brandBlock = this.body.querySelector('.gnav-brand');
    if (!brandBlock) return null;
    const brand = brandBlock.querySelector('a');
    brand.classList.add('gnav-brand');
    if (brandBlock.classList.contains('with-logo')) {
      brand.insertAdjacentHTML('afterbegin', BRAND_IMG);
    }
    return brand;
  };

  decorateLogo = () => {
    const logo = this.body.querySelector('.adobe-logo a');
    logo.classList.add('gnav-logo');
    logo.setAttribute('aria-label', logo.textContent);
    logo.textContent = '';
    logo.insertAdjacentHTML('afterbegin', BRAND_IMG);
    return logo;
  };

  decorateMainNav = () => {
    const mainLinks = this.body.querySelectorAll('h2 > a');
    if (mainLinks.length > 0) {
      return this.buildMainNav(mainLinks);
    }
    return null;
  };

  buildMainNav = (navLinks) => {
    const mainNav = createTag('div', { class: 'gnav-mainnav' });
    navLinks.forEach((navLink, idx) => {
      const navItem = createTag('div', { class: 'gnav-navitem' });

      const menu = navLink.closest('div');
      menu.querySelector('h2').remove();
      navItem.appendChild(navLink);

      if (menu.childElementCount > 0) {
        const id = `navmenu-${idx}`;
        menu.id = id;
        navItem.classList.add('has-menu');
        navLink.setAttribute('role', 'button');
        navLink.setAttribute('aria-expanded', false);
        navLink.setAttribute('aria-controls', id);

        const decoratedMenu = this.decorateMenu(navItem, navLink, menu);
        navItem.appendChild(decoratedMenu);
      }
      mainNav.appendChild(navItem);
    });
    return mainNav;
  };

  decorateMenu = (navItem, navLink, menu) => {
    menu.className = 'gnav-navitem-menu';
    const childCount = menu.childElementCount;
    if (childCount === 1) {
      menu.classList.add('small-Variant');
    } else if (childCount === 2) {
      menu.classList.add('medium-variant');
    } else if (childCount >= 3) {
      menu.classList.add('large-Variant');
      const container = createTag('div', { class: 'gnav-menu-container' });
      container.append(...Array.from(menu.children));
      menu.append(container);
    }
    navLink.addEventListener('focus', () => {
      window.addEventListener('keydown', this.toggleOnSpace);
    });
    navLink.addEventListener('blur', () => {
      window.removeEventListener('keydown', this.toggleOnSpace);
    });
    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu(navItem);
    });
    return menu;
  };

  // TODO: note: new header functions listed below, can cleanup old function after migration
  // the above function could be removed after migration, keep functions below this line
  initHeader = () => {
    this.state = {};
    this.curtain = createTag('div', { class: 'gnav-curtain' });
    const nav = createTag('nav', { class: 'gnav' });

    // whole mobile menu toggle
    const mobileToggle = this.decorateToggle(nav);
    nav.append(mobileToggle);

    const brand = this.decorateBrandLogo();
    if (brand) {
      nav.append(brand);
    }

    const ctaButtonWrapper = this.decorateCTAButton();
    const mobileCTAButton = ctaButtonWrapper.cloneNode(true);
    ctaButtonWrapper.classList.add('desktop');
    if (ctaButtonWrapper) {
      nav.append(ctaButtonWrapper);
    }

    const mainNav = this.decorateHeaderMainNav();
    mobileCTAButton.classList.add('mobile');
    mainNav.append(mobileCTAButton);
    if (mainNav) {
      nav.append(mainNav);
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

    const enableSearch = getMetadata('enable-search');
    if (!enableSearch || enableSearch !== 'no') {
      const div = createTag('div', { class: 'search' });
      div.innerHTML = '<p>Search</p>';
      this.body.append(div);

      this.search = this.decorateSearch();
      if (this.search) {
        nav.append(this.search);
      }
    }

    // used `franklin` to separate the styles
    const wrapper = createTag('div', { class: 'gnav-wrapper franklin' }, nav);
    this.el.append(this.curtain, wrapper);
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
      if (nav.classList.contains(IS_OPEN)) {
        nav.classList.remove(IS_OPEN);
        this.curtain.classList.remove(IS_OPEN);
        this.desktop.removeEventListener('change', onMediaChange);
      } else {
        nav.classList.add(IS_OPEN);
        this.desktop.addEventListener('change', onMediaChange);
        this.curtain.classList.add(IS_OPEN);
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
    brand.classList.add('gnav-brand');
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
        navMainLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMenu(navItem);
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
  decorateIcon(spanElement) {
    const icon = spanElement.classList[1].substring(5);
    const imgSrc = `${ICON_ROOT}/${icon}.png`;
    const image = document.createElement('img');
    image.src = imgSrc;
    spanElement.appendChild(image);
  }

  decorateHeaderSubMenu = (subMenuWrapper, index, navLinkTitle, navMainLink) => {
    const currentColorPattern = MENU_ICON_COLOR_PATTERN[index];
    const newSubMenuWrapper = createTag('div', { class: 'submenu-content' }, '');

    // add a info div if there's description <p/>
    if (subMenuWrapper.querySelector('p')) {
      const infoDiv = createTag('div', { class: 'navmenu-info' }, '');
      const infoTitle = createTag('h3', {}, navLinkTitle);
      const infoDescription = subMenuWrapper.querySelector('p');
      const infoImage = subMenuWrapper.querySelector('img');
      infoDiv.addEventListener('click', () => {
        window.location.href = navMainLink.href;
      });
      infoDiv.append(infoTitle, infoDescription, infoImage);
      newSubMenuWrapper.append(infoDiv);
    }

    // create submenu divs based on ul
    const subMenuList = subMenuWrapper.querySelector('ul');
    const subMenuListItems = subMenuList.querySelectorAll(':scope > li');
    subMenuListItems.forEach((item, idx) => {
      const submenuLink = item.querySelector('a');
      const submenuTitleText = submenuLink.textContent;
      submenuLink.classList.add('submenu');
      submenuLink.innerHTML = '';

      const submenuIcon = item.querySelector('span.icon');
      if (submenuIcon) {
        // TODO: find out why svg is not auto rendering
        this.decorateIcon(submenuIcon);

        const iconWrapper = createTag('div', {
          class: `icon-wrapper colored-tag circle ${currentColorPattern[idx]}`,
        }, '');
        iconWrapper.append(submenuIcon);
        submenuLink.append(iconWrapper);
      }

      const title = createTag('h3', {}, submenuTitleText);
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

      // add active status to main link
      const navUrlObject = new URL(submenuLink.href);
      if (window.location.pathname.includes(navUrlObject.pathname)) {
        navMainLink.classList.add('active');
      }

      newSubMenuWrapper.append(submenuLink);
    });

    return newSubMenuWrapper;
  };

  // right side cta button
  decorateCTAButton = () => {
    const ctaButton = this.body.querySelector('.adobe-cta a');
    ctaButton.classList.add('gnav-cta-button');
    ctaButton.setAttribute('aria-label', ctaButton.textContent);
    const ctaText = ctaButton.textContent;
    const ctaTextWrapper = createTag('span', { }, ctaText);

    ctaButton.innerHTML = '';
    ctaButton.append(ctaTextWrapper);
    const ctaButtonWrapper = createTag('div', { class: 'gnav-cta-button-wrapper' }, ctaButton);
    return ctaButtonWrapper;
  };

  // search on mobile menu
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
    this.state.openMenu.classList.remove(IS_OPEN);
    document.removeEventListener('click', this.closeOnDocClick);
    window.removeEventListener('keydown', this.closeOnEscape);
    const menuToggle = this.state.openMenu.querySelector('[aria-expanded]');
    menuToggle.setAttribute('aria-expanded', false);
    this.curtain.classList.remove(IS_OPEN);
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

  // TODO: for adobe.com login status purposes, to be confirmed with adobe team if that's working
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
  const ENV = getENVbyPath();
  let html = '';

  // TODO: need to update the logic when move over to production
  if (ENV === 'redesign') {
    const url = '/drafts/redesign/new-nav';
    html = await fetchGnav(url);
  } else {
    const url = getMetadata('gnav') || '/gnav';
    html = await fetchGnav(url);
  }
  // console.log(html);

  if (html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      cleanVariations(doc);
      const gnav = new Gnav(doc.body, blockEl);

      // TODO: need to update the logic when move over to production
      if (ENV === 'redesign') {
        gnav.initHeader();
      } else {
        // original header
        gnav.init();
      }
    } catch (e) {
      const { debug } = await import('../../utils/console.js');
      if (debug) {
        debug('Could not great global navigation', e);
      }
    }
  }
}
