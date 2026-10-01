<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { ref } from "vue";

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
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";

const open = ref(false);
const wide = useMediaQuery("(min-width: 768px)");
</script>

<template>
  <Dialog v-if="wide" v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Edit profile</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>A dialog from 768px up, a drawer below.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input default-value="Ada Lovelace" />
          </Field>
        </FieldGroup>
      </DialogBody>
      <DialogFooter>
        <DialogClose as-child>
          <Button>Save</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Drawer v-else v-model:open="open">
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Edit profile</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Edit profile</DrawerTitle>
        <DrawerDescription>A dialog from 768px up, a drawer below.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input default-value="Ada Lovelace" />
          </Field>
        </FieldGroup>
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button>Save</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
