<script setup lang="ts">

import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

function onPageClick(e: MouseEvent)
{
  if (e.target == null) return
  if(!(e.target as HTMLElement).closest('.window-box'))
  {
    emit('close')
  }
}

onMounted(() =>
{
  document.body.addEventListener('click', onPageClick, true)
  document.body.classList.add('window-is-open')
})

onUnmounted(() =>
{
  document.body.removeEventListener('click', onPageClick)
  document.body.classList.remove('window-is-open')
})

</script>

<template>
<div class="window-section">
  <div class="window-overlay"></div>
  <div class="window-box">

    <div class="window-header">
      <div>
        <slot name="title"></slot>
      </div>
      <div>
        <button class="window-close-button" @click="$emit('close')">X</button>
      </div>
    </div>

    <div class="window-content">
      <slot></slot>
    </div>

  </div>
</div>
</template>
