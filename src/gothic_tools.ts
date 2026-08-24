import { toGothicNumerals } from "./transliterate"

export function addOverlineHtml(content: string)
{
  return `<span class='sigla-overline'>${content}</span>`
}

function toGothicFractionalValue(value: number, denominator: null | number = null,
  hideDenominator = false)
{
  if (!denominator) return ''
  const fractionalValue = Math.round((Math.abs(value) % 1) * denominator)
  if (!fractionalValue) return ''

  const gothicNumerator = toGothicNumerals(fractionalValue)
  const gothicDenominator = toGothicNumerals(denominator)
  const sub = hideDenominator ? '' : `<span class='frac-div'>&frasl;</span><sub>${gothicDenominator}</sub>`
  return `<sup>${gothicNumerator}</sup>` + sub
}

export function toGothicValue(value: number, denominator: null | number = null,
  hideDenominator = false)
{
  const gothicFractionalValue = toGothicFractionalValue(value, denominator, hideDenominator)

  const absValue = Math.abs(denominator ? Math.floor(value) : Math.round(value))
  const absGothicValue = absValue == 0
    ? (gothicFractionalValue ? gothicFractionalValue : "0")
    : toGothicNumerals(absValue) + gothicFractionalValue

  const gothicValue = value < 0 ? `(${absGothicValue})` : absGothicValue
  const fValue = `·${addOverlineHtml(gothicValue)}·`
  return fValue
}
