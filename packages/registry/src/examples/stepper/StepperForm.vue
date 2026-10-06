<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, getInput, useForm, validate } from "@formisch/vue";
import { Check, Circle, Dot } from "@lucide/vue";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/ui/stepper";
import { useToast } from "@/ui/toast";

const Details = v.object({
  fullName: v.pipe(v.string(), v.nonEmpty("Enter your name.")),
  email: v.pipe(v.string(), v.email("Enter a valid email address.")),
});

const Password = v.pipe(
  v.object({
    password: v.pipe(v.string(), v.minLength(8, "Use at least 8 characters.")),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "Passwords must match.",
    ),
    ["confirmPassword"],
  ),
);

const Drink = v.object({
  favoriteDrink: v.pipe(v.string("Choose a drink."), v.nonEmpty("Choose a drink.")),
});

const steps = [
  { step: 1, title: "Your details", description: "Provide your name and email" },
  { step: 2, title: "Your password", description: "Choose a password" },
  { step: 3, title: "Your favourite drink", description: "Choose a drink" },
];

const details = useForm({ schema: Details, initialInput: { fullName: "", email: "" } });
const password = useForm({ schema: Password, initialInput: { password: "", confirmPassword: "" } });
const drink = useForm({ schema: Drink, initialInput: { favoriteDrink: "" } });

const step = ref(1);
const toast = useToast();

const element = (control: Element | ComponentPublicInstance | null) =>
  control && "$el" in control ? control.$el : control;

const validateStep = (current: number) =>
  current === 1 ? validate(details) : current === 2 ? validate(password) : validate(drink);

const go = async (to: number | undefined) => {
  if (to === undefined) return;
  if (to > step.value && !(await validateStep(step.value)).success) return;
  step.value = to;
};

const finish: SubmitHandler<typeof Drink> = (output) => {
  toast.add({
    title: "Account created",
    description: `Welcome, ${getInput(details).fullName}. We will keep the ${output.favoriteDrink} ready.`,
  });
};
</script>

<template>
  <Stepper
    v-slot="{ isFirstStep, isLastStep }"
    :model-value="step"
    class="w-full max-w-lg flex-col gap-6"
    @update:model-value="go"
  >
    <div class="flex w-full gap-2">
      <StepperItem
        v-for="item in steps"
        :key="item.step"
        v-slot="{ state }"
        :step="item.step"
        class="relative flex w-full flex-col items-center justify-center"
      >
        <StepperSeparator
          v-if="item.step < steps.length"
          class="absolute top-[17px] right-[calc(-50%+10px)] left-[calc(50%+20px)] group-data-[state=completed]:bg-primary"
        />
        <StepperTrigger as-child>
          <Button
            :variant="state === 'inactive' ? 'outline' : 'solid'"
            size="icon-md"
            class="z-10 rounded-full"
            :class="state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background'"
          >
            <Check v-if="state === 'completed'" class="size-5" />
            <Circle v-else-if="state === 'active'" />
            <Dot v-else />
          </Button>
        </StepperTrigger>
        <div class="mt-5 flex flex-col items-center text-center">
          <StepperTitle :class="state === 'active' && 'text-primary'">{{ item.title }}</StepperTitle>
          <StepperDescription :class="state === 'active' && 'text-primary'" class="sr-only md:not-sr-only">
            {{ item.description }}
          </StepperDescription>
        </div>
      </StepperItem>
    </div>

    <Form v-if="step === 1" id="stepper-form" :of="details" @submit="step = 2">
      <FieldGroup>
        <FormischField v-slot="field" :of="details" :path="['fullName']">
          <Field :invalid="field.errors !== null">
            <FieldLabel>Full name</FieldLabel>
            <Input
              v-model="field.input"
              v-bind="field.props"
              :ref="(control) => field.props.ref(element(control))"
              autocomplete="name"
            />
            <FieldError :errors="field.errors" />
          </Field>
        </FormischField>
        <FormischField v-slot="field" :of="details" :path="['email']">
          <Field :invalid="field.errors !== null">
            <FieldLabel>Email</FieldLabel>
            <Input
              v-model="field.input"
              v-bind="field.props"
              :ref="(control) => field.props.ref(element(control))"
              type="email"
              autocomplete="email"
            />
            <FieldError :errors="field.errors" />
          </Field>
        </FormischField>
      </FieldGroup>
    </Form>

    <Form v-else-if="step === 2" id="stepper-form" :of="password" @submit="step = 3">
      <FieldGroup>
        <FormischField v-slot="field" :of="password" :path="['password']">
          <Field :invalid="field.errors !== null">
            <FieldLabel>Password</FieldLabel>
            <Input
              v-model="field.input"
              v-bind="field.props"
              :ref="(control) => field.props.ref(element(control))"
              type="password"
              autocomplete="new-password"
            />
            <FieldError :errors="field.errors" />
          </Field>
        </FormischField>
        <FormischField v-slot="field" :of="password" :path="['confirmPassword']">
          <Field :invalid="field.errors !== null">
            <FieldLabel>Confirm password</FieldLabel>
            <Input
              v-model="field.input"
              v-bind="field.props"
              :ref="(control) => field.props.ref(element(control))"
              type="password"
              autocomplete="new-password"
            />
            <FieldError :errors="field.errors" />
          </Field>
        </FormischField>
      </FieldGroup>
    </Form>

    <Form v-else id="stepper-form" :of="drink" @submit="finish">
      <FormischField v-slot="field" :of="drink" :path="['favoriteDrink']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Drink</FieldLabel>
          <Select v-model="field.input" :name="field.props.name">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Choose a drink" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="tea">Tea</SelectItem>
              <SelectItem value="soda">Soda</SelectItem>
            </SelectContent>
          </Select>
          <FieldError :errors="field.errors" />
        </Field>
      </FormischField>
    </Form>

    <div class="flex items-center justify-between">
      <Button type="button" variant="outline" color="neutral" size="sm" :disabled="isFirstStep" @click="step -= 1">
        Back
      </Button>
      <Button type="submit" form="stepper-form" size="sm">{{ isLastStep ? "Submit" : "Next" }}</Button>
    </div>
  </Stepper>
</template>
