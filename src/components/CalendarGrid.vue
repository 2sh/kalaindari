<script setup lang="ts">

import { addDate, diffInDays, sameDay } from '@/tools'
import type {
  CalendarEvent,
  Options,
  PropsGrid,
} from '../types'

import CalendarGridDay from "@/components/CalendarGridDay.vue"
import { calendarEventsKey, highlightedEventKey, optionsKey, toRepStringKey, toRepValueKey } from '@/symbols'
import { computed, inject, type Ref } from 'vue'

const tgv = inject(toRepValueKey)!
const tgt = inject(toRepStringKey)!
const highlightedEvent = inject(highlightedEventKey)!

const options = inject(optionsKey) as Ref<Options>
const props = defineProps<PropsGrid>()

const firstOfGrid = computed(() =>
{
  const d = new Date(props.gridMonth)
  d.setUTCDate(1 - ((d.getUTCDay() - options.value.firstWeekday + 7) % 7))
  return d
})

function getWeeksInMonth()
{
  const d = new Date(props.gridMonth)
  d.setUTCMonth(d.getUTCMonth()+1)
  return Math.ceil(diffInDays(firstOfGrid.value, d) / 7)
}

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
    if (event.title == "Niketa sa Guta")
    {
      console.log(event.dtfrom)
      console.log(date)
      console.log(event.dtto)
      console.log(event.dtfrom <= date && date <= event.dtto)
      console.log(sameDay(event.dtfrom, date))
    }

    if (!(event.dtfrom <= date && date <= event.dtto)) return

    const isStart = sameDay(event.dtfrom, date)
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
        <span class="short">{{ $t(`weekdays_${options.weekdayNameSet}.${addDate(firstOfGrid, d).getUTCDay()}.short`) }}</span>
        <span class="long">{{ $t(`weekdays_${options.weekdayNameSet}.${addDate(firstOfGrid, d).getUTCDay()}.long`) }}</span>
      </div>
    </div>
    <div class="calendar-grid-week" v-for="(_, y) in (props.hideUnusedWeeks ? getWeeksInMonth() : 6)">
      <template v-for="(_, x) in 7">
        <CalendarGridDay
          :gridMonth="props.gridMonth"
          :date="addDate(firstOfGrid, ((y*7)+x))"
          :hideDetailsOnOuterMonth="props.hideExtraDays"
          v-slot="{ date }">
          <template v-for="event in getDayEvents(date, {x, y})">
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
