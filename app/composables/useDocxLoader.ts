/**
 * Composable for managing .docx file loading and rendering via docx-preview.
 */
export function useDocxLoader() {
  const isDraggingOver = ref(false)
  const isRendering = ref(false)
  const hasDocument = ref(false)
  const errorMessage = ref('')
  const containerRef = ref<HTMLElement | null>(null)

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
    if (file) loadFile(file)
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) loadFile(file)
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
      await nextTick()
      if (containerRef.value) {
        await renderAsync(arrayBuffer, containerRef.value, undefined, {
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

  return {
    isDraggingOver,
    isRendering,
    hasDocument,
    errorMessage,
    containerRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    loadFile,
  }
}
