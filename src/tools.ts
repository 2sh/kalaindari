/*
These functions look a bad smell but it's for performance as they get
called frequently
*/

const units = ['y', 'm', 'd', 'h', 'M', 's'] as const

type ModKey =
   'y' |  'm' |  'd' |  'h' |  'M' |  's' |  'S' |
  '_y' | '_m' | '_d' | '_h' | '_M' | '_s' | '_S' |
  'xy' | 'xm' | 'xd' | 'xh' | 'xM' | 'xs' | 'xD'

type DateModOptions ={
  [key in ModKey]?: number
}

type ModFunction = (date: Date, value: number) => void

const modFunctions: {[key in ModKey]: ModFunction} = {
  y: (d, v) => d.setUTCFullYear(v),
  m: (d, v) => d.setUTCMonth(v),
  d: (d, v) => d.setUTCDate(v),
  h: (d, v) => d.setUTCHours(v),
  M: (d, v) => d.setUTCMinutes(v),
  s: (d, v) => d.setUTCSeconds(v),
  S: (d, v) => d.setUTCMilliseconds(v),

  _y: (d, v) => d.setUTCFullYear(d.getUTCFullYear()+v),
  _m: (d, v) => d.setUTCMonth(d.getUTCMonth() + v),
  _d: (d, v) => d.setUTCDate(d.getUTCDate() + v),
  _h: (d, v) => d.setUTCHours(d.getUTCHours() + v),
  _M: (d, v) => d.setUTCMinutes(d.getUTCMinutes() + v),
  _s: (d, v) => d.setUTCSeconds(d.getUTCSeconds() + v),
  _S: (d, v) => d.setUTCMilliseconds(d.getUTCMilliseconds() + v),

  xy: (d, v) => {
    d.setUTCMonth(0, 1)
    d.setUTCHours(0, 0, 0, 0)
  },
  xm: (d, v) => {
    d.setUTCDate(1)
    d.setUTCHours(0, 0, 0, 0)
  },
  xd: (d, v) => d.setUTCHours(0, 0, 0, 0),
  xh: (d, v) => d.setUTCMinutes(0, 0, 0),
  xM: (d, v) => d.setUTCSeconds(0, 0),
  xs: (d, v) => d.setUTCMilliseconds(0),

  xD: (d, v) => {
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - v + 7) % 7))
    d.setUTCHours(0, 0, 0, 0)
  },
}

export function modDate(date: Date, mod?: DateModOptions, editOriginal=false)
{
  let newDate = editOriginal ? date : new Date(date)

  for (const [key, value] of Object.entries(mod || {}))
  {
    const func = modFunctions[key as ModKey]
    if (!func) continue
    func(newDate, value)
  }

  return newDate
}

export function sameTime(d1: Date, d2: Date, unit?: typeof units[number])
{
  if (typeof unit == 'undefined') return d1.valueOf() == d2.valueOf()

  if (d1.getUTCFullYear() !== d2.getUTCFullYear()) return false
  if (unit == 'y') return true

  if (d1.getUTCMonth() !== d2.getUTCMonth()) return false
  if (unit == 'm') return true

  if (d1.getUTCDate() !== d2.getUTCDate()) return false
  if (unit == 'd') return true

  if (d1.getUTCHours() !== d2.getUTCHours()) return false
  if (unit == 'h') return true

  if (d1.getUTCMinutes() !== d2.getUTCMinutes()) return false
  if (unit == 'M') return true

  if (d1.getUTCSeconds() !== d2.getUTCSeconds()) return false
  if (unit == 's') return true

  return d1.getUTCMilliseconds() === d2.getUTCMilliseconds()
}

const dayInMs = 86400000
export function diffInDays(d1: Date, d2: Date)
{
  return Math.abs((d1.getTime() - d2.getTime()) / dayInMs)
}

export function getDaysInMonth(date: Date)
{
  return diffInDays(date, modDate(date, {_m: 1}))
}

export function getFirstDayOfWeek(date: Date, firstDow: number)
{
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - firstDow + 7) % 7))
  return d
}

export function getNumberOfWeeksInMonth(date: Date, firstDow: number)
{
  const start = getFirstDayOfWeek(date, firstDow)
  const end = new Date(date)
  end.setUTCMonth(end.getUTCMonth()+1)
  return Math.ceil(diffInDays(start, end) / 7)
}