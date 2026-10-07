<script setup lang="ts">
import { CircleCheck, Send, X } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/ui/alert'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldError, FieldLabel } from '@/ui/field'
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from '@/ui/input-number'
import { Progress, ProgressLabel, ProgressValue } from '@/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Spinner } from '@/ui/spinner'
import { vTooltip } from '@/ui/tooltip'

const limit = 5000
const accounts = [
  { value: 'everyday', label: 'Everyday ••1192' },
  { value: 'savings', label: 'Savings ••4410' },
]
const currency: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
const money = new Intl.NumberFormat('en-US', currency)
const dollars = new Intl.NumberFormat('en-US', { ...currency, maximumFractionDigits: 0 })

const amount = ref<number | undefined>(250)
const account = ref('everyday')
const used = ref(1250)
const sending = ref(false)
const sent = ref<number>()

const sendButton = useTemplateRef<InstanceType<typeof Button>>('sendButton')
const undoButton = useTemplateRef<InstanceType<typeof Button>>('undoButton')

const remaining = computed(() => limit - used.value)
const overLimit = computed(() => (amount.value ?? 0) > remaining.value)
const accountLabel = computed(() => accounts.find((item) => item.value === account.value)?.label)
const usage = computed(() => `${dollars.format(used.value)} of ${dollars.format(limit)} used`)

let timer: ReturnType<typeof setTimeout> | undefined

const send = () => {
  const value = amount.value
  if (!value || overLimit.value) return
  sending.value = true
  timer = setTimeout(async () => {
    used.value += value
    sent.value = value
    sending.value = false
    await nextTick()
    undoButton.value?.$el.focus()
  }, 800)
}

const dismiss = async () => {
  sent.value = undefined
  await nextTick()
  sendButton.value?.$el.focus()
}

const undo = () => {
  used.value -= sent.value ?? 0
  dismiss()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Send money</CardTitle>
      <CardDescription>To Ada Lovelace, arrives instantly.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <Field :invalid="overLimit">
        <FieldLabel>Amount</FieldLabel>
        <InputNumber
          v-model="amount"
          :min="0"
          :step="50"
          :step-snapping="false"
          :format-options="currency"
          locale="en-US"
        >
          <InputNumberDecrement />
          <InputNumberInput />
          <InputNumberIncrement />
        </InputNumber>
        <FieldError v-if="overLimit" :errors="`Only ${dollars.format(remaining)} left today.`" />
      </Field>
      <Field>
        <FieldLabel>From</FieldLabel>
        <Select v-model="account">
          <SelectTrigger>
            <SelectValue>{{ accountLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in accounts" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Progress
        :model-value="used"
        :max="limit"
        size="xs"
        :get-value-text="() => usage"
        :class="{ 'text-warning': remaining < 1000 }"
      >
        <ProgressLabel class="text-label-md">Daily limit</ProgressLabel>
        <ProgressValue class="text-body-sm">{{ usage }}</ProgressValue>
      </Progress>
    </CardContent>
    <CardFooter>
      <Alert v-if="sent !== undefined" variant="soft" color="success" size="sm" orientation="horizontal">
        <CircleCheck />
        <AlertTitle>Sent {{ money.format(sent) }}</AlertTitle>
        <AlertDescription>to Ada Lovelace</AlertDescription>
        <AlertActions>
          <Button ref="undoButton" variant="ghost" color="success" size="xs" @click="undo">Undo</Button>
          <Button
            v-tooltip="'Dismiss'"
            variant="ghost"
            color="success"
            size="icon-xs"
            aria-label="Dismiss"
            @click="dismiss"
          >
            <X />
          </Button>
        </AlertActions>
      </Alert>
      <Button v-else ref="sendButton" class="w-full" :disabled="sending || !amount || overLimit" @click="send">
        <Spinner v-if="sending" />
        <Send v-else data-icon="inline-start" />
        {{ sending ? 'Sending…' : `Send ${money.format(amount ?? 0)}` }}
      </Button>
    </CardFooter>
  </ShowcaseCard>
</template>
