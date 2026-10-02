<script setup lang="ts">
import { Link, Mail, MessageSquare, Pencil, Share2, Trash2 } from "@lucide/vue";

import type { MenuPartSet } from "./menu-parts";

const props = defineProps<{ parts: MenuPartSet }>();
const starred = defineModel<boolean>("starred", { default: false });
const sort = defineModel<string>("sort", { default: "name" });
</script>

<template>
  <component :is="props.parts.Group">
    <component :is="props.parts.Item"><Pencil /> Rename</component>
    <component :is="props.parts.Sub">
      <component :is="props.parts.SubTrigger"><Share2 /> Share</component>
      <component :is="props.parts.SubContent">
        <component :is="props.parts.Item"><Mail /> Mail</component>
        <component :is="props.parts.Item"><MessageSquare /> Messages</component>
        <component :is="props.parts.Item"><Link /> Copy link</component>
      </component>
    </component>
    <component :is="props.parts.CheckboxItem" v-model="starred">Starred</component>
  </component>
  <component :is="props.parts.Separator" />
  <component :is="props.parts.Label">Sort by</component>
  <component :is="props.parts.RadioGroup" v-model="sort">
    <component :is="props.parts.RadioItem" value="name">Name</component>
    <component :is="props.parts.RadioItem" value="date">Date modified</component>
  </component>
  <component :is="props.parts.Separator" />
  <component :is="props.parts.Item" variant="destructive"><Trash2 /> Delete</component>
</template>
