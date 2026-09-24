<script setup lang="ts">
import { Button } from "@/ui/button";
import { Kbd, KbdGroup } from "@/ui/kbd";
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-3">
    <Button aria-keyshortcuts="Control+S">
      Save
      <KbdGroup aria-hidden="true">
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>
    </Button>
    <Button variant="outline" color="neutral" aria-keyshortcuts="Meta+K">
      Search
      <Kbd aria-hidden="true">⌘K</Kbd>
    </Button>
    <Button variant="soft" size="sm" aria-keyshortcuts="Enter">
      Accept
      <Kbd aria-hidden="true">⏎</Kbd>
    </Button>
    <Button variant="ghost" color="destructive" size="sm" aria-keyshortcuts="Delete">
      Delete
      <Kbd aria-hidden="true">Del</Kbd>
    </Button>
  </div>
</template>
