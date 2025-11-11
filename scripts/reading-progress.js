function handleReadingProgress() {
  const progressBar = document.querySelector('.progress-bar');
  if (!progressBar) {
    return;
  }

  const totalHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (window.pageYOffset / totalHeight) * 100;
  progressBar.style.width = `${progress}%`;
}

function handleBackToTopButton() {
  const backToTopButton = document.getElementById('back-to-top');
  if (!backToTopButton) {
    return;
  }

  if (window.pageYOffset > window.innerHeight) {
    backToTopButton.style.display = 'block';
  } else {
    backToTopButton.style.display = 'none';
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initReadingProgress() {
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressContainer.append(progressBar);
  document.body.prepend(progressContainer);

  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'back-to-top';
  backToTopButton.textContent = '↑';
  backToTopButton.setAttribute('aria-label', 'Back to top');
  backToTopButton.addEventListener('click', scrollToTop);
  document.body.append(backToTopButton);

  window.addEventListener('scroll', () => {
    handleReadingProgress();
    handleBackToTopButton();
  });
}

initReadingProgress();
