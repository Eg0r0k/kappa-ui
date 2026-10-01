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
  DrawerIndent,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";

const messages = [
  ["Grace Hopper", "Compiler notes for Monday"],
  ["Alan Turing", "Re: the imitation game"],
  ["Katherine Johnson", "Trajectory figures attached"],
];
</script>

<template>
  <DrawerIndent class="w-full max-w-sm overflow-hidden rounded-xl ring-1 ring-surface-border">
    <div class="flex flex-col gap-3 p-5">
      <div class="flex items-center justify-between gap-3">
        <span class="text-title-sm">Inbox</span>
        <Drawer>
          <DrawerTrigger as-child>
            <Button size="sm">Compose</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>New message</DrawerTitle>
              <DrawerDescription>The page behind steps back while this drawer is open.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p class="text-body-md">
                In an app, DrawerIndent wraps the whole page, so the real page steps back instead of this mock one.
              </p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button>Send</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <ul class="flex flex-col divide-y divide-border">
        <li v-for="[from, subject] in messages" :key="from" class="flex flex-col py-2.5">
          <span class="text-body-md font-medium">{{ from }}</span>
          <span class="text-body-sm text-muted-foreground">{{ subject }}</span>
        </li>
      </ul>
    </div>
  </DrawerIndent>
</template>
