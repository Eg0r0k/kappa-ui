<script setup lang="ts">
import { useForm } from "vee-validate";
import { ref, useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Spinner } from "@/ui/spinner";

const members = new Set(["ada@example.com", "grace@example.com"]);

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const Invite = z.object({
  email: z.email("Enter a valid email address."),
  role: z.enum(["viewer", "editor", "admin"], "Choose a role."),
});

const { defineField, errors, handleSubmit, isSubmitting, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(Invite),
  initialValues: { email: "", role: "viewer" },
});

// Closing the dialog moves focus back to the trigger, and that blur would
// validate the field mid-animation. Wait for the submit instead, then follow
// every keystroke once the field is wrong.
const quiet = (state: { errors: string[] }) => ({
  validateOnBlur: false,
  validateOnChange: false,
  validateOnModelUpdate: state.errors.length > 0,
});
const [email, emailAttrs] = defineField("email", quiet);
const [role] = defineField("role");

const open = ref(false);
const invited = ref("");
const form = useTemplateRef("form");

const onOpen = (value: boolean) => {
  if (value) resetForm();
  open.value = value;
};

const submit = handleSubmit(
  async (invite) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (members.has(invite.email)) {
      setFieldError("email", "This email is already a member.");
      await focusFirstInvalid(form.value);
      return;
    }
    invited.value = `Invited ${invite.email} as ${invite.role}.`;
    open.value = false;
  },
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Dialog :open="open" @update:open="onOpen">
      <DialogTrigger as-child>
        <Button variant="outline" color="neutral">Invite member</Button>
      </DialogTrigger>
      <DialogContent class="max-w-sm">
        <form ref="form" novalidate class="contents" @submit="submit">
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>They get an email with a link to join the workspace.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FieldGroup>
              <Field :invalid="!!errors.email" required>
                <FieldLabel>Email</FieldLabel>
                <Input v-model="email" v-bind="emailAttrs" type="email" placeholder="name@example.com" />
                <FieldError :errors="errors.email" />
              </Field>
              <Field :invalid="!!errors.role" required>
                <FieldLabel>Role</FieldLabel>
                <Select v-model="role" name="role">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="item in roles" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError :errors="errors.role" />
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child>
              <Button type="button" variant="outline" color="neutral">Cancel</Button>
            </DialogClose>
            <Button type="submit" :disabled="isSubmitting">
              <Spinner v-if="isSubmitting" />
              {{ isSubmitting ? "Inviting" : "Invite" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ invited }}</p>
  </div>
</template>
