<script setup lang="ts">

import { sameDay, sameMonth } from '@/tools'
import type {
  PropsGridDay,
  Tgv,
} from '../types'
import { computed, inject } from 'vue'
import { toRepValueKey } from '@/symbols'


const currentDate = new Date()

const tgv = inject(toRepValueKey)!
const props = defineProps<PropsGridDay>()

const notGridMonth = computed(() => !sameMonth(props.date, props.gridMonth))

</script>

<template>
<div :class="['calendar-grid-day', {
  'current': sameDay(props.date, currentDate),
  'not-grid-month': notGridMonth
    }]">
  <div class="cell-border"></div>
  <template v-if="!props.hideDetailsOnOuterMonth || !notGridMonth">
    <div class="date"><span v-html="tgv(props.date.getUTCDate())"></span></div>
    <div class="events">
      <slot :date="props.date" :not-grid-month="notGridMonth"></slot>
    </div>
  </template>
</div>
</template>
