import { Seasons, SearchMoonPhase } from 'astronomy-engine'


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
    if (dateTo < date) break
    monthStarts.push(date)
    date.setUTCMilliseconds(date.getUTCMilliseconds()+1)
  }

  return monthStarts.map((start, index) =>
  {
    const end = monthEnds[index]!
    return {
      start: new Date(Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate())),
      end: new Date(Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate())),
      year,
      index,
      isLeapYear: monthStarts.length == 13
    }
  })
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