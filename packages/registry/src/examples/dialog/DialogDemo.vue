<script setup lang="ts">
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
</script>

<template>
  <Dialog title="Edit profile" description="Changes are saved when you press Save.">
    <Button variant="outline" color="neutral">Edit profile</Button>

    <template #body>
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input default-value="Ada Lovelace" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input default-value="@ada" />
        </Field>
      </FieldGroup>
    </template>

    <template #footer="{ close }">
      <Button variant="outline" color="neutral" @click="close">Cancel</Button>
      <Button @click="close">Save</Button>
    </template>
  </Dialog>
</template>
