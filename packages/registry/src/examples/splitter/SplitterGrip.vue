<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter>
      <SplitterPanel :default-size="50" :min-size="20" class="flex items-center justify-center text-body-md">
        Left
      </SplitterPanel>
      <SplitterHandle grip />
      <SplitterPanel :default-size="50" :min-size="20" class="flex items-center justify-center text-body-md">
        Right
      </SplitterPanel>
    </Splitter>
  </div>
</template>
