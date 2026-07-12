<script setup lang="ts">
defineProps<{
  errorMessage?: string
}>()

const emit = defineEmits<{
  openFile: []
}>()
</script>

<template>
  <div
    class="flex-1 flex items-center justify-center cursor-pointer select-none px-4"
    @click="emit('openFile')"
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
</template>
