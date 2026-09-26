<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Separator } from '@/ui/separator'
import { Switch } from '@/ui/switch'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Choose what you hear about.</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>Push notifications</FieldLabel>
            <FieldDescription>Mentions and replies.</FieldDescription>
          </FieldContent>
          <Switch :default-value="true" />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>Weekly digest</FieldLabel>
            <FieldDescription>A summary every Monday.</FieldDescription>
          </FieldContent>
          <Switch />
        </Field>
        <Separator />
        <Field orientation="horizontal">
          <Checkbox :default-value="true" />
          <FieldLabel>Email me about security</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox />
          <FieldLabel>Product news</FieldLabel>
        </Field>
      </FieldGroup>
    </CardContent>
  </Card>
</template>
