const fs = require('fs');

const enTranslations = JSON.parse(fs.readFileSync('public/locales/development/en/translation.json', 'utf8'));
const nlTranslations = JSON.parse(fs.readFileSync('public/locales/development/nl/translation.json', 'utf8'));
const enKeys = Object.keys(enTranslations);
const nlKeys = Object.keys(nlTranslations);

const missingInDutch = enKeys.filter(key => !nlKeys.includes(key));
const missingInEnglish = nlKeys.filter(key => !enKeys.includes(key));

console.log("Missing in Dutch:", missingInDutch);
console.log("Missing in English:", missingInEnglish);