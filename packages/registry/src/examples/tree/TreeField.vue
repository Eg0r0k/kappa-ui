<script setup lang="ts">
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { z } from "zod";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Tree, TreeItem, TreeItemCheckbox, TreeItemLabel, TreeItemToggle, flattenTree } from "@/ui/tree";

type Permission = { id: string; label: string; children?: Permission[] };

const permissions: Permission[] = [
  {
    id: "content",
    label: "Content",
    children: [
      { id: "content.read", label: "Read posts" },
      { id: "content.publish", label: "Publish posts" },
    ],
  },
  {
    id: "people",
    label: "People",
    children: [
      { id: "people.invite", label: "Invite members" },
      { id: "people.remove", label: "Remove members" },
    ],
  },
];

const Role = z.object({
  permissions: z.array(z.string()).min(1, "Grant at least one permission."),
});

// vee-validate runs one validator per field; this one asks the zod schema.
const fromSchema = (key: keyof typeof Role.shape) => (value: unknown) => {
  const result = Role.shape[key].safeParse(value);
  return result.success || (result.error.issues[0]?.message ?? "Invalid value.");
};

const { defineField, errors, handleSubmit } = useForm({
  initialValues: { permissions: [] as string[] },
  validationSchema: { permissions: fromSchema("permissions") },
});
const [keys] = defineField("permissions");

// The tree's v-model holds nodes; the form keeps the keys of the checked leaves.
const byKey = new Map(flattenTree(permissions).map((permission) => [permission.id, permission]));
const checked = computed<Permission[]>({
  get: () => (keys.value ?? []).flatMap((key) => byKey.get(key) ?? []),
  set: (nodes) => (keys.value = nodes.filter((node) => !node.children).map((node) => node.id)),
});

const saved = ref<string[]>();
const save = handleSubmit((values) => (saved.value = values.permissions));
</script>

<template>
  <form class="flex w-full max-w-xs flex-col items-start gap-4" novalidate @submit="save">
    <Field :invalid="!!errors.permissions" required class="w-full">
      <FieldLabel>Editor permissions</FieldLabel>
      <Tree
        v-model="checked"
        :items="permissions"
        :default-expanded="['content', 'people']"
        multiple
        checkbox
        variant="outline"
        v-slot="{ items }"
      >
        <TreeItem v-for="row in items" :key="row._id" :item="row">
          <TreeItemToggle />
          <TreeItemCheckbox />
          <TreeItemLabel>{{ row.value.label }}</TreeItemLabel>
        </TreeItem>
      </Tree>
      <FieldDescription>Checking a group grants everything in it.</FieldDescription>
      <FieldError :errors="errors.permissions" />
    </Field>
    <Button type="submit" size="sm">Save role</Button>
    <p v-if="saved" class="text-body-sm text-muted-foreground" aria-live="polite">Saved: {{ saved.join(", ") }}</p>
  </form>
</template>
