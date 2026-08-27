<script setup lang="ts">

import { sameTime } from '@/tools'
import type {
  PropsGridDay,
} from '../types'
import { computed, inject } from 'vue'
import { toRepValueKey } from '@/symbols'


const currentDate = new Date()

const tgv = inject(toRepValueKey)!
const props = defineProps<PropsGridDay>()

const notGridMonth = computed(() => !sameTime(props.date, props.gridMonth, 'm'))

</script>

<template>
<div :class="['calendar-grid-day', {
  'current': sameTime(props.date, currentDate, 'd'),
  'not-grid-month': notGridMonth
    }]">
  <div class="cell-border"></div>
  <template v-if="!props.hideDetailsOnOuterMonth || !notGridMonth">
    <div class="header">
      <div class="date"><span v-html="tgv(props.date.getUTCDate())"></span></div>
      <div class="moon">●</div>
    </div>
    <div class="events">
      <slot :date="props.date" :not-grid-month="notGridMonth"></slot>
    </div>
  </template>
</div>
</template>
