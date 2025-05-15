i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: true,
    backend: {
      loadPath: 'locales/{{lng}}/translation.json',
    },
  }, function (err, t) {
    if (err) return console.error('i18next init failed', err);
    updateContent();
  });

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
}

function changeLanguage(lng) {
  i18next.changeLanguage(lng, () => updateContent());
}
