<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter direction="vertical">
      <SplitterPanel :default-size="40" :min-size="20" class="flex items-center justify-center text-body-md">
        Top
      </SplitterPanel>
      <SplitterHandle />
      <SplitterPanel :default-size="60" :min-size="20" class="flex items-center justify-center text-body-md">
        Bottom
      </SplitterPanel>
    </Splitter>
  </div>
</template>
