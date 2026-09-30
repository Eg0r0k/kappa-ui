<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter>
      <SplitterPanel :default-size="25" :min-size="15" class="flex items-center justify-center text-body-md">
        Left
      </SplitterPanel>
      <SplitterHandle />
      <SplitterPanel :default-size="50" :min-size="30" class="flex items-center justify-center text-body-md">
        Main
      </SplitterPanel>
      <SplitterHandle />
      <SplitterPanel :default-size="25" :min-size="15" class="flex items-center justify-center text-body-md">
        Right
      </SplitterPanel>
    </Splitter>
  </div>
</template>
