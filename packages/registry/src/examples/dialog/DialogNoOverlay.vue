<script setup lang="ts">
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
</script>

<template>
  <Dialog :overlay="false" title="Quick note" description="The page stays visible behind the window.">
    <Button variant="outline" color="neutral">Open without overlay</Button>

    <template #body>
      <p class="text-body-md text-muted-foreground">
        Nothing dims the page, but it is still shut: a click outside closes the window and goes no further.
      </p>
    </template>
  </Dialog>
</template>
