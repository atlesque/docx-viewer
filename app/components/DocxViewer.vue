<script setup lang="ts">
import { useDocxLoader } from '~/composables/useDocxLoader'
import { useDocxZoom } from '~/composables/useDocxZoom'

// ── Composables ──────────────────────────────────────────────
const {
  isDraggingOver,
  isRendering,
  hasDocument,
  errorMessage,
  containerRef,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInput,
} = useDocxLoader()

const {
  zoomPercent,
  canZoomIn,
  canZoomOut,
  isAtDefault,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToScreen,
} = useDocxZoom(containerRef)

// ── File dialog ─────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  fileInputRef.value?.click()
}

// ── Fit-to-screen after render completes ────────────────────
watch([hasDocument, isRendering], async ([doc, rendering]) => {
  if (doc && !rendering) {
    await nextTick()
    fitToScreen()
  }
})
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col bg-gray-100 transition-colors"
    :class="{ 'bg-blue-50 outline-4 outline-dashed outline-blue-500 -outline-offset-4': isDraggingOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".docx"
      class="hidden"
      @change="handleFileInput"
    />

    <!-- Empty state / drop zone -->
    <DocxDropZone
      v-if="!hasDocument && !isRendering"
      :error-message="errorMessage"
      @open-file="openFileDialog"
    />

    <!-- Loading state -->
    <div
      v-if="isRendering"
      class="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500"
    >
      <UIcon name="i-lucide-loader-circle" class="size-12 text-blue-500 animate-spin" />
      <p>Loading document…</p>
    </div>

    <!-- Document view -->
    <div v-show="hasDocument" class="flex-1 flex flex-col overflow-hidden">
      <DocxToolbar
        :zoom-percent="zoomPercent"
        :can-zoom-in="canZoomIn"
        :can-zoom-out="canZoomOut"
        :is-at-default="isAtDefault"
        @open-file="openFileDialog"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @fit-to-screen="fitToScreen"
        @reset-zoom="resetZoom"
      />

      <div ref="containerRef" class="flex-1 overflow-auto px-2 sm:px-4 pb-4" />
    </div>
  </div>
</template>
