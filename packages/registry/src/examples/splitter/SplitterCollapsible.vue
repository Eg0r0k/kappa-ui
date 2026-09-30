<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Splitter, SplitterHandle, SplitterPanel } from "@/ui/splitter";
</script>

<template>
  <div class="h-64 w-full max-w-xl overflow-hidden rounded-lg border">
    <Splitter>
      <SplitterPanel
        v-slot="{ isCollapsed, collapse, expand }"
        size-unit="px"
        :default-size="200"
        :min-size="150"
        collapsible
        :collapsed-size="48"
        class="flex items-start justify-end p-1.5"
      >
        <Button
          variant="ghost"
          color="neutral"
          size="icon"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="isCollapsed ? expand() : collapse()"
        >
          <component :is="isCollapsed ? PanelLeftOpen : PanelLeftClose" />
        </Button>
      </SplitterPanel>
      <SplitterHandle />
      <SplitterPanel class="flex items-center justify-center text-body-md">Main</SplitterPanel>
    </Splitter>
  </div>
</template>
