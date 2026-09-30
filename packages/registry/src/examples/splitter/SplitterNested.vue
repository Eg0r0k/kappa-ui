<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter>
      <SplitterPanel :default-size="30" :min-size="20" class="flex items-center justify-center text-body-md">
        Explorer
      </SplitterPanel>
      <SplitterHandle />
      <SplitterPanel :default-size="70" :min-size="30">
        <Splitter direction="vertical">
          <SplitterPanel :default-size="70" :min-size="20" class="flex items-center justify-center text-body-md">
            Editor
          </SplitterPanel>
          <SplitterHandle />
          <SplitterPanel :default-size="30" :min-size="20" class="flex items-center justify-center text-body-md">
            Terminal
          </SplitterPanel>
        </Splitter>
      </SplitterPanel>
    </Splitter>
  </div>
</template>
