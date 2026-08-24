import i18next, { type PostProcessorModule } from 'i18next'

import got_latn from './locales/got_latn'
import got_goth from './locales/got_goth'

import { fromLatin } from '@/transliterate'

const mainNs = 'ns1'
const resources = {
  'got-Goth': { ns1: got_goth },
  'got-Latn': { ns1: got_latn }
} as const

/*
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof mainNs;
    resources: typeof resources['got-Latn'];
  }
}
*/

const GothicTransliterator: PostProcessorModule = {
  type: 'postProcessor',
  name: 'gothicTransliterator',
  process: function(value, key, options, translator)
  {
    if (typeof options.lng === 'undefined'
      && translator.language == 'got-Goth')
    {
      const tl = i18next.t(key, {...options, lng: 'got-Latn'})
      if (tl) return fromLatin(tl)
    }
    return value
  }
}

i18next
  .use(GothicTransliterator)
  .init(
{
  lng: 'got-Goth',
  fallbackLng: {
    'got-Gofth': ['got-Latn']
  },
  ns: [mainNs],
  resources,
  postProcess: ['gothicTransliterator'],
  returnedObjectHandler: function(_key, value, options)
  {
    return value[options.context]
  }
})

export default function getI18n()
{
  return i18next
}
