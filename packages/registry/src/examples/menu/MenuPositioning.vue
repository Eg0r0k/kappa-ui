<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Menu, MenuItem, type MenuPosition } from "@/ui/menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";

const positions: MenuPosition[] = [
  "top start",
  "top middle",
  "top end",
  "center start",
  "center middle",
  "center end",
  "bottom start",
  "bottom middle",
  "bottom end",
];

const anchor = ref<MenuPosition>("bottom start");
const self = ref<MenuPosition>("top start");
const offsetX = ref(0);
const offsetY = ref(4);
const cover = ref(false);
</script>

<template>
  <div class="flex w-full max-w-xl flex-col items-center gap-8">
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel>Anchor</FieldLabel>
        <Select v-model="anchor" :disabled="cover">
          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="position in positions" :key="position" :value="position">{{ position }}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Self</FieldLabel>
        <Select v-model="self" :disabled="cover">
          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="position in positions" :key="position" :value="position">{{ position }}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Offset x: {{ offsetX }}px</FieldLabel>
        <Slider v-model="offsetX" :min="-24" :max="24" :disabled="cover" />
      </Field>
      <Field>
        <FieldLabel>Offset y: {{ offsetY }}px</FieldLabel>
        <Slider v-model="offsetY" :min="-24" :max="24" :disabled="cover" />
      </Field>
      <Field orientation="horizontal">
        <Switch v-model="cover" />
        <FieldLabel>Cover</FieldLabel>
      </Field>
    </div>
    <Button variant="outline" color="neutral" class="w-40">
      Open menu
      <Menu :anchor="anchor" :self="self" :offset="[offsetX, offsetY]" :cover="cover" class="w-44">
        <MenuItem>New tab</MenuItem>
        <MenuItem>New window</MenuItem>
        <MenuItem>Private window</MenuItem>
      </Menu>
    </Button>
  </div>
</template>
