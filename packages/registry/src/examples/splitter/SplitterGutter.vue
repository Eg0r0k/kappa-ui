<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl">
    <Splitter>
      <SplitterPanel
        :default-size="35"
        :min-size="20"
        class="flex items-center justify-center rounded-lg border bg-card text-body-md"
      >
        Sidebar
      </SplitterPanel>
      <SplitterHandle variant="gutter" />
      <SplitterPanel
        :default-size="65"
        :min-size="30"
        class="flex items-center justify-center rounded-lg border bg-card text-body-md"
      >
        Main
      </SplitterPanel>
    </Splitter>
  </div>
</template>
