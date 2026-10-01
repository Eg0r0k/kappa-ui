<script setup lang="ts">
import { Button } from "@/ui/button";
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
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Edit profile</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Edit profile</DrawerTitle>
        <DrawerDescription>Changes are saved when you press Save.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
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
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button variant="outline" color="neutral">Cancel</Button>
        </DrawerClose>
        <DrawerClose as-child>
          <Button>Save</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
