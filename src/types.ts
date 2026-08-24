export type LongShortNarrowName = {
  long: string,
  short: string,
  narrow: string,
}

export type Theme = 'dark' | 'light'
export type MonthCalendarMode = 'auto' | 'full' | 'list'
export type WeekdayNameSet =
  'germanic'
  | 'gothic'

export type Options = {
  isGothicScript: boolean,
  isGothicNumerals: boolean,
  firstWeekday: number,
  theme: Theme,
  monthCalendarMode: MonthCalendarMode,
  isCompactListView: boolean,
  weekdayNameSet: WeekdayNameSet,
}

export type CalendarView = 'month' | 'year' | 'agenda' | 'week'

export type PropsList = {
  start: Date,
  mode?: 'week' | 'month' | 'agenda'
  compact?: boolean,
  displayYearInTitle?: boolean,
}
export type PropsGrid = {
  displayYearInTitle: boolean,
  gridMonth: Date,
  hideUnusedWeeks?: boolean,
  hideExtraDays?: boolean,
}

export type PropsGridDay = {
  gridMonth: Date,
  date: Date,
  hideDetailsOnOuterMonth?: boolean,
}

export type Tgv = (value: number) => number|string
export type Tgt = (value: string, withHtml?: boolean) => string

export type Calendar = {
  key: string,
  name: string,
  fg: string,
  bg: string,
}

export type EventData = {
  calendar_key: string,
  title: string,
  description: string,

  start_method: string,
  start_args: string,

  end_method: string,
  end_args: string,
}

export type CalendarData = {
  calendars: Calendar[],
  events: EventData[]
}

export type CalendarEvent = {
  title: string,
  dtfrom: Date,
  dtto: Date,
  description: string,
  calendar: Calendar,
  position: number | null,
}

export type CalendarMap = {
  [key: string]: Calendar
}