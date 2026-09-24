<script setup lang="ts">
import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" color="neutral">Dimensions</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <h4 class="text-title-sm">Dimensions</h4>
          <p class="text-body-sm text-muted-foreground">Set the dimensions for the layer.</p>
        </div>
        <div class="grid gap-2">
          <Field v-for="dimension in ['Width', 'Max. width', 'Height', 'Max. height']" :key="dimension" orientation="horizontal" class="grid grid-cols-3 items-center gap-4">
            <FieldLabel>{{ dimension }}</FieldLabel>
            <Input size="sm" class="col-span-2" :default-value="dimension.includes('Max') ? 'none' : '100%'" />
          </Field>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
