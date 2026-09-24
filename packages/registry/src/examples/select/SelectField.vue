<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const role = ref<string>();
const submitted = ref(false);
</script>

<template>
  <form class="flex w-64 flex-col items-start gap-4" @submit.prevent="submitted = true">
    <Field :invalid="submitted && !role" required class="w-full">
      <FieldLabel>Role</FieldLabel>
      <Select v-model="role" name="role">
        <SelectTrigger>
          <SelectValue placeholder="Choose a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="admin" disabled>Admin</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Admins are added by the account owner.</FieldDescription>
      <FieldError v-if="submitted && !role" errors="Choose a role to continue." />
    </Field>
    <Button type="submit" size="sm">Invite</Button>
  </form>
</template>
