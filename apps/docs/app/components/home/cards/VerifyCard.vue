<script setup lang="ts">
import { Check } from '@lucide/vue'
import { computed, ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { PinInput, PinInputGroup, PinInputSlot } from '@/ui/pin-input'

const code = ref<(number | undefined)[]>([])
const verified = ref(false)
const resent = ref(false)

const complete = computed(() => code.value.filter((digit) => digit !== undefined).length === 6)

const resend = () => {
  code.value = []
  verified.value = false
  resent.value = true
}
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Verify your email</CardTitle>
      <CardDescription>We sent a 6-digit code to a••••@kappa.dev.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <PinInput
        v-model="code"
        type="number"
        :disabled="verified"
        aria-label="Verification code"
        class="justify-center gap-3"
      >
        <PinInputGroup class="gap-1.5">
          <PinInputSlot v-for="index in [0, 1, 2]" :key="index" :index="index" />
        </PinInputGroup>
        <PinInputGroup class="gap-1.5">
          <PinInputSlot v-for="index in [3, 4, 5]" :key="index" :index="index" />
        </PinInputGroup>
      </PinInput>
      <Button :color="verified ? 'success' : 'primary'" :disabled="!complete" class="w-full" @click="verified = true">
        <Check v-if="verified" data-icon="inline-start" />
        {{ verified ? 'Verified' : 'Verify' }}
      </Button>
    </CardContent>
    <CardFooter class="justify-center gap-1 text-body-sm text-muted-foreground">
      {{ resent ? 'New code sent.' : "Didn't get a code?" }}
      <Button variant="link" size="sm" class="h-auto px-0" @click="resend">Resend code</Button>
    </CardFooter>
  </ShowcaseCard>
</template>
