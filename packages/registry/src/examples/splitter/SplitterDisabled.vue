<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter>
      <SplitterPanel :default-size="30" class="flex items-center justify-center text-body-md">Fixed</SplitterPanel>
      <SplitterHandle disabled />
      <SplitterPanel :default-size="70" class="flex items-center justify-center text-body-md">Main</SplitterPanel>
    </Splitter>
  </div>
</template>
