// Vercel Web Analytics, plain-HTML setup: no bundler here, so no npm import.
// The script only exists on Vercel deployments; it 404s locally.
window.va =
  window.va ||
  function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

const script = document.createElement('script');
script.defer = true;
script.src = '/_vercel/insights/script.js';
document.head.appendChild(script);
