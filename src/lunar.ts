import { Seasons, SearchMoonPhase } from 'astronomy-engine'
import { modDate, diffInDays } from './tools'


/*
const leapMonthIndex = 6
const leapShift = !m.isLeapYear && leapMonthIndex <= m.index ? 1 : 0
const monthNumber = (m.index + leapShift) + 1
const monthName = monthNames[m.index + leapShift]
*/

export type LunarMonth = {
  start: Date,
  end: Date,
  year: number,
  index: number,
  isLeapYear: boolean
}

export function toGoldenNumber(year: number)
{
  return (year%19)+1
}

export function getLunarYear(date: Date)
{
  const solstice = Seasons(date.getUTCFullYear()).dec_solstice.date
  return date.getUTCFullYear() + (date < solstice ? 0 : 1)
}

export function getLunarDate(date: Date)
{
  const year =  getLunarYear(date)

  const lunarMonth = getLunarMonthsOfYear(year).find(lm => lm.start <= date)
  if (!lunarMonth) return null
  return {
    year,
    month: lunarMonth.index+1,
    date: diffInDays(lunarMonth.start, date)+1,
    goldenNumber: toGoldenNumber(year)
  }
}

export function getLunarMonthsOfYear(year: number): LunarMonth[]
{
  const dateFrom = Seasons(year-1).dec_solstice.date
  const dateTo = Seasons(year).dec_solstice.date

  let date: Date = dateFrom

  const monthStarts: Date[] = []
  const monthEnds: Date[] = []

  while(1)
  {
    const fullMoonTime = SearchMoonPhase(180, date, 30)
    if (!fullMoonTime) break
    date = fullMoonTime.date
    if (monthStarts.length)
    {
      monthEnds.push(date)
    }
    if (!(date < dateTo)) break
    monthStarts.push(date)
    date = modDate(date, {_d: 1})
  }

  const lunarMonths = monthStarts.map((start, index) =>
  {
    const end = monthEnds[index]!
    return {
      start: modDate(start, {h: null}),
      end: modDate(end, {h: null}),
      year,
      index,
      isLeapYear: monthStarts.length == 13
    }
  })

  return lunarMonths
}

export function getLunarMonthsInRange(dateFrom: Date, dateTo: Date)
{
  const lunarMonths: LunarMonth[] = []
  const yearFrom = dateFrom.getUTCFullYear()
  const yearTo = dateTo.getUTCFullYear()
  for (let year=yearFrom; year<yearTo+2; year++)
  {
    lunarMonths.push(
      ...getLunarMonthsOfYear(year)
        .filter(m => dateFrom <= m.end && m.start < dateTo))
  }
  return lunarMonths
}