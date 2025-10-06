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
  // Calculate scroll amount based on card width + gap
  // Each scroll should show approximately 3-4 cards
  const cardWidth = 250;
  const gap = 20;
  const cardsToScroll = 3;
  const scrollAmount = (cardWidth + gap) * cardsToScroll;

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
  // Initial check
  updateNavButtons();
  // Also check after a short delay to ensure carousel is fully rendered
  setTimeout(updateNavButtons, 100);
}

export default async function decorate(block) {
  // Get the content div (first div in block, standard pattern)
  const content = block.querySelector('div');
  if (!content) return;

  // Extract heading - look for first text that's not a link
  let headingText = 'Meet your creative heroes.';
  const paragraphs = content.querySelectorAll('p');
  
  paragraphs.forEach((p) => {
    if (!p.querySelector('a') && !headingText.includes('creative heroes')) {
      return; // already found
    }
    if (!p.querySelector('a')) {
      headingText = p.textContent.trim();
    }
  });

  // Extract API URL
  let apiUrl = '';
  const links = content.querySelectorAll('a');
  links.forEach((link) => {
    if (link.href.includes('developerevents.adobe.com')) {
      apiUrl = link.href;
    }
  });

  // Extract CTA link (any link that's not the API URL)
  let ctaHtml = '';
  links.forEach((link) => {
    if (!link.href.includes('developerevents.adobe.com')) {
      const ctaText = link.textContent.trim();
      const ctaHref = link.href;
      ctaHtml = `<a href="${ctaHref}" class="cta-button">${ctaText}</a>`;
    }
  });

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

  // Add navigation buttons
  const { prevButton, nextButton } = createCarouselNav();
  carouselWrapper.appendChild(prevButton);
  carouselWrapper.appendChild(carousel);
  carouselWrapper.appendChild(nextButton);

  block.appendChild(carouselWrapper);

  // Add CTA if present
  if (ctaHtml) {
    const ctaContainer = document.createElement('div');
    ctaContainer.innerHTML = ctaHtml;
    block.appendChild(ctaContainer);
  }

  // Fetch speakers from API or use mock data
  if (apiUrl) {
    try {
      // Add loading indicator
      carousel.innerHTML = '<p style="padding: 40px; text-align: center;">Loading speakers...</p>';

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const speakers = data.speakers || [];

      // Clear loading indicator
      carousel.innerHTML = '';

      if (speakers.length === 0) {
        carousel.innerHTML = '<p style="padding: 40px; text-align: center;">No speakers available yet.</p>';
        return;
      }

      // Add speaker cards from API data
      speakers.forEach((speaker) => {
        const card = createSpeakerCard(speaker);
        carousel.appendChild(card);
      });

      // Setup navigation after speakers are loaded
      setupCarouselNavigation(carousel, prevButton, nextButton);
    } catch (error) {
      console.error('Error fetching speakers:', error);
      // Fall back to mock data on error
      carousel.innerHTML = '';
      MOCK_SPEAKERS.forEach((speaker) => {
        const card = createSpeakerCard(speaker);
        carousel.appendChild(card);
      });
      setupCarouselNavigation(carousel, prevButton, nextButton);
    }
  } else {
    // No API URL provided, use mock data
    MOCK_SPEAKERS.forEach((speaker) => {
      const card = createSpeakerCard(speaker);
      carousel.appendChild(card);
    });
    setupCarouselNavigation(carousel, prevButton, nextButton);
  }
}

