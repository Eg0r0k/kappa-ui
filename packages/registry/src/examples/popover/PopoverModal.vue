<script setup lang="ts">
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" color="neutral">Non-modal</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p class="text-body-md">The page stays live: an outside click closes this and also reaches what it lands on.</p>
      </PopoverContent>
    </Popover>
    <Popover modal>
      <PopoverTrigger as-child>
        <Button variant="outline" color="neutral">Modal</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p class="text-body-md">The page is shut: an outside click only closes this, and the page does not scroll.</p>
      </PopoverContent>
    </Popover>
  </div>
</template>
