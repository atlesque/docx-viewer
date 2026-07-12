<script setup lang="ts">
defineProps<{
  zoomPercent: number
  canZoomIn: boolean
  canZoomOut: boolean
  isAtDefault: boolean
}>()

const emit = defineEmits<{
  openFile: []
  zoomIn: []
  zoomOut: []
  fitToScreen: []
  resetZoom: []
}>()
</script>

<template>
  <div class="sticky top-0 z-10 flex items-center gap-2 p-3 border-b border-gray-200 bg-white flex-wrap">
    <!-- Open file -->
    <UButton
      icon="i-lucide-folder-open"
      variant="outline"
      color="neutral"
      size="sm"
      class="shrink-0"
      @click="emit('openFile')"
    >
      <span class="hidden sm:inline ml-1">Open file</span>
    </UButton>

    <div class="w-px h-6 bg-gray-300 shrink-0 hidden sm:block" />

    <!-- Zoom controls -->
    <div class="flex items-center gap-1 shrink-0">
      <UButton
        icon="i-lucide-zoom-out"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="!canZoomOut"
        aria-label="Zoom out"
        @click="emit('zoomOut')"
      />
      <span class="text-sm tabular-nums w-12 text-center font-medium select-none">
        {{ zoomPercent }}%
      </span>
      <UButton
        icon="i-lucide-zoom-in"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="!canZoomIn"
        aria-label="Zoom in"
        @click="emit('zoomIn')"
      />
      <UButton
        icon="i-lucide-maximize-2"
        variant="ghost"
        color="neutral"
        size="sm"
        aria-label="Fit to screen"
        @click="emit('fitToScreen')"
      />
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="isAtDefault"
        aria-label="Reset zoom"
        @click="emit('resetZoom')"
      >
        <UIcon name="i-lucide-rotate-ccw" class="size-4" />
        <span class="hidden sm:inline ml-1 text-xs">Reset</span>
      </UButton>
    </div>
  </div>
</template>
