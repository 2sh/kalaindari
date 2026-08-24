//import { rrulestr } from 'rrule'

import {
  gregorianEaster,
  orthodoxEaster
} from 'date-easter'
import { addDate } from './tools'



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
    output = addDate(date, args.shift)

  return output
}

interface ScheduleMethod
{
  apply(start: Date, end: Date, args: string): Date[]
}

type YearCache = { [year: number]: Date }

class CachedYearMethod
{
  private cache: YearCache = {}

  protected applyCache(year: number, f: (y: number) => Date)
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

class MethodYearly implements ScheduleMethod
{
  apply(start: Date, end: Date, args: string)
  {
    return getYears(start, end).map(y =>
    {
      const [m, d] = args.split('-').map(n => parseInt(n))
      return new Date(Date.UTC(y, m!-1, d!))
    })
  }
}

class MethodEasterOrthodox extends CachedYearMethod implements ScheduleMethod
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

class MethodEasterGregorian extends CachedYearMethod implements ScheduleMethod
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




const methods: {[name: string]: ScheduleMethod} = {
//  'rrule': new MethodRRule(),
  'yearly': new MethodYearly(),
  'easter_orthodox': new MethodEasterOrthodox(),
  'easter_gregorian': new MethodEasterGregorian(),
}

export function getDatesFromMethod(method: string, args: string, start: Date, end: Date)
{
  const startDate = new Date(start)
  // for long running events
  startDate.setUTCMonth(startDate.getUTCMonth()-2)

  if (!methods[method]) return []
  return methods[method].apply(startDate, end, args)
}
