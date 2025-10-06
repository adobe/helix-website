// Mock data for initial styling (will be replaced with API fetch)
const MOCK_SPEAKERS = [
  {
    first_name: 'James',
    last_name: 'Gunn',
    title: 'Award-winning Filmmaker and Co-Chair and CEO',
    company: 'DC Studios',
    picture: {
      thumbnail_url: 'https://via.placeholder.com/400x500/333/fff?text=James+Gunn',
    },
  },
  {
    first_name: 'Yuko',
    last_name: 'Shimizu',
    title: 'Illustrator and Educator',
    company: '',
    picture: {
      thumbnail_url: 'https://via.placeholder.com/400x500/666/fff?text=Yuko+Shimizu',
    },
  },
  {
    first_name: 'Allan',
    last_name: 'Peters',
    title: 'Partner and Chief Creative Officer',
    company: 'Peters Design Company',
    picture: {
      thumbnail_url: 'https://via.placeholder.com/400x500/999/fff?text=Allan+Peters',
    },
  },
  {
    first_name: 'Serwah',
    last_name: 'Attafuah',
    title: 'Multidisciplinary Artist and Musician',
    company: 'Wrath Studios',
    picture: {
      thumbnail_url: 'https://via.placeholder.com/400x500/ccc/000?text=Serwah+Attafuah',
    },
  },
  {
    first_name: 'Johnny',
    last_name: 'Harris',
    title: 'Journalist & Co-Founder',
    company: 'News Company',
    picture: {
      thumbnail_url: 'https://via.placeholder.com/400x500/555/fff?text=Johnny+Harris',
    },
  },
];

function createSpeakerCard(speaker) {
  const card = document.createElement('div');
  card.className = 'speaker-card';

  const name = `${speaker.first_name} ${speaker.last_name}`;
  const titleCompany = speaker.company
    ? `${speaker.title}, ${speaker.company}`
    : speaker.title;
  const imageUrl = speaker.picture?.thumbnail_url || speaker.picture?.url || '';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}" loading="lazy">
    <div class="speaker-info">
      <h3 class="speaker-name">${name}</h3>
      <p class="speaker-title">${titleCompany}</p>
    </div>
  `;

  return card;
}

function createCarouselNav() {
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav prev';
  prevButton.setAttribute('aria-label', 'Previous speakers');
  prevButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  `;

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav next';
  nextButton.setAttribute('aria-label', 'Next speakers');
  nextButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;

  return { prevButton, nextButton };
}

function setupCarouselNavigation(carousel, prevButton, nextButton) {
  const scrollAmount = 300;

  prevButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Update button states based on scroll position
  function updateNavButtons() {
    const isAtStart = carousel.scrollLeft <= 0;
    const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;

    prevButton.disabled = isAtStart;
    nextButton.disabled = isAtEnd;
  }

  carousel.addEventListener('scroll', updateNavButtons);
  updateNavButtons();
}

export default async function decorate(block) {
  // Get the content row (everything after block name)
  const content = block.children[0]?.querySelector('div');
  if (!content) return;

  // Extract heading (first h1-h6 or first paragraph)
  let headingText = 'Meet your creative heroes.';
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    headingText = heading.textContent.trim();
    heading.remove();
  } else {
    const firstP = content.querySelector('p');
    if (firstP && !firstP.querySelector('a')) {
      headingText = firstP.textContent.trim();
      firstP.remove();
    }
  }

  // Extract API URL (look for a link or plain text URL)
  let apiUrl = '';
  const apiLink = content.querySelector('a[href*="developerevents.adobe.com"]');
  if (apiLink) {
    apiUrl = apiLink.href;
  } else {
    // Look for URL in text content
    const textContent = content.textContent;
    const urlMatch = textContent.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      apiUrl = urlMatch[0];
    }
  }

  // Extract CTA link (any remaining link)
  const ctaLink = content.querySelector('a:not([href*="developerevents.adobe.com"])');
  let ctaHtml = '';
  if (ctaLink) {
    const ctaText = ctaLink.textContent.trim();
    const ctaHref = ctaLink.href;
    ctaHtml = `<a href="${ctaHref}" class="cta-button">${ctaText}</a>`;
  }

  // Clear the block
  block.innerHTML = '';

  // Create heading
  const heading = document.createElement('h2');
  heading.textContent = headingText;
  block.appendChild(heading);

  // Create carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'speakers-carousel-wrapper';

  // Create carousel
  const carousel = document.createElement('div');
  carousel.className = 'speakers-carousel';

  // Add speaker cards (using mock data for now)
  MOCK_SPEAKERS.forEach((speaker) => {
    const card = createSpeakerCard(speaker);
    carousel.appendChild(card);
  });

  // Add navigation buttons
  const { prevButton, nextButton } = createCarouselNav();
  carouselWrapper.appendChild(prevButton);
  carouselWrapper.appendChild(carousel);
  carouselWrapper.appendChild(nextButton);

  block.appendChild(carouselWrapper);

  // Setup navigation
  setupCarouselNavigation(carousel, prevButton, nextButton);

  // Add CTA if present
  if (ctaHtml) {
    const ctaContainer = document.createElement('div');
    ctaContainer.innerHTML = ctaHtml;
    block.appendChild(ctaContainer);
  }

  // Log API URL for future use
  if (apiUrl) {
    console.log('API URL for future implementation:', apiUrl);
  }
}

