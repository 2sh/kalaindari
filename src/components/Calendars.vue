<script setup lang="ts">

import { inject, ref, watch } from 'vue'
import Window from '../components/Window.vue'
import { excludedCalendarsKey, toRepStringKey } from '@/symbols'
import type { Calendar } from '@/types'

const emit = defineEmits(['close'])

const tgt = inject(toRepStringKey)!

const props = defineProps<{
  calendars: Calendar[]
}>()

const excludedCalendars = inject(excludedCalendarsKey)!

const allCalendarKeys = props.calendars.map(cal => cal.key)
const includedCalendars = ref(
  allCalendarKeys.filter(x => !excludedCalendars.value.includes(x))
)
watch(includedCalendars, () =>
  excludedCalendars.value = allCalendarKeys.filter(x => !includedCalendars.value.includes(x)))

</script>

<template>
<Window @close="$emit('close')" class="calendars-window">
  <template #title>
    <p>{{ $t('ui.calendars_title') }}</p>
  </template>
  <template #default>

    <div class="window-form-section">

      <div class="window-form-input-section" v-for="calendar in props.calendars">
        <div class="window-form-label" v-html="tgt(calendar.name)"></div>
        <div class="window-form-value">
          <input type="checkbox"
            :value='calendar.key'
            :true-value="false"
            :false-value="true"
            v-model="includedCalendars">
        </div>
      </div>

    </div>

  </template>
</Window>
</template>
