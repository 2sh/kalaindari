<script setup lang="ts">

import type { CalendarEvent, Options, PropsList } from '@/types'
import { calendarEventsKey, highlightedEventKey, optionsKey, toRepStringKey, toRepValueKey } from '@/symbols'
import { computed, inject, type Ref } from 'vue'
import { useTranslation } from "i18next-vue"
import { getDaysInMonth, sameTime } from '@/tools'

const { t } = useTranslation()

const options = inject(optionsKey) as Ref<Options>
const tgv = inject(toRepValueKey)!
const tgt = inject(toRepStringKey)!
const highlightedEvent = inject(highlightedEventKey)!

const calendarEvents = inject(calendarEventsKey) as Ref<CalendarEvent[]>

const props = withDefaults(defineProps<PropsList>(), {
  mode: 'week',
  compact: false,
})

function calculateEnd()
{
  const temp = new Date(props.start)
  temp.setUTCDate(temp.getUTCDate()+6)
  return temp
}

function getWeekTitle()
{
  const end = calculateEnd()

  const startMonth = t(`months.${props.start.getUTCMonth()}.short`)
  const endMonth = t(`months.${end.getUTCMonth()}.short`)
  const startYear = tgv(props.start.getUTCFullYear())
  const endYear = tgv(end.getUTCFullYear())

  let titleStart = tgv(props.start.getUTCDate())
  if (startMonth != endMonth)
    titleStart += ` ${startMonth}`
  if (startYear != endYear)
    titleStart += ` ${startYear}`
  const titleEnd = tgv(end.getUTCDate())
    + ` ${endMonth} ${endYear}`
  return `${titleStart} - ${titleEnd}`
}

function getEvents(date: Date)
{
  return calendarEvents.value
    .filter(event => event.dtfrom <= date && date <= event.dtto)
}

type Day = {
  date: Date,
  isToday: boolean,
  events: CalendarEvent[],
  isNewWeek: boolean,
}

function getDays()
{
  const output: Day[] = []
  const totalDays = props.mode == 'week' ? 7 :
    props.mode == 'month' ? getDaysInMonth(props.start) : 0
  let isNewWeek = false
  for (let i=0; i<totalDays; i++)
  {
    const date = new Date(props.start)
    date.setUTCDate(date.getUTCDate()+i)

    const events = getEvents(date)
    const isToday = sameTime(date, new Date(), 'd')

    if (date.getUTCDay() == options.value.firstWeekday)
      isNewWeek = true

    if (props.compact && !(isToday || events.length)) continue

    output.push({
      date,
      events,
      isToday,
      isNewWeek,
    })
    isNewWeek = false
  }
  return output
}

const days = computed(getDays)

</script>

<template>
<div class="calendar-list" v-if="!(props.compact && props.mode=='month' && !props.displayYearInTitle) || days.length">
  <div class="title">
    <template v-if="props.mode=='week'">
      <span  v-html="getWeekTitle()"></span>
    </template>
    <template v-if="props.mode=='month'">
      <span>{{ $t(`months.${props.start.getUTCMonth()}.long`) }}</span>
      <span v-if="props.displayYearInTitle" v-html="tgv(props.start.getUTCFullYear())"></span>
    </template>
    <template v-if="props.mode=='agenda'">
      <span>{{ t('ui.agenda') }}</span>
    </template>
  </div>
  <div class="days">
    <div v-for="day in days" :class="['day', 'dom-' + day.date.getUTCDay(),
      {
        'current': day.isToday,
        'is-new-week': day.isNewWeek,
      }]" >
      <div class="day-header">
        <div class="day-name">
          <span>{{ t(`weekdays_${options.weekdayNameSet}.${day.date.getUTCDay()}.short`) }}</span>
          <!--span v-if="day.isToday">({{ t("today.long") }})</span-->
        </div>
        <div class="day-date" v-html="tgv(day.date.getUTCDate())"></div>
      </div>
      <div class="events">
        <div class="event" v-for="event in day.events"
          @click="highlightedEvent = event">
          <div class="event-title" v-html="tgt(event.title)"
            :style="{
              backgroundColor: event.calendar.bg,
              color: event.calendar.fg,
              '--overline-color': event.calendar.fg}"></div>
          <div v-if="event.description"
            class="event-description"
            v-html="tgt(event.description)"></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
