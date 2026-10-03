<script setup lang="ts">
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "@lucide/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

import { Button } from "@/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/command";
import { Kbd } from "@/ui/kbd";

const open = ref(false);

const toggle = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
  event.preventDefault();
  open.value = !open.value;
};

onMounted(() => window.addEventListener("keydown", toggle));
onBeforeUnmount(() => window.removeEventListener("keydown", toggle));

const close = () => {
  open.value = false;
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button variant="outline" color="neutral" @click="open = true">Open command palette</Button>
    <span class="text-body-sm text-muted-foreground">or press <Kbd>⌘K</Kbd></span>
  </div>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup>
        <CommandLabel>Suggestions</CommandLabel>
        <CommandItem value="calendar" @select="close"><Calendar /> Calendar</CommandItem>
        <CommandItem value="emoji" @select="close"><Smile /> Search Emoji</CommandItem>
        <CommandItem value="calculator" @select="close"><Calculator /> Calculator</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <CommandLabel>Settings</CommandLabel>
        <CommandItem value="profile" @select="close">
          <User /> Profile
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
        <CommandItem value="billing" @select="close">
          <CreditCard /> Billing
          <CommandShortcut>⌘B</CommandShortcut>
        </CommandItem>
        <CommandItem value="settings" @select="close">
          <Settings /> Settings
          <CommandShortcut>⌘S</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
