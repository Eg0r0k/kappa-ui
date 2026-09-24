<template>
  <div class="scroll-fade-overlay h-56 w-full max-w-xs overflow-hidden rounded-lg border">
    <div class="h-full overflow-y-auto">
      <p v-for="index in 30" :key="index" class="border-b px-4 py-2 text-body-md last:border-b-0">Message {{ index }}</p>
    </div>
  </div>
</template>
