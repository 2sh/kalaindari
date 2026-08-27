<script setup lang="ts">

import type {
  Calendar,
  CalendarData,
  CalendarEvent,
  CalendarView,
  EventData,
  MonthCalendarMode,
  Theme,
  WeekdayNameSet,
} from '../types'

import {
  computed,
  reactive,
  ref,
  watch,
  provide,
  onMounted,
  onUnmounted,
} from 'vue'


import Options from '../components/Options.vue'
import Event from '../components/Event.vue'
import Calendars from '../components/Calendars.vue'
import { useLocalStorage } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

import { useTranslation } from "i18next-vue"
import { addOverlineHtml, toGothicValue } from '@/gothic_tools'
import CalendarGrid from "@/components/CalendarGrid.vue"
import CalendarList from "@/components/CalendarList.vue"
import { calendarEventsKey, excludedCalendarsKey, highlightedEventKey, optionsKey, toRepStringKey, toRepValueKey } from "@/symbols"
import { modDate, sameTime } from '@/tools'
import { fromLatin } from '@/transliterate'

import { getDatesFromMethod } from '@/event'
import { getLunarYear, toGoldenNumber } from '@/lunar'

const { i18next, t } = useTranslation()

function tgt(value: string, withoutHtml = false)
{
  if (isGothicScript.value)
  {
    const plain = fromLatin(value, {
      numberConversion: isGothicNumerals.value ? "big" : 'none'
    })
    if (withoutHtml) return plain
    return plain.replace(/(?<=^|\s)·((?:[^·]|\S)+?)·(?=$|\s)/g, (_, v) => {
      return "·" + addOverlineHtml(v) + "·"
    })
  }
  else
  {
    return value
  }
}

function tgv(value: number)
{
  if (isGothicScriptWithNumerals.value)
    return toGothicValue(value)
  else
    return value
}


const isGothicScript = useLocalStorage('is_gothic_script', true)
const isGothicNumerals = useLocalStorage('gothic_numeral_mode', true)
const monthCalendarMode = useLocalStorage<MonthCalendarMode>('month_calendar_mode', 'auto')
const isCompactListView = useLocalStorage('is_compact_list_view', false)
const weekdayNameSet = useLocalStorage<WeekdayNameSet>('weekday_name_set', 'germanic')

const excludedCalendars = useLocalStorage<string[]>('excluded_calendars', [])

provide(excludedCalendarsKey, excludedCalendars)

const firstWeekday = useLocalStorage('first_weekday', 0)
// Probably won't work correctly but leaving just in case I want to add the feature

const isGothicScriptWithNumerals = computed(() =>
  isGothicScript.value && isGothicNumerals.value)


// manage body classes

const bodyClasses = reactive<{ [prefix: string]: string[] }>({})

watch(bodyClasses, () =>
{
  const classes: string[] = []
  Object.entries(bodyClasses).forEach(([prefix, values]) =>
  {
    if (prefix.startsWith("_"))
      classes.push(...values)
    else
      classes.push(...values.map(value => prefix + '-' + value))
  })
  document.body.className = classes.join(' ')
})

/* gothic script switch */

watch(isGothicScript, v =>
{
  document.body.setAttribute("lang", v ? 'got-Goth' : 'got-Latn')
})

function setLanguage()
{
  i18next.changeLanguage(isGothicScript.value ? 'got-Goth' : 'got-Latn')
}
setLanguage()
watch(isGothicScript, setLanguage)


/* theme */

const theme = useLocalStorage<Theme>('theme',
  (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
  ? 'light' : 'dark')
)

const themeCredits: {[themeKey: string]: string} = {

}

function setTheme()
{
  document.documentElement.dataset.theme = theme.value
  bodyClasses['theme'] = [theme.value]
}
watch(theme, setTheme)
setTheme()


/* options box */

const showOptions = ref(false)

function handleCloseOptions()
{
  showOptions.value = false
}

const options = ref({
  isGothicScript, isGothicNumerals,
  firstWeekday, theme,
  monthCalendarMode, isCompactListView,
  weekdayNameSet,
})

provide(optionsKey, options)
provide(toRepValueKey, tgv)
provide(toRepStringKey, tgt)


const displayListView = ref(false)

function adjustCalendarMode()
{
  if (monthCalendarMode.value == 'auto')
    displayListView.value = window.innerWidth < 800
  else
    displayListView.value = monthCalendarMode.value == 'list'
}
adjustCalendarMode()
watch(monthCalendarMode, adjustCalendarMode)

onMounted(() => window.addEventListener("resize", adjustCalendarMode))
onUnmounted(() => window.removeEventListener("resize", adjustCalendarMode))

// event window

const highlightedEvent = ref<CalendarEvent|null>(null)

provide(highlightedEventKey, highlightedEvent)

function handleCloseEvent()
{
  highlightedEvent.value = null
}


const showCalendars = ref(false)

function handleCloseCalendars()
{
  showCalendars.value = false
}


// calendar options

const defaultCalendarView: CalendarView = "month"
const calendarView = ref<CalendarView>(defaultCalendarView)

const referenceDate = ref(new Date())
const viewDate = computed(() =>
{
  if (calendarView.value == "month")
  {
    return modDate(referenceDate.value, {d: null})
  }
  else if (calendarView.value == "year")
  {
    return modDate(referenceDate.value, {m: null})
  }
  else if (calendarView.value == "week")
  {
    const newDate = modDate(referenceDate.value, {h: null})
    newDate.setUTCDate(newDate.getUTCDate()
      - ((newDate.getUTCDay() - options.value.firstWeekday + 7) % 7))
    return newDate
  }

  return referenceDate.value
})

const viewEndDate = computed(() =>
{
  if (calendarView.value == "month")
  {
    return modDate(viewDate.value, {_m: 1})
  }
  else if (calendarView.value == "year")
  {
    return modDate(viewDate.value, {_y: 1})
  }
  else if (calendarView.value == "week")
  {
    return modDate(viewDate.value, {_d: 7})
  }
  return viewDate.value
})


const mapViewToKey: {[key in CalendarView]: string} = {
  month: 'menoths',
  week: 'wiko',
  year: 'jer',
  agenda: 'a',
}


const mapKeyToView = Object.fromEntries(
  Object.entries(mapViewToKey).map(([k, v]) => [v, k])) as {[key: string]: CalendarView}


watch(() => route.params.view, () =>
{
  const view = route.params.view as CalendarView
  if (!view || typeof view !== 'string' || !mapKeyToView[view])
  {
    calendarView.value = 'month'
    return
  }

  calendarView.value = mapKeyToView[view]
}, { immediate: true })


watch(() => route.params.date, () =>
{
  const rawDate = route.params.date
  if (!rawDate || typeof rawDate !== 'string')
  {
    referenceDate.value = new Date()
    return
  }
  const dateArray = rawDate.split('-').map(v => parseInt(v)) as [number]|[number,number]
  if (dateArray.length > 1) dateArray[1]!--
  if (dateArray.length == 1) dateArray.push(0)
  referenceDate.value = new Date(Date.UTC(...(dateArray as [number,number])))
}, { immediate: true })


function setParams(view: CalendarView, date: Date)
{
  let dateString = ''
  const isToday = sameTime(date, new Date(), 'd')
  if (!isToday)
  {
    const y = date.getUTCFullYear()
    const m = (date.getUTCMonth()+1).toString().padStart(2, "0")
    const d = date.getUTCDate().toString().padStart(2, "0")

    if (view == 'month')
      dateString = `${y}-${m}`
    else if (view == 'year')
      dateString = `${y}`
    else if (view == 'week')
      dateString = `${y}-${m}-${d}`
  }

  router.replace({ params: {
    view: isToday && view == defaultCalendarView ? '' : mapViewToKey[view],
    date: dateString
  }})
}

function setView(view: CalendarView)
{
  setParams(view, referenceDate.value)
}

function setDate(date: Date)
{
  setParams(calendarView.value, date)
}


function goCurrent()
{
  setDate(new Date())
}

function goDirection(value: number)
{
  const newDate = new Date(referenceDate.value)
  if (calendarView.value == "month")
  {
    newDate.setUTCMonth(newDate.getUTCMonth() + value)
    newDate.setUTCDate(1)
  }
  else if (calendarView.value == "year")
  {
    newDate.setUTCFullYear(newDate.getUTCFullYear() + value)
    newDate.setUTCMonth(0)
    newDate.setUTCDate(1)
  }
  else if (calendarView.value == "week")
  {
    newDate.setUTCDate((newDate.getUTCDate() - (newDate.getUTCDay())) + (7 * value))
  }
  setDate(newDate)
}

function goBack()
{
  goDirection(-1)
}

function goForward()
{
  goDirection(1)
}


// calendar events

const url = '/api/event.php'

const calendarEvents = ref<CalendarEvent[]>([])
provide(calendarEventsKey, calendarEvents)

const calendars = ref<Calendar[]>([])
const calendarMap = computed(() =>
{
  return Object.fromEntries(calendars.value.map((cal =>
    [ cal.key, cal ])))
})

const calendarData = ref<CalendarData>()

function processEvent(eventData: EventData): CalendarEvent[]
{
  const calendarObject = calendarMap.value[eventData.calendar_key]
  if (!calendarObject) return []
  if (excludedCalendars.value.includes(calendarObject.key)) return []

  let dates: Date[] = getDatesFromMethod(
    eventData.start_method, eventData.start_args,
    viewDate.value, viewEndDate.value)

  return dates.map(dtfrom => {

    let dtto = new Date(dtfrom)
    if (!eventData.end_method)
    {
      dtto.setUTCDate(dtto.getUTCDate()+1)
    }

    dtto.setUTCMilliseconds(dtto.getUTCMilliseconds()-1)

    return {
      title: eventData.title,
      description: eventData.description
        .replaceAll('<GN>', () =>
          toGoldenNumber(getLunarYear(dtfrom)).toString()),
      calendar: calendarObject,
      dtfrom,
      dtto,
      position: null
    }
  })
}


function processCalendarData()
{
  if (!calendarData.value) return
  calendars.value = calendarData.value.calendars

  calendarEvents.value = []
  calendarData.value.events.forEach((event => {
    calendarEvents.value.push.apply(calendarEvents.value, processEvent(event))
  }))
}

async function downloadCalendarData()
{
  const response = await fetch(url)
  calendarData.value = await response.json() as CalendarData
  processCalendarData()
}

downloadCalendarData()
watch(viewDate, processCalendarData)
watch(excludedCalendars, processCalendarData)

</script>

<template>
<div class="article" :lang="isGothicScript ? 'got-Goth' : 'got-Latn'">
  <div id="header">
    <div class="header-title">
      <h1><RouterLink to="/">{{ t('ui.site_title') }}</RouterLink></h1>
    </div>
  </div>
  <div>
    <div id="display" v-if="calendarData">
      <div class="calendar">
        <div class="calendar-options">
          <div class="section left">
            <div class="calendar-options-group">
              <button :class='["options-button", "icon", {active: showOptions}]'  @click="showOptions = true"><div></div></button>
            </div>
            <div class="calendar-options-group">
              <button :class='["calendar-filter-button", "icon", {active: showCalendars}]' @click="showCalendars = true"><div></div></button>
            </div>
          </div>
          <div class="section">
            <div class="calendar-options-group">
              <button class='icon' @click="goBack"> < </button>
              <button @click="goCurrent">{{ $t('ui.button_today') }}</button>
              <button class='icon' @click="goForward"> > </button>
            </div>
          </div>
          <div class="section right">
            <div class="calendar-options-group">
              <button :class="{active: calendarView=='month'}" @click="setView('month')">{{ $t('ui.button_month_view') }}</button>
              <button :class="{active: calendarView=='week'}" @click="setView('week')">{{ $t('ui.button_list_view') }}</button>
              <button :class="{active: calendarView=='year'}" @click="setView('year')">{{ $t('ui.button_year_view') }}</button>
            </div>
          </div>
        </div>
        <div class="calendar-view-month" v-if="calendarView == 'month'">
          <CalendarList v-if="displayListView"
            :start="viewDate"
            mode="month"
            :compact="isCompactListView"
            :displayYearInTitle="true"></CalendarList>
          <CalendarGrid v-else
            :displayYearInTitle="true"
            :grid-month="viewDate"></CalendarGrid>
        </div>
        <div class="calendar-view-year" v-else-if="calendarView == 'year'">
          <div class="year-title">
            <span v-html="tgv(viewDate.getUTCFullYear())"></span>
          </div>
          <template v-for="(_, m) in 12">
            <CalendarList v-if="displayListView"
              :start="modDate(viewDate, {_m: m})"
              mode="month"
              :compact="isCompactListView"
              :displayYearInTitle="false"></CalendarList>
            <CalendarGrid v-else
              :displayYearInTitle="false"
              :grid-month="modDate(viewDate, {_m: m})"
              :hide-extra-days="true"
              :hide-unused-weeks="true"></CalendarGrid>
          </template>

        </div>
        <div class="calendar-view-week" v-else-if="calendarView == 'week'">
          <CalendarList
            :start="viewDate"
            :compact="isCompactListView"></CalendarList>
        </div>
      </div>
    </div>
  </div>
  <Options v-if="showOptions" v-model="options" @close="handleCloseOptions"></Options>
  <Event v-if="highlightedEvent" :event="highlightedEvent" @close="handleCloseEvent"></Event>
  <Calendars v-if="showCalendars" :calendars="calendars" @close="handleCloseCalendars"></Calendars>
  <div id="footer" lang="en">
    <div></div>
    <div>
      <span class="no-wrap">By <a href="https://2sh.me/gothic">2sh</a> (2026)</span>
      <span class="no-wrap" v-if="themeCredits[theme]">Theme by <span v-html="themeCredits[theme]"></span>.</span>
    </div>
  </div>
</div>
</template>
