<script setup lang="ts">

import { sameTime } from '@/tools'
import type {
  PropsGridDay,
} from '../types'
import { computed, inject } from 'vue'
import { toRepValueKey } from '@/symbols'
import { SearchMoonQuarter } from 'astronomy-engine'


const currentDate = new Date()

const tgv = inject(toRepValueKey)!
const props = defineProps<PropsGridDay>()

const notGridMonth = computed(() => !sameTime(props.date, props.gridMonth, 'm'))

const moonQuarter = computed(() =>
{
  const moonQuarterObject = SearchMoonQuarter(props.date)
  if (sameTime(moonQuarterObject.time.date, props.date, 'd'))
    return moonQuarterObject.quarter
  return null
})

</script>

<template>
<div :class="['calendar-grid-day', {
  'current': sameTime(props.date, currentDate, 'd'),
  'not-grid-month': notGridMonth,
  'is-full-moon': moonQuarter == 2,
    }]">
  <div class="cell-border"></div>
  <template v-if="!props.hideDetailsOnOuterMonth || !notGridMonth">
    <div class="header">
      <div class="date"><span v-html="tgv(props.date.getUTCDate())"></span></div>
      <div class="moon">
        <span v-if="moonQuarter == 0">🌑</span>
        <span v-else-if="moonQuarter == 1">🌓</span>
        <span v-else-if="moonQuarter == 2">🌕</span>
        <span v-else-if="moonQuarter == 3">🌗</span>
      </div>
    </div>
    <div class="events">
      <slot :date="props.date" :not-grid-month="notGridMonth"></slot>
    </div>
  </template>
</div>
</template>
