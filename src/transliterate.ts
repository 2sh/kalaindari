type Mapping = [string, string]
type Replacer = ((substring: string, ...args: any[]) => string)
type RegExpMapping =
  [RegExp, string | Replacer]
  | Mapping

import regExpEscape from 'regexp.escape'

const gothicLatin: Mapping[] = [
  ['𐌹̈', 'ï'],
  ['𐌰', 'a'],
  ['𐌱', 'b'],
  ['𐌲', 'g'],
  ['𐌳', 'd'],
  ['𐌴', 'e'],
  ['𐌵', 'q'],
  ['𐌶', 'z'],
  ['𐌷', 'h'],
  ['𐌸', 'þ'],
  ['𐌹', 'i'],
  ['𐌺', 'k'],
  ['𐌻', 'l'],
  ['𐌼', 'm'],
  ['𐌽', 'n'],
  ['𐌾', 'j'],
  ['𐌿', 'u'],
  ['𐍀', 'p'],
  ['𐍁', 'Ϙ'],
  ['𐍂', 'r'],
  ['𐍃', 's'],
  ['𐍄', 't'],
  ['𐍅', 'w'],
  ['𐍆', 'f'],
  ['𐍇', 'x'],
  ['𐍈', 'ƕ'],
  ['𐍉', 'o'],
  ['𐍊', 'Ϡ']
]

const latinGothic: Mapping[] = [
  ['v', '𐌱'],
  ['c', '𐌺'],
  ['y', '𐍅'],
  ['ᛏ', '𐍊'],
  ['Ͳ', '𐍊'],
  ['Ϥ', '𐍁'],

  ...gothicLatin.map(m => [m[1], m[0]] satisfies Mapping)
]

const latinGothicDiacritics: Mapping[] = [
  ['ā', 'a'],
  ['í', 'i'],
  ['á', 'a'],
  ['ú', 'u'],
  ['ē', 'e'],
  ['ē', 'o'],
  ['ū', 'u'],
]

const diaeresis: RegExpMapping[] = [
  [/(?<=(?:\s|^))([i𐌹])/gui, '$1\u0308'],
  [/(?<=[^\s][aiueo𐌰𐌹𐌿𐌴𐍉])([i𐌹])(?=(?:dd|𐌳𐌳|drei|𐌳𐍂𐌴𐌹|bn|𐌱𐌽))/gui, '$1\u0308'],
  [/(?<=(?:\s|^)(?:faura|𐍆𐌰𐌿𐍂𐌰|ufar|𐌿𐍆𐌰𐍂|mi[cþ]|𐌼𐌹𐌸))([i𐌹])(?=(?:st?|𐍃𐍄?|m|𐌼)(\s|$))/gui, '$1\u0308'],
  [/(?<=(?:fra|𐍆𐍂𐌰))([i𐌹])(?=(?:t|𐍄))/gui, '$1\u0308'],
]

function removeDiacriticChars(text: string)
{
  return text.replace(/(?!·)\p{Diacritic}(?<![i𐌹]\u0308)/gui, "")
}

function removeSuperfluousDiacriticChars(text: string)
{
  return text
    .replace(/([eo𐌴𐍉])\u0304/gui, "$1")
    .replace(/([a𐌰][iu𐌹𐌿])\u0301(?=[h𐌷r𐍂v𐍈])/gui, "$1")
    .replace(/([a𐌰])\u0301([iu𐌹𐌿])(?![h𐌷r𐍂v𐍈])/gui, "$1$2")
}

function applyMapping(text: string, mapping: RegExpMapping[])
{
  return mapping.reduce((text, [from, to]) =>
  {
    // @ts-ignore it's complaining about 'to' being two different types
    return text.replaceAll(from, to)
  }, text)
}


const gothicDigits = `𐌰𐌱𐌲𐌳𐌴𐌵𐌶𐌷𐌸𐌹𐌺𐌻𐌼𐌽𐌾𐌿𐍀𐍁𐍂𐍃𐍄𐍅𐍆𐍇𐍈𐍉𐍊`
const gothicDigitsArray = [...gothicDigits]

export type GothicNumeralsConfig = {
  millions_separator?: string,
  thousands_sign?: string,
}

export function toGothicNumerals(number: number | bigint | string, config?: GothicNumeralsConfig)
{
  const conf: Required<GothicNumeralsConfig> = {
    millions_separator: ':',
    thousands_sign: '͵',
    ...config,
  }

  const num = typeof number === 'string'
    ? number
    : number.toLocaleString('fullwide', {useGrouping:false})
  const digits = num
    .replace(/[,. _']/g, '') // thou group sep
    .replace(/^0+/, '')
    .split('')
    .toReversed()
  const gDigits = []
  for (let i=0; i<digits.length; i++)
  {
    const n = parseInt(digits[i]!)
    if (isNaN(n)) return null
    let out = ''
    if (n > 0)
    {
      if ((i % 6) > 2) out += conf.thousands_sign
      const multiplier = (i % 3) * 9
      out += gothicDigitsArray[(n-1)+multiplier]
    }
    if (i > 0 && i % 6 == 0)
      out += conf.millions_separator
    gDigits.push(out)
  }
  return gDigits.toReversed().join('')
}

export function fromGothicNumerals(number: string, config?: GothicNumeralsConfig)
{
  const conf: Required<GothicNumeralsConfig> = {
    millions_separator: ':',
    thousands_sign: '͵',
    ...config,
  }

  const reBlockParts = new RegExp(
    `(${conf.thousands_sign})?([^${conf.thousands_sign}])`, 'gu')

  const blocks = number
    .split(conf.millions_separator)
    .map((block, i) =>
    {
      return [...block.matchAll(reBlockParts)]
        .reduce((v, d) =>
      {
        const exp_add = d[1] ? 3 : 0
        const index = gothicDigitsArray.indexOf(d[2]!)
        const exp = Math.trunc(index/9) + exp_add
        return v + (10**exp) * ((index%9)+1)
      }, 0).toString().padStart(i > 0 ? 6 : 0, "0")
    })
  const out = blocks.join('')
  if (out.length <= 4) // For date years without commas
    return out
  else
    return out
      .split('')
      .toReversed()
      .map((d, i) => i > 0 && i % 3 == 0 ? d + ',' : d)
      .toReversed()
      .join('')
}


const reArabicNumeral = new RegExp(
    `\\b(?<![,.])(\\d{1,3}(?:,\\d{3})+|\\d+)(?![,.]\\d)\\b`, "gu")

const gd = `[${gothicDigits}]`

export type GeneralConfig = {
  numberConversion?: 'none' | 'normal' | 'big',
} & GothicNumeralsConfig

export type FromLatinConfig = {
  th?: string,
  hv?: string,
  preserveDiacritics?: boolean,
} & GeneralConfig

export function fromLatin(text: string, config?: FromLatinConfig)
{
  const conf: Required<FromLatinConfig> = {
    th: '',
    hv: '',
    preserveDiacritics: false,
    numberConversion: 'normal',
    millions_separator: ':',
    thousands_sign: '͵',
    ...config,
  }

  const parts = text.split(/(<\[.+?\]>)/)
  for (var i = 0; i < parts.length; i++)
  {
    if(i % 2 == 1) continue
    let part = parts[i]!
    part = part.toLowerCase()
    part = part.normalize("NFD")
    if (!conf.preserveDiacritics)
      part = applyMapping(part, latinGothicDiacritics)
    if (conf.th) part = part.replaceAll(conf.th, '𐌸')
    if (conf.hv) part = part.replaceAll(conf.hv, '𐍈')
    part = applyMapping(part, latinGothic)
    if (conf.numberConversion !== 'none')
    {
      part = part.replaceAll(reArabicNumeral, m =>
      {
        if (conf.numberConversion !== 'big' && parseFloat(m) >= 1000)
          return m
        const num = toGothicNumerals(m, conf)
        return num ? '·' + num + '·' : m
      })
    }
    parts[i] = part
  }
  return parts.join('')
}

export type ToLatinConfig = {
  th?: string,
  hv?: string,
  capitalize?: boolean,
} & GeneralConfig

export function toLatin(text: string, config?: ToLatinConfig)
{
  const conf: Required<ToLatinConfig> = {
    th: '',
    hv: '',
    capitalize: false,
    numberConversion: 'normal',
    millions_separator: ':',
    thousands_sign: '͵',
    ...config,
  }

  const reMS = regExpEscape(conf.millions_separator)
  const reTS = regExpEscape(conf.thousands_sign)
  const reBlock = `(?:${reTS}${gd}){0,3}${gd}{0,3}`

  let out = text
  const reGothicNumeral = new RegExp(
    `·(${reBlock}(?:${reMS}${reBlock})*)·`, "gu")
  out = out.replaceAll(reGothicNumeral, (_, m) =>
  {
    if (conf.numberConversion !== 'none')
      return fromGothicNumerals(m, conf)
    else
      return '·' + applyMapping(m, gothicLatin).toUpperCase() + '·'
  })
  if (conf.th) out = out.replaceAll('𐌸', conf.th)
  if (conf.hv) out = out.replaceAll('𐍈', conf.hv)
  out = applyMapping(out, gothicLatin)
  if (conf.capitalize)
    out = out.replace(
      /(?<=(?:^\s*|[\.:·∴]\s+|\r?\n\s*\r?\n)["'‘‚“”„«»‹›\(\[\{⟨⟪<>]?)(.)/,
      (_, l) => l.toUpperCase())
  out = out.normalize("NFKC")
  return out
}

export function removeDiacritics(text: string)
{
  let out = text
  out = out.normalize("NFKD")
  out = removeDiacriticChars(out)
  out = out.normalize("NFKC") // re-attach diaereses
  return out
}

export function removeSuperfluousDiacritics(text: string)
{
  let out = text
  out = out.normalize("NFKD")
  out = removeSuperfluousDiacriticChars(out)
  out = out.normalize("NFKC") // re-attach diaereses
  return out
}

export function addDiaereses(text: string)
{
  return applyMapping(text, diaeresis)
    .normalize("NFKD")
}

const doublableConsonants = "gbdfjklmnpqrstþwz" // doublable consonants
const dc = doublableConsonants.split('').map(c=>c+c).join('|')
const vc = "(?:au|aú|áu|ai|aí|ái|ei)"
const bv = "[aeiouïúíāēōū]"
const av = "[aeiouáāēōū]"
const c = "[bdfghƕjklmnpqrstþwz]" // consonant
const sc = `(?:${c}|st|str|sw|sl|kl|kn|hr|tr|gw)` // start consonant
const ec = `(?:nd|rh|ht|rst|rg|bn|${c})` // end consonant
const fs = `${sc}[ywj]${ec}` // full syllable
const ss = `${sc}${av}|${fs}` // start of syllable
const es = `${bv}${ec}|${fs}` // end of syllable
const pxc = `(?:at|and|af|bi|dis|in|miþ|uz|un|ur|us|uf|ufar|tuz|twis|fair|faur|fidur)` // prefix ending in consonant
const pxa = `(?:ana|anda|ga|missa|faura|fra)` // prefix ending in 'a'

const hyphenRules = [
  /\b(?=ï)/ig,
  new RegExp(`(?<=\\b${pxc})(?=${ss})`, "ig"),
  new RegExp(`(?<=\\b${pxa})(?![ui]|${ec}||${dc}|\\b)`, "ig"),
  new RegExp(`(?<=${bv})(?=${ss})`, "ig"),
  new RegExp(`(?<=${es})(?=${ss})`, "ig"),
  new RegExp(`(?<=${bv}${dc})(?=${ss})`, "ig"),
  new RegExp(`(?<=${vc})(?=${bv})`, "ig"),
  new RegExp(`(?<=${av})(?=${vc})`, "ig"),
  new RegExp(`(?<=${av})(?=s$)`, "ig"),
]

export function addSoftHyphens(text: string)
{
  let out = text
  out = hyphenRules.reduce((text, rule) =>
  {
    return text.replace(rule, "\u00AD")
  }, out)
  return out
}

export function addOptionalMacrons(text: string)
{
  return text
    .replace(/e(?![i\u0304])/g, 'ē')
    .replace(/o(?!\u0304)/g, 'ō')
    .replace(/𐌴(?![𐌹\u0304])/g, '𐌴\u0304')
    .replace(/𐍉(?!\u0304)/g, '𐍉\u0304')
}

export function removePunctuation(text: string)
{
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
}

const voiced = "[bdgwnmjwlr]"

type ipaMapping = {[key: string]: string}

const ipaToVoicedFricative: ipaMapping = {
  'b': 'β',
  'd': 'ð',
  'g': 'ɣ'
}

const ipaToUnvoicedFricative: ipaMapping = {
  'b': 'ɸ',
  'd': 'θ',
  'g': 'x'
}

const latinIpa: RegExpMapping[] = [
  ['ggk', 'gk'],
  ['ggq', 'gq'],

  ['gw', 'ɡʷ'],

  [/[gn](?=\.?[kgq])/ig, 'ŋ'],
  [/n(?=\.?[bp])/ig, 'm'],
  [new RegExp(`(?<=${bv}\\.?)([bdg])(?=\\.?(?!\\1)(?:${av}|${voiced}))`, "ig"),
    (_, c) => ipaToVoicedFricative[c]!],
  [new RegExp(`(?<=${bv})([bdg])(?!\\.?\\1)`, "ig"),
    (_, c) => ipaToUnvoicedFricative[c]!],

  [/([bdfjklmnpqrstþwz])\1/ig, '$1ː'],

  ['f', 'ɸ'],
  ['þ', 'θ'],

  ['ƕ', 'hʷ'],
  ['hv', 'hʷ'],
  ['v', 'hʷ'],

  ['q', 'kʷ'],
  ['iu', 'iu̯'],

  ['aí', 'ɛ'],
  ['ái', 'ɛː'],
  [/ai(?=\.?[hr])/ig, 'ɛ'],
  ['ai', 'ɛː'],

  ['aú', 'ɔ'],
  ['áu', 'ɔː'],
  [/au(?=\.?[hr])/ig, 'ɔ'],
  ['au', 'ɔː'],

  ['ei', 'iː'],
  ['ī', 'iː'],

  ['ā', 'aː'],

  ['e', 'eː'],
  ['ē', 'eː'],

  ['o', 'oː'],
  ['ō', 'oː'],

  ['ū', 'uː'],

  ['ï', 'i'],
]

export function toIpa(text: string)
{
  let out = text
  out = out.toLowerCase()
  out = removePunctuation(out)
  out = out.replaceAll("\u00AD", ".")
  out = applyMapping(out, latinIpa)
  return out
}