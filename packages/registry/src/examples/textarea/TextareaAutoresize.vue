<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";

const message = ref("It grows as you type.\nPress Enter a few times.");
</script>

<template>
  <Field class="w-full max-w-sm">
    <FieldLabel>Message</FieldLabel>
    <Textarea v-model="message" autoresize :rows="2" :maxrows="6" />
    <FieldDescription>From 2 to 6 rows, then it scrolls.</FieldDescription>
  </Field>
</template>
