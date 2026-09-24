<script setup lang="ts">
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Input } from "@/ui/input";
</script>

<template>
  <form class="w-full max-w-sm" @submit.prevent>
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldGroup>
        <Field required>
          <FieldLabel>Name</FieldLabel>
          <Input autocomplete="name" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input autocomplete="username" />
          <FieldDescription>Shown on your public profile.</FieldDescription>
        </Field>
        <Button type="submit" class="self-start">Save</Button>
      </FieldGroup>
    </FieldSet>
  </form>
</template>
