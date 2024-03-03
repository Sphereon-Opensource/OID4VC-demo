import * as path from 'path'

const readLocaleFile = (locale: string) => {
  return require(path.join(__dirname, `../../public/locales/development/${locale}/translation.json`))
}

const collectKeys = (obj: any, prefix: string = '') => {
  let keys: string[] = []
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...collectKeys(obj[key], `${prefix}${key}.`)]
    } else {
      keys.push(`${prefix}${key}`)
    }
  }
  return keys
}

const compareTranslationKeys = (baseLocale: string, otherLocales: string[]) => {
  const baseKeys = new Set(collectKeys(readLocaleFile(baseLocale)))
  otherLocales.forEach((locale) => {
    const localeKeys = new Set(collectKeys(readLocaleFile(locale)))
    const missingKeys = [...baseKeys].filter((x) => !localeKeys.has(x))
    const extraKeys = [...localeKeys].filter((x) => !baseKeys.has(x))

    if (missingKeys.length > 0) {
      throw new Error(`Keys missing in locale "${locale}": ${missingKeys}`)
    }
    if (extraKeys.length > 0) {
      throw new Error(`Extra keys in locale "${locale}": ${extraKeys}`)
    }
  })
}

const runComparisons = () => {
  const baseLocale = 'en'
  const otherLocales = ['nl']
  compareTranslationKeys(baseLocale, otherLocales)
}

runComparisons()

module.exports = {
  runComparisons
}