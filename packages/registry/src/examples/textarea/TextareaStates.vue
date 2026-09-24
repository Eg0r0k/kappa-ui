<script setup lang="ts">
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { Textarea } from "@/ui/textarea";
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
    <Field>
      <FieldLabel>Bio</FieldLabel>
      <Textarea placeholder="A few words about you" />
      <FieldDescription>Shown on your profile.</FieldDescription>
    </Field>
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <Textarea default-value="Locked while the review runs." />
    </Field>
    <Field invalid>
      <FieldLabel>Invalid</FieldLabel>
      <Textarea default-value="Too short" />
      <FieldError errors="Write at least 20 characters." />
    </Field>
  </div>
</template>
