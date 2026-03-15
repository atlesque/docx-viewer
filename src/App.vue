<script setup>
import { ref } from 'vue'
import { renderAsync } from 'docx-preview'

const isDraggingOver = ref(false)
const isRendering = ref(false)
const hasDocument = ref(false)
const errorMessage = ref('')
const fileInputRef = ref(null)
const docxContainerRef = ref(null)

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleDragOver(event) {
  event.preventDefault()
  isDraggingOver.value = true
}

function handleDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDraggingOver.value = false
  }
}

function handleDrop(event) {
  event.preventDefault()
  isDraggingOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    loadFile(file)
  }
}

function handleFileInput(event) {
  const file = event.target.files?.[0]
  if (file) {
    loadFile(file)
  }
  event.target.value = ''
}

async function loadFile(file) {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    errorMessage.value = 'Only .docx files are supported.'
    return
  }
  errorMessage.value = ''
  isRendering.value = true
  hasDocument.value = false
  try {
    const arrayBuffer = await file.arrayBuffer()
    hasDocument.value = true
    await renderAsync(arrayBuffer, docxContainerRef.value, null, {
      className: 'docx-render',
      inWrapper: true,
    })
  } catch (err) {
    errorMessage.value = 'Failed to render document. Please try a different file.'
    hasDocument.value = false
  } finally {
    isRendering.value = false
  }
}
</script>

<template>
  <div
    class="app"
    :class="{ 'drag-active': isDraggingOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept=".docx"
      class="file-input"
      @change="handleFileInput"
    />

    <div v-if="!hasDocument && !isRendering" class="drop-zone" @click="openFileDialog">
      <div class="drop-zone-content">
        <svg class="drop-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 8H16a4 4 0 0 0-4 4v40a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V20L40 8Z"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M40 8v12h12M32 28v16M24 36l8 8 8-8"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="drop-title">Drop a .docx file here</p>
        <p class="drop-subtitle">or click anywhere to browse</p>
        <p v-if="errorMessage" class="drop-error">{{ errorMessage }}</p>
      </div>
    </div>

    <div v-if="isRendering" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading document…</p>
    </div>

    <div v-show="hasDocument" class="document-view">
      <button class="back-btn" title="Open another file" @click="openFileDialog">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 4v1m0 0a8 8 0 1 0 8 8M12 5a8 8 0 0 0-8 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path d="M12 3v4l-2-2m2 2 2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Open file
      </button>
      <div ref="docxContainerRef" class="docx-container"></div>
    </div>
  </div>
</template>

<style scoped>
.app {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  transition: background 0.2s;
}

.app.drag-active {
  background: #e8f0fe;
  outline: 4px dashed #4285f4;
  outline-offset: -4px;
}

.file-input {
  display: none;
}

/* ── Drop zone ── */
.drop-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #555;
  pointer-events: none;
}

.drop-icon {
  width: 80px;
  height: 80px;
  color: #4285f4;
}

.drop-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #222;
}

.drop-subtitle {
  font-size: 1rem;
  margin: 0;
  color: #666;
}

.drop-error {
  margin: 0;
  font-size: 0.95rem;
  color: #d93025;
  font-weight: 500;
}

/* ── Loading ── */
.loading-overlay {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #555;
  font-size: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #ddd;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Document view ── */
.document-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  margin: 12px;
  align-self: flex-start;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.back-btn:hover {
  background: #f0f4ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.docx-container {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
}
</style>
