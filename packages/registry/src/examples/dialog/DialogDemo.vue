<script setup lang="ts">
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
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Edit profile</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Changes are saved when you press Save.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input default-value="Ada Lovelace" />
          </Field>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input default-value="@ada" />
          </Field>
        </FieldGroup>
      </DialogBody>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" color="neutral">Cancel</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button>Save</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
