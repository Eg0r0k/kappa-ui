<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/ui/menubar";

const name = ref("Roadmap 2026.md");
const renaming = ref(false);
const deleting = ref(false);
const error = ref("");
const search = useTemplateRef<InstanceType<typeof Input>>("search");
const fileTrigger = useTemplateRef<InstanceType<typeof MenubarTrigger>>("fileTrigger");

const rename = (event: Event) => {
  const value = String(new FormData(event.target as HTMLFormElement).get("name") ?? "").trim();
  if (!value) {
    error.value = "Give the file a name.";
    return;
  }
  name.value = value;
  error.value = "";
  renaming.value = false;
};

// The menu item is gone by the time a dialog closes, so send focus back to the bar
const backToBar = (event: Event) => {
  event.preventDefault();
  (fileTrigger.value?.$el as HTMLElement | undefined)?.focus();
};
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <div class="flex items-center gap-3">
      <Menubar aria-label="Document" size="sm">
        <MenubarMenu>
          <MenubarTrigger ref="fileTrigger">File</MenubarTrigger>
          <MenubarContent class="w-52">
            <MenubarItem @select="renaming = true">
              Rename…
              <MenubarShortcut>F2</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive" @select="deleting = true">Delete…</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent class="w-52">
            <!-- focus that moves out of the menu stays there -->
            <MenubarItem @select="search?.$el.focus()">
              Find…
              <MenubarShortcut>⌘F</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Input ref="search" type="search" size="sm" placeholder="Find in file" aria-label="Find in file" />
    </div>
    <p class="text-body-sm text-muted-foreground">Editing {{ name }}</p>

    <Dialog v-model:open="renaming">
      <DialogContent class="max-w-sm" @close-auto-focus="backToBar">
        <form class="contents" novalidate @submit.prevent="rename">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field :invalid="Boolean(error)" required>
              <FieldLabel>Name</FieldLabel>
              <Input name="name" :default-value="name" autocomplete="off" />
              <FieldError :errors="error" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" color="neutral" @click="renaming = false">Cancel</Button>
            <Button type="submit">Rename</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleting">
      <AlertDialogContent @close-auto-focus="backToBar">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {{ name }}?</AlertDialogTitle>
          <AlertDialogDescription>The file moves to the bin for 30 days.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
