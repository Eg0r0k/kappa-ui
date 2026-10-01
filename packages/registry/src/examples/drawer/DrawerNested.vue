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
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline" color="neutral">Account</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Account</DrawerTitle>
        <DrawerDescription>A drawer opened from here stacks on top, and this one steps back.</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <p class="text-body-md">Signed in as ada@example.com on three devices.</p>
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button variant="outline" color="neutral">Close</Button>
        </DrawerClose>
        <Drawer>
          <DrawerTrigger as-child>
            <Button>Security</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Security</DrawerTitle>
              <DrawerDescription>Swipe this drawer down and the one behind follows it back.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <ul class="flex list-disc flex-col gap-1 ps-5 text-body-md">
                <li>A passkey on this device</li>
                <li>Two-factor codes from an app</li>
                <li>Three signed-in devices</li>
              </ul>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button>Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
