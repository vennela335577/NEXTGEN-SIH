function normalizeTopic(topic) {
  return topic
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeLanguage(language) {
  return language
    .toLowerCase()
    .trim();
}

module.exports = {
  normalizeTopic,
  normalizeLanguage
};