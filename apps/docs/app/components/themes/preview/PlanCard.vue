<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Radio, RadioGroup } from '@/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Slider } from '@/ui/slider'

const plans = [
  { value: 'starter', label: 'Starter', description: 'For individuals.' },
  { value: 'pro', label: 'Pro', description: 'For small teams.' },
]

const plan = ref('pro')
const budget = ref(40)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Plan</CardTitle>
      <CardDescription>Change it at any time.</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <RadioGroup v-model="plan" variant="card" orientation="horizontal">
          <Field v-for="option in plans" :key="option.value" orientation="horizontal">
            <Radio :value="option.value" />
            <FieldContent>
              <FieldLabel>{{ option.label }}</FieldLabel>
              <FieldDescription>{{ option.description }}</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
        <Field>
          <FieldLabel>Monthly budget</FieldLabel>
          <Slider v-model="budget" :max="100" />
          <FieldDescription>${{ budget * 10 }} a month.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Billing country</FieldLabel>
          <Select default-value="fi">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="fi">Finland</SelectItem>
              <SelectItem value="jp">Japan</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter class="justify-end gap-2">
      <Button variant="ghost" color="neutral">Cancel</Button>
      <Button>Save</Button>
    </CardFooter>
  </Card>
</template>
