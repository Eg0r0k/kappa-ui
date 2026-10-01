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
      <Button variant="outline" color="neutral">Add address</Button>
    </DrawerTrigger>
    <DrawerContent>
      <form class="contents" @submit.prevent>
        <DrawerHeader>
          <DrawerTitle>Add address</DrawerTitle>
          <DrawerDescription>On a phone the drawer stays above the keyboard while you type.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <FieldGroup>
            <Field>
              <FieldLabel>Street</FieldLabel>
              <Input autocomplete="street-address" />
            </Field>
            <Field>
              <FieldLabel>City</FieldLabel>
              <Input autocomplete="address-level2" />
            </Field>
            <Field>
              <FieldLabel>Postal code</FieldLabel>
              <Input inputmode="numeric" autocomplete="postal-code" />
            </Field>
          </FieldGroup>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose as-child>
            <Button type="submit">Save</Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerContent>
  </Drawer>
</template>
