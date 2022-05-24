// TODO: FIX!!
// eslint-disable-next-line import/named
import { createEl, getHelixEnv } from '../../scripts/scripts.js';

function decorateEmail(email) {
  const MAX_CHAR = 12;
  const emailParts = email.split('@');
  const username = emailParts[0].length <= MAX_CHAR ? emailParts[0] : `${emailParts[0].slice(0, MAX_CHAR)}…`;
  const domainArr = emailParts[1].split('.');
  const tld = domainArr.pop();
  let domain = domainArr.join('.');
  domain = domain.length <= MAX_CHAR ? domain : `${domain.slice(0, MAX_CHAR)}…`;
  return `${username}@${domain}.${tld}`;
}

function decorateProfileLink(href, service) {
  const env = getHelixEnv();
  if (env.name === 'prod') return href;
  const url = new URL(href);
  url.hostname = env[service];
  return url.href;
}

function decorateProfileMenu(blockEl, profileEl, profiles, toggle) {
  const { displayName, email } = profiles.ims;
  const { user, sections } = profiles.io;
  const { avatar } = user;

  const displayEmail = decorateEmail(email);
  const avatarImg = createEl({ tag: 'img', className: 'gnav-profile-img', attributes: { src: avatar } });
  const accountLink = blockEl.querySelector('div > div > p:nth-child(2) a');

  const profileButton = createEl({
    tag: 'button',
    className: 'gnav-profile-button',
    html: avatarImg,
    attributes: {
      'aria-label': displayName,
      'aria-expanded': false,
      'aria-controls': 'gnav-profile-menu',
    },
  });
  profileButton.addEventListener('click', () => { toggle(profileEl); });

  const profileMenu = createEl({ tag: 'div', id: 'gnav-profile-menu', className: 'gnav-profile-menu' });
  const profileHeader = createEl({ tag: 'a', className: 'gnav-profile-header' });
  const profileDetails = createEl({ tag: 'div', className: 'gnav-profile-details' });
  const profileActions = createEl({ tag: 'ul', className: 'gnav-profile-actions' });

  profileHeader.href = decorateProfileLink(accountLink.href, 'account');
  profileHeader.setAttribute('aria-label', accountLink.textContent);

  const profileImg = avatarImg.cloneNode(true);
  const profileName = createEl({ tag: 'p', className: 'gnav-profile-name', html: displayName });
  const profileEmail = createEl({ tag: 'p', className: 'gnav-profile-email', html: displayEmail });
  const accountText = blockEl.querySelector('div > div > p:nth-child(2) a').innerHTML;
  const profileViewAccount = createEl({ tag: 'p', className: 'gnav-profile-account', html: accountText });
  profileDetails.append(profileName, profileEmail, profileViewAccount);

  if (sections.manage.items.team?.id) {
    const teamLink = blockEl.querySelector('div > div > p:nth-child(3) a');
    teamLink.href = decorateProfileLink(teamLink.href, 'adminconsole');
    const manageTeam = createEl({ tag: 'li', html: teamLink, className: 'gnav-profile-action' });
    profileActions.append(manageTeam);
  }

  if (sections.manage.items.enterprise?.id) {
    const manageLink = blockEl.querySelector('div > div > p:nth-child(4) a');
    manageLink.href = decorateProfileLink(manageLink.href, 'adminconsole');
    const manageEnt = createEl({ tag: 'li', html: manageLink, className: 'gnav-profile-action' });
    profileActions.append(manageEnt);
  }

  const signOutLink = blockEl.querySelector('div > div > p:nth-child(5) a');
  signOutLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.adobeIMS.signOut();
  });
  const signOut = createEl({ tag: 'li', html: signOutLink, className: 'gnav-profile-action' });
  profileActions.append(signOut);

  profileHeader.append(profileImg, profileDetails);
  profileMenu.append(profileHeader, profileActions);
  profileEl.append(profileButton, profileMenu);
}

export default async function getProfile(blockEl, profileEl, toggle, ioResp) {
  const profiles = {};
  profiles.ims = await window.adobeIMS.getProfile();
  profiles.io = await ioResp.json();
  decorateProfileMenu(blockEl, profileEl, profiles, toggle);
}
