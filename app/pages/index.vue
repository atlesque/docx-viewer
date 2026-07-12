<script setup lang="ts">
const ZOOM_MIN = 0.25
const ZOOM_MAX = 3.0
const ZOOM_STEP = 0.1

const isDraggingOver = ref(false)
const isRendering = ref(false)
const hasDocument = ref(false)
const errorMessage = ref('')
const docxContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const zoom = ref(1)

const zoomPercent = computed(() => Math.round(zoom.value * 100))
const canZoomIn = computed(() => zoom.value < ZOOM_MAX)
const canZoomOut = computed(() => zoom.value > ZOOM_MIN)

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDraggingOver.value = true
}

function handleDragLeave(event: DragEvent) {
  if (!event.currentTarget || !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    isDraggingOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDraggingOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    loadFile(file)
  }
}

function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    loadFile(file)
  }
  target.value = ''
}

function zoomIn() {
  zoom.value = Math.min(ZOOM_MAX, zoom.value + ZOOM_STEP)
}

function zoomOut() {
  zoom.value = Math.max(ZOOM_MIN, zoom.value - ZOOM_STEP)
}

function resetZoom() {
  zoom.value = 1
}

function fitToScreen() {
  if (!docxContainerRef.value) return
  const wrapper = docxContainerRef.value.querySelector('.docx-render') as HTMLElement | null
  if (!wrapper) return

  // Measure natural width at scale 1
  const prevTransform = wrapper.style.transform
  const prevOrigin = wrapper.style.transformOrigin
  wrapper.style.transform = 'scale(1)'
  wrapper.style.transformOrigin = 'top center'
  const naturalWidth = wrapper.offsetWidth
  wrapper.style.transform = prevTransform
  wrapper.style.transformOrigin = prevOrigin

  if (naturalWidth === 0) return

  const containerWidth = docxContainerRef.value.clientWidth
  // Leave some horizontal padding (32px total)
  const availableWidth = containerWidth - 32
  if (availableWidth <= 0) return

  const fitZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, availableWidth / naturalWidth))
  zoom.value = Math.round(fitZoom * 100) / 100
}

function applyZoom() {
  if (!docxContainerRef.value) return
  const wrapper = docxContainerRef.value.querySelector('.docx-render') as HTMLElement | null
  if (wrapper) {
    wrapper.style.transform = `scale(${zoom.value})`
    wrapper.style.transformOrigin = 'top center'
  }
}

watch(zoom, () => {
  applyZoom()
})

async function loadFile(file: File) {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    errorMessage.value = 'Only .docx files are supported.'
    return
  }
  errorMessage.value = ''
  isRendering.value = true
  hasDocument.value = false

  try {
    const { renderAsync } = await import('docx-preview')
    const arrayBuffer = await file.arrayBuffer()
    hasDocument.value = true
    // Wait for next tick so the container is in the DOM
    await nextTick()
    if (docxContainerRef.value) {
      await renderAsync(arrayBuffer, docxContainerRef.value, undefined, {
        className: 'docx-render',
        inWrapper: true,
      })
      await nextTick()
      fitToScreen()
    }
  } catch {
    errorMessage.value = 'Failed to render document. Please try a different file.'
    hasDocument.value = false
  } finally {
    isRendering.value = false
  }
}

useHead({
  title: 'DOCX Viewer',
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
    <input
      ref="fileInputRef"
      type="file"
      accept=".docx"
      class="hidden"
      @change="handleFileInput"
    />

    <!-- Drop zone -->
    <div
      v-if="!hasDocument && !isRendering"
      class="flex-1 flex items-center justify-center cursor-pointer select-none px-4"
      @click="openFileDialog"
    >
      <div class="flex flex-col items-center gap-3 text-gray-500 pointer-events-none text-center">
        <UIcon name="i-lucide-file-text" class="size-16 sm:size-20 text-blue-500" />
        <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Drop a .docx file here
        </p>
        <p class="text-sm sm:text-base text-gray-500">
          or click anywhere to browse
        </p>
        <p v-if="errorMessage" class="text-sm font-medium text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isRendering"
      class="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500"
    >
      <UIcon name="i-lucide-loader-circle" class="size-12 text-blue-500 animate-spin" />
      <p>Loading document…</p>
    </div>

    <!-- Document view -->
    <div v-show="hasDocument" class="flex-1 flex flex-col overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center gap-2 p-3 border-b border-gray-200 bg-white flex-wrap">
        <UButton
          icon="i-lucide-folder-open"
          variant="outline"
          color="neutral"
          size="sm"
          class="shrink-0"
          @click="openFileDialog"
        >
          <span class="hidden sm:inline ml-1">Open file</span>
        </UButton>

        <div class="w-px h-6 bg-gray-300 shrink-0 hidden sm:block" />

        <div class="flex items-center gap-1 shrink-0">
          <UButton
            icon="i-lucide-zoom-out"
            variant="ghost"
            color="neutral"
            size="sm"
            :disabled="!canZoomOut"
            aria-label="Zoom out"
            @click="zoomOut"
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
            @click="zoomIn"
          />
          <UButton
            icon="i-lucide-maximize-2"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Fit to screen"
            @click="fitToScreen"
          />
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            :disabled="zoom === 1"
            aria-label="Reset zoom"
            @click="resetZoom"
          >
            <UIcon name="i-lucide-rotate-ccw" class="size-4" />
            <span class="hidden sm:inline ml-1 text-xs">Reset</span>
          </UButton>
        </div>
      </div>

      <div ref="docxContainerRef" class="flex-1 overflow-auto px-2 sm:px-4 pb-4" />
    </div>
  </div>
</template>
