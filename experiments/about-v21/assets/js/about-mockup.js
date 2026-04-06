document.querySelectorAll('.nav-links a[href="/experiments/about-v21/about-mockup.html"], .mobile-menu a[href="/experiments/about-v21/about-mockup.html"], .nav-links a[href="about.html"], .mobile-menu a[href="about.html"]').forEach(link => {
  link.setAttribute('aria-current', 'page');
});

document.querySelectorAll('.media-card video').forEach(video => {
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }
});
