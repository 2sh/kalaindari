const dayInMs = 86400000

export function addDate(date: Date, value: number)
{
  const newDate = new Date(date)
  newDate.setUTCDate(newDate.getUTCDate()+value)
  return newDate
}

export function addMonth(date: Date, value: number)
{
  const newDate = new Date(date)
  newDate.setUTCMonth(newDate.getUTCMonth()+value)
  return newDate
}

export function addYear(date: Date, value: number)
{
  const newDate = new Date(date)
  newDate.setUTCFullYear(newDate.getUTCFullYear()+value)
  return newDate
}

export function sameMonth(d1: Date, d2: Date)
{
  return d1.getUTCFullYear() === d2.getUTCFullYear()
    && d1.getUTCMonth() === d2.getUTCMonth()
}

export function sameDay(d1: Date, d2: Date)
{
  return d1.getUTCFullYear() === d2.getUTCFullYear()
    && d1.getUTCMonth() === d2.getUTCMonth()
    && d1.getUTCDate() === d2.getUTCDate()
}

export function diffInDays(d1: Date, d2: Date)
{
  return Math.abs((d1.getTime() - d2.getTime()) / dayInMs)
}

export function getDaysInMonth(date: Date)
{
  const d = new Date(date)
  d.setUTCMonth(d.getUTCMonth()+1)
  return diffInDays(date, d)
}