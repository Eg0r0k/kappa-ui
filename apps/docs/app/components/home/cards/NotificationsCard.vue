<script setup lang="ts">
import { reactive } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Switch } from '@/ui/switch'

const enabled = reactive({ comments: true, mentions: true, digest: false })

const settings = [
  { key: 'comments', title: 'Comments', description: 'Replies to your posts and threads.' },
  { key: 'mentions', title: 'Mentions', description: 'When someone @mentions you.' },
  { key: 'digest', title: 'Weekly digest', description: 'A summary of activity every Monday.' },
] as const
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Choose what we email you about.</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup class="gap-4">
        <Field v-for="setting in settings" :key="setting.key" orientation="horizontal">
          <FieldContent>
            <FieldLabel>{{ setting.title }}</FieldLabel>
            <FieldDescription>{{ setting.description }}</FieldDescription>
          </FieldContent>
          <Switch v-model="enabled[setting.key]" />
        </Field>
      </FieldGroup>
    </CardContent>
  </ShowcaseCard>
</template>
