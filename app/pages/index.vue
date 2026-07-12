<script setup lang="ts">
const isDraggingOver = ref(false)
const isRendering = ref(false)
const hasDocument = ref(false)
const errorMessage = ref('')
const docxContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

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
      class="flex-1 flex items-center justify-center cursor-pointer select-none"
      @click="openFileDialog"
    >
      <div class="flex flex-col items-center gap-3 text-gray-500 pointer-events-none">
        <UIcon name="i-lucide-file-text" class="size-20 text-blue-500" />
        <p class="text-2xl font-semibold text-gray-900 dark:text-white">
          Drop a .docx file here
        </p>
        <p class="text-base text-gray-500">
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
      <div class="p-3">
        <UButton
          icon="i-lucide-rotate-ccw"
          variant="outline"
          color="neutral"
          @click="openFileDialog"
        >
          Open file
        </UButton>
      </div>
      <div ref="docxContainerRef" class="flex-1 overflow-auto px-4 pb-4" />
    </div>
  </div>
</template>
