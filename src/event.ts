//import { rrulestr } from 'rrule'

import {
  gregorianEaster,
  orthodoxEaster
} from 'date-easter'
import { modDate } from './tools'
import { Seasons } from 'astronomy-engine'
import { getLunarMonthsOfYear, type LunarMonth } from './lunar'



type YmdObject = {
  year: number,
  month: number,
  day: number,
}

function getYears(start: Date, end: Date)
{
  const innerEnd = new Date(end)
  innerEnd.setUTCMilliseconds(innerEnd.getUTCMilliseconds()-1)
  const years: number[] = []
  for(let y=start.getUTCFullYear(); y<=innerEnd.getUTCFullYear(); y++)
  {
    years.push(y)
  }
  return years
}

function ymdObjectToDate(ymdObject: YmdObject)
{
  return new Date(Date.UTC(
    ymdObject.year,
    ymdObject.month-1,
    ymdObject.day))
}


type CustomArgs = {
  shift?: number
}

function applyCustomArgs(date: Date, a: string)
{
  let output = date
  const parsedArgs = JSON.parse(a)
  const args: CustomArgs = typeof parsedArgs === 'number'
    ? { shift: parsedArgs } : parsedArgs
  if (typeof args !== 'object' || args === null) return output

  if (args.shift)
    output = modDate(date, {_d: args.shift})

  return output
}

interface ScheduleMethod
{
  apply(start: Date, end: Date, args: string): Date[]
}

type YearCache<T> = { [year: number]: T }

class CachedYearMethod<T>
{
  private cache: YearCache<T> = {}

  protected applyCache(year: number, f: (y: number) => T)
  {
    const cachedDate = this.cache[year]
    if (cachedDate) return cachedDate
    const newDate = f(year)
    this.cache[year] = newDate
    return newDate
  }
}

/*
class MethodRRule implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    return rrulestr(
      args.includes("DTSTART") ? args : "DTSTART:00010101T000000Z\n" + args)
      .between(start, end)
  }
}
*/

function argsToMonthDate(args: string): [number, number]
{
  const [m, d] = args.split('-').map(n => parseInt(n))
  if (m && d)
    return [m, d]
  return [1, 1]
}

function toDay(date: Date)
{
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ))
}

class MethodYearly implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    return getYears(start, end).map(y =>
    {
      const [m, d] = argsToMonthDate(args)
      return new Date(Date.UTC(y, m!-1, d!))
    })
  }
}

class MethodEasterOrthodox extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => ymdObjectToDate(orthodoxEaster(y))),
        args)
    })
  }
}

class MethodEasterGregorian extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => ymdObjectToDate(gregorianEaster(y))),
        args)
    })
  }
}


class MethodJuneSolstice extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => toDay(Seasons(y).jun_solstice.date)),
        args)
    })
  }
}

class MethodDecemberSolstice extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => toDay(Seasons(y).dec_solstice.date)),
        args)
    })
  }
}

class MethodMarchEquinox extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => toDay(Seasons(y).mar_equinox.date)),
        args)
    })
  }
}

class MethodSeptemberEquinox extends CachedYearMethod<Date> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    return getYears(start, end).map(y =>
    {
      return applyCustomArgs(
        self.applyCache(y, (y) => toDay(Seasons(y).sep_equinox.date)),
        args)
    })
  }
}

const leapMonthIndex = 6

class MethodLunarYearly extends CachedYearMethod<LunarMonth[]> implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    const self = this
    const dates: Date[] = []
    const years = getYears(start, end)
    years.push(years.at(-1)!+1)
    years.forEach(y =>
    {
      const [m, d] = argsToMonthDate(args)
      const lunarMonths = self.applyCache(y, y => getLunarMonthsOfYear(y))

      const lunarMonth = lunarMonths.find(lunarMonth =>
      {
        const leapShift = !lunarMonth.isLeapYear && leapMonthIndex <= lunarMonth.index ? 1 : 0
        return m == (lunarMonth.index + leapShift) + 1
      })
      if (!lunarMonth) return
      console.log('hey')
      const date = modDate(lunarMonth.start, {_d: d-1})
      if (!(date < lunarMonth.end)) return
      dates.push(date)
    })
    return dates
  }
}

const methods: {[name: string]: ScheduleMethod} = {
//  'rrule': new MethodRRule(),

  'yearly': new MethodYearly(),
  'lunar_yearly': new MethodLunarYearly(),

  'easter_orthodox': new MethodEasterOrthodox(),
  'easter_gregorian': new MethodEasterGregorian(),

  'jun_solstice': new MethodJuneSolstice(),
  'dec_solstice': new MethodDecemberSolstice(),

  'mar_equinox': new MethodMarchEquinox(),
  'sep_equinox': new MethodSeptemberEquinox(),
}


export function getDatesFromMethod(method: string, args: string, start: Date, end: Date)
{
  const startDate = new Date(start)
  // for long running events
  startDate.setUTCMonth(startDate.getUTCMonth()-2)

  if (!methods[method]) return []
  return methods[method].apply(startDate, end, args)
}
