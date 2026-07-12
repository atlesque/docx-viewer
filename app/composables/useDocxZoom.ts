const ZOOM_MIN = 0.25
const ZOOM_MAX = 3.0
const ZOOM_STEP = 0.1

/**
 * Composable for managing zoom level on the rendered document.
 */
export function useDocxZoom(containerRef: Ref<HTMLElement | null>) {
  const zoom = ref(1)

  const zoomPercent = computed(() => Math.round(zoom.value * 100))
  const canZoomIn = computed(() => zoom.value < ZOOM_MAX)
  const canZoomOut = computed(() => zoom.value > ZOOM_MIN)
  const isAtDefault = computed(() => zoom.value === 1)

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
    if (!containerRef.value) return
    const el = containerRef.value
    const docxRender = el.querySelector('.docx-render') as HTMLElement | null
    if (!docxRender) return

    // Measure natural width of the document content at scale 1
    const prevTransform = el.style.transform
    const prevHeight = el.style.height
    el.style.transform = 'scale(1)'
    el.style.height = ''
    const naturalWidth = docxRender.offsetWidth
    el.style.transform = prevTransform
    el.style.height = prevHeight

    if (naturalWidth === 0) return

    const containerWidth = el.parentElement?.clientWidth ?? el.clientWidth
    const availableWidth = containerWidth - 32
    if (availableWidth <= 0) return

    const fitZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, availableWidth / naturalWidth))
    zoom.value = Math.round(fitZoom * 100) / 100
  }

  function applyZoom() {
    if (!containerRef.value) return
    const el = containerRef.value
    const z = zoom.value

    el.style.transformOrigin = 'top center'

    if (z === 1) {
      el.style.transform = ''
      el.style.height = ''
      return
    }

    // Temporarily reset to measure natural height
    el.style.transform = 'scale(1)'
    el.style.height = ''
    // Force layout recalculation
    const naturalHeight = el.scrollHeight
    el.style.transform = `scale(${z})`
    el.style.height = `${Math.round(naturalHeight * z)}px`
  }

  watch(zoom, applyZoom)

  // When the container first appears (after render), apply zoom immediately
  watch(containerRef, (el) => {
    if (el) applyZoom()
  })

  return {
    zoom,
    zoomPercent,
    canZoomIn,
    canZoomOut,
    isAtDefault,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    applyZoom,
  }
}
