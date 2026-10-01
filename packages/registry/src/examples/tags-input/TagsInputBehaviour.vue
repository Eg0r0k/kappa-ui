<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

const recipients = ref(["ada@example.com"]);
const refused = ref<string>();
</script>

<template>
  <Field class="w-full max-w-sm">
    <FieldLabel>Recipients</FieldLabel>
    <TagsInput
      v-model="recipients"
      :delimiter="/[,;\s]/"
      :max="5"
      add-on-paste
      add-on-blur
      @invalid="refused = $event"
      @add-tag="refused = undefined"
    >
      <TagsInputItem v-for="recipient in recipients" :key="recipient" :value="recipient">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput placeholder="Add an address" />
    </TagsInput>
    <FieldDescription>
      {{
        refused
          ? `"${refused}" was not added.`
          : `${recipients.length} of 5. Comma, space or Enter adds one; paste a list.`
      }}
    </FieldDescription>
  </Field>
</template>
