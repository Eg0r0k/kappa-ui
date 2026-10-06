<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, reset, useForm } from "@formisch/vue";
import * as v from "valibot";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Rating, RatingItem } from "@/ui/rating";
import { Textarea } from "@/ui/textarea";

// The schema, not native `required`, decides that a rating was picked: 0 means none.
const Review = v.object({
  stars: v.pipe(v.number("Pick a rating."), v.minValue(0.5, "Pick a rating.")),
  comment: v.pipe(v.string(), v.maxLength(200, "Keep it under 200 characters.")),
});

const form = useForm({ schema: Review, initialInput: { comment: "" } });
const sent = ref<v.InferOutput<typeof Review>>();

const submit: SubmitHandler<typeof Review> = (output) => {
  sent.value = output;
};
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Review your order</CardTitle>
      <CardDescription>Ceramic pour-over set, delivered on Tuesday.</CardDescription>
    </CardHeader>
    <CardContent>
      <Form id="order-review" :of="form" @submit="submit">
        <FieldGroup>
          <FormischField v-slot="field" :of="form" :path="['stars']">
            <Field :invalid="field.errors !== null" required>
              <FieldLabel>Rating</FieldLabel>
              <Rating v-model="field.input" :step="0.5" hoverable clearable color="warning" v-slot="{ items }">
                <RatingItem v-for="item in items" :key="item" :item="item" />
              </Rating>
              <FieldError :errors="field.errors" />
            </Field>
          </FormischField>
          <FormischField v-slot="field" :of="form" :path="['comment']">
            <Field :invalid="field.errors !== null">
              <FieldLabel>Comment</FieldLabel>
              <Textarea v-model="field.input" autoresize :rows="3" placeholder="What did you like, or not?" />
              <FieldError :errors="field.errors" />
            </Field>
          </FormischField>
        </FieldGroup>
      </Form>
    </CardContent>
    <CardFooter class="justify-between gap-2">
      <p class="text-body-sm text-muted-foreground" aria-live="polite">
        {{ sent ? `Thanks for the ${sent.stars} stars.` : "" }}
      </p>
      <div class="flex gap-2">
        <Button type="button" variant="outline" color="neutral" @click="reset(form)">Reset</Button>
        <Button type="submit" form="order-review">Send review</Button>
      </div>
    </CardFooter>
  </Card>
</template>
