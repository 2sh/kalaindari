<script setup lang="ts">

import { inject, type Ref } from 'vue'
import type {
  CalendarEvent,
  Options,
} from '../types'
import { optionsKey, toRepStringKey, toRepValueKey } from '@/symbols'
import { diffInDays } from '@/tools'
import { useTranslation } from 'i18next-vue'

import Window from '../components/Window.vue'

const props = defineProps<{
  event: CalendarEvent
}>()


const { t } = useTranslation()

const options = inject(optionsKey)!
const tgv = inject(toRepValueKey)!
const tgt = inject(toRepStringKey)!


const emit = defineEmits(['close'])

function getEventDate(event: CalendarEvent)
{
  const dayDiff = diffInDays(event.dtfrom, event.dtto)

  const startDay = t(`weekdays_${options.value.weekdayNameSet}.${event.dtfrom.getUTCDay()}.long`)
  const startDate = tgv(event.dtfrom.getUTCDate())
  const startMonth = t(`months.${event.dtfrom.getUTCMonth()}.long`)
  const startYear = tgv(event.dtfrom.getUTCFullYear())

  if (dayDiff <= 1)
    return `${startDay}, ${startDate} ${startMonth} ${startYear}`

  const endDay = t(`weekdays_${options.value.weekdayNameSet}.${event.dtto.getUTCDay()}.long`)
  const endDate = tgv(event.dtto.getUTCDate())
  const endMonth = t(`months.${event.dtto.getUTCMonth()}.long`)
  const endYear = tgv(event.dtto.getUTCFullYear())

  let outStart = "${startDay}, ${startDate}"
  if (startMonth != endMonth)
    outStart += ` ${startMonth}`
  if (startYear != endYear)
    outStart += ` ${startYear}`

  const outEnd = `${endDay}, ${endDate} ${endMonth} ${endYear}`

  return `${outStart} - ${outEnd}`
}

</script>

<template>
<Window @close="$emit('close')">
  <div class="window-event-header" v-html="tgt(props.event.title)"></div>
  <div class="window-event-date" v-html="getEventDate(props.event)"></div>
  <div class="window-event-description" v-html="tgt(props.event.description)"></div>
</Window>
</template>
