import type { InjectionKey, Ref } from 'vue'
import type { CalendarEvent, Options, Tgv, Tgt } from './types'

export const optionsKey = Symbol() as InjectionKey<Ref<Options>>
export const toRepValueKey = Symbol() as InjectionKey<Tgv>
export const toRepStringKey = Symbol() as InjectionKey<Tgt>
export const calendarEventsKey = Symbol() as InjectionKey<Ref<CalendarEvent[]>>
export const highlightedEventKey = Symbol() as InjectionKey<Ref<CalendarEvent|null>>
export const excludedCalendarsKey = Symbol() as InjectionKey<Ref<string[]>>