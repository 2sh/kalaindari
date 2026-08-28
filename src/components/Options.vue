<script setup lang="ts">

import type {
  Options,
} from '../types'

import Window from '../components/Window.vue'

const options = defineModel<Options>()
const emit = defineEmits(['close'])

</script>

<template>
<Window @close="$emit('close')" lang="en">
  <template #title>
    <p>Preferences</p>
  </template>
  <template #default>

    <template v-if="options">

      <div class="window-form-section" >
        <div class="window-form-input-section">
          <div class="window-form-label">
            Theme
          </div>
          <div class="window-form-value">
            <select v-model="options.theme">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </div>

      <div class="window-form-section">
        <div class="window-form-input-section">
          <div class="window-form-label">
            Gothic script
          </div>
          <div class="window-form-value">
            <input type="checkbox" v-model="options.isGothicScript">
          </div>
        </div>
        <div class="window-form-input-section" v-if="options.isGothicScript">
          <div class="window-form-label">
            Gothic numerals
          </div>
          <div class="window-form-value">
            <input type="checkbox" v-model="options.isGothicNumerals">
          </div>
        </div>
        <div class="window-form-input-section">
          <div class="window-form-label">
            Weekday name set
          </div>
          <div class="window-form-value">
            <select v-model="options.weekdayNameSet">
              <option value="germanic">Germanic</option>
              <option value="alpine">Alpine</option>
              <option value="greek">Greek</option>
            </select>
          </div>
        </div>
      </div>

      <div class="window-form-section">
        <div class="window-form-input-section">
          <div class="window-form-label">
            First Weekday
          </div>
          <div class="window-form-value">
            <select v-model="options.firstWeekday">
              <option :value="0">Sunday</option>
              <option :value="1">Monday</option>
              <option :value="2">Tuesday</option>
              <option :value="3">Wednesday</option>
              <option :value="4">Thursday</option>
              <option :value="5">Friday</option>
              <option :value="6">Saturday</option>
            </select>
          </div>
        </div>
        <div class="window-form-input-section">
          <div class="window-form-label">
            Month calendar mode
          </div>
          <div class="window-form-value">
            <select v-model="options.monthCalendarMode">
              <option value="auto">Auto (Adjust for mobile)</option>
              <option value="full">Full</option>
              <option value="list">List</option>
            </select>
          </div>
        </div>
        <div class="window-form-input-section">
          <div class="window-form-label">
            Compact list view
          </div>
          <div class="window-form-value">
            <input type="checkbox" v-model="options.isCompactListView">
          </div>
        </div>
      </div>

    </template>

  </template>
</Window>
</template>
