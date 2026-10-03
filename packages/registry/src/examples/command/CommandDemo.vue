<script setup lang="ts">
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "@lucide/vue";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/command";
</script>

<template>
  <Command class="max-w-md border border-border shadow-shadow-md">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup>
        <CommandLabel>Suggestions</CommandLabel>
        <CommandItem value="calendar"><Calendar /> Calendar</CommandItem>
        <CommandItem value="emoji"><Smile /> Search Emoji</CommandItem>
        <CommandItem value="calculator" disabled><Calculator /> Calculator</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <CommandLabel>Settings</CommandLabel>
        <CommandItem value="profile"><User /> Profile <CommandShortcut>⌘P</CommandShortcut></CommandItem>
        <CommandItem value="billing"><CreditCard /> Billing <CommandShortcut>⌘B</CommandShortcut></CommandItem>
        <CommandItem value="settings"><Settings /> Settings <CommandShortcut>⌘S</CommandShortcut></CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
