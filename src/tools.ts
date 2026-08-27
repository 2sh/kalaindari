/*
These functions look a bad smell but it's for performance as they get
called frequently
*/

const units = ['y', 'm', 'd', 'h', 'M', 's'] as const

type DateMod = {
  y?: number | null,
  m?: number | null,
  d?: number | null,
  h?: number | null,
  M?: number | null,
  s?: number | null,
  S?: number | null,

  _y?: number,
  _m?: number,
  _d?: number,
  _h?: number,
  _M?: number,
  _s?: number,
  _S?: number,
}

export function modDate(date: Date, mod?: DateMod)
{
  if (!mod) return new Date(date)

  let y = typeof mod.y == 'number' ? mod.y : date.getUTCFullYear()
  if (mod._y) y += mod._y

  let m = typeof mod.m == 'number' ? mod.m : date.getUTCMonth()
  if (mod._m) m += mod._m

  let d = typeof mod.d == 'number' ? mod.d : date.getUTCDate()
  if (mod._d) d += mod._d

  let h = typeof mod.h == 'number' ? mod.h : date.getUTCHours()
  if (mod._h) h += mod._h

  let M = typeof mod.M == 'number' ? mod.M : date.getUTCMinutes()
  if (mod._M) M += mod._M

  let s = typeof mod.s == 'number' ? mod.s : date.getUTCSeconds()
  if (mod._s) s += mod._s

  let S = typeof mod.S == 'number' ? mod.S : date.getUTCMilliseconds()
  if (mod._S) S += mod._S

  const by = units.findIndex(l => mod[l] === null) || 0
  const args = [y, m, d, h, M, s, S].slice(0, by) as [number]
  return new Date(Date.UTC(...args))
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