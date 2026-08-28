<script setup lang="ts">

import { modDate, diffInDays, sameTime, getNumberOfWeeksInMonth } from '@/tools'
import type {
  CalendarEvent,
  Options,
  PropsGrid,
} from '../types'

import CalendarGridDay from "@/components/CalendarGridDay.vue"
import { calendarEventsKey, highlightedEventKey, optionsKey, toRepStringKey, toRepValueKey } from '@/symbols'
import { computed, inject, type Ref } from 'vue'
import { getLunarMonthsInRange } from '@/lunar'

const tgv = inject(toRepValueKey)!
const tgt = inject(toRepStringKey)!
const highlightedEvent = inject(highlightedEventKey)!

const options = inject(optionsKey) as Ref<Options>
const props = defineProps<PropsGrid>()

const firstOfGrid = computed(() =>
  modDate(props.gridMonth, { xD: options.value.firstWeekday }))

const weeksInGrid = computed(() =>
{
  return props.hideUnusedWeeks
    ? getNumberOfWeeksInMonth(props.gridMonth, options.value.firstWeekday)
    : 6
})

const lastOfGrid = computed(() =>
{
  return modDate(firstOfGrid.value, {_d: 7*weeksInGrid.value})
})

const lunarMonths = computed(() =>
{
  return getLunarMonthsInRange(firstOfGrid.value, lastOfGrid.value)
})

const calendarEvents = inject(calendarEventsKey) as Ref<CalendarEvent[]>

type DayEvent = {
  event: CalendarEvent,
  slot: number,
  width: number,
  hasStart: boolean,
  hasEnd: boolean
}

type Position = {
  x: number,
  y: number,
}

let weekSlots: {[slot: number]: number} = []

function getSlot(days: number)
{
  let slot = 1
  while(1)
  {
    if (!(slot in weekSlots)) break
    slot++
  }
  weekSlots[slot] = days
  return slot
}


function getDayEvents(date: Date, gridPosition: Position)
{
  if (gridPosition.x == 0)
  {
    weekSlots = []
  }
  else
  {
    for(let slot in weekSlots)
    {
      // @ts-ignore
      weekSlots[slot]--
      if (weekSlots[slot] == 0)
        delete weekSlots[slot]
    }
  }

  const events: DayEvent[] = []

  calendarEvents.value.forEach(event =>
  {
    if (!(event.dtfrom <= date && date <= event.dtto)) return

    const isStart = sameTime(event.dtfrom, date, 'd')
    const isStartOfWeek = gridPosition.x == 0

    if (!(isStart || isStartOfWeek)) return

    const dayIndex = Math.floor(diffInDays(date, event.dtfrom))
    const durationInDays = Math.ceil(diffInDays(event.dtto, event.dtfrom))

    const daysLeft = durationInDays - dayIndex
    const daysInWeek = Math.min(daysLeft, 7 - gridPosition.x)

    const slot = getSlot(daysInWeek)

    events.push({
      event,
      slot,
      width: daysInWeek,
      hasStart: isStart,
      hasEnd: daysLeft <= daysInWeek
    })
  })
  return events
}

function getWeek(y: number)
{
  const days = []
  for (let x=0; x<7; x++)
  {
    days.push({
      position: {x, y},
      date: modDate(firstOfGrid.value, {_d: ((y*7)+x)}),
    })
  }
  return days
}

function checkIfFullMoon(date: Date)
{
  return lunarMonths.value.some(l => sameTime(l.start, date, 'd'))
}

</script>

<template>
<div class="calendar-grid">
  <div class="title">
    <span>{{ $t(`months.${props.gridMonth.getUTCMonth()}.long`) }}</span>
    <span v-if="props.displayYearInTitle" v-html="tgv(props.gridMonth.getUTCFullYear())"></span>
  </div>
  <div class="calendar-grid-layout">
    <div class="calendar-grid-day-titles">
      <div class="calendar-grid-day-title" v-for="(_, d) in 7">
        <div class="cell-border"></div>
        <span class="short">{{ $t(`weekdays_${options.weekdayNameSet}.${modDate(firstOfGrid, {_d: d}).getUTCDay()}.short`) }}</span>
        <span class="long">{{ $t(`weekdays_${options.weekdayNameSet}.${modDate(firstOfGrid, {_d: d}).getUTCDay()}.long`) }}</span>
      </div>
    </div>
    <div class="calendar-grid-week" v-for="(_, y) in weeksInGrid">
      <template v-for="day in getWeek(y)">
        <CalendarGridDay
          :class="{
            'is-full-moon': checkIfFullMoon(day.date),
          }"
          :gridMonth="props.gridMonth"
          :date="day.date"
          :hideDetailsOnOuterMonth="props.hideExtraDays">
          <template v-for="event in getDayEvents(day.date, day.position)">
            <div
            :class='[
              "event",
              `width-${event.width}`,
              `slot-${event.slot}`,
              {
                "start": event.hasStart,
                "end": event.hasEnd,
              }]'
            @click="highlightedEvent = event.event">
              <div class="event-content"
                :style="{
                  backgroundColor: event.event.calendar.bg,
                  color: event.event.calendar.fg,
                  '--overline-color': event.event.calendar.fg
                }" v-html="tgt(event.event.title)"
                :title="tgt(event.event.title, true)"></div>
            </div>
          </template>
        </CalendarGridDay>
      </template>
    </div>
  </div>
</div>
</template>
