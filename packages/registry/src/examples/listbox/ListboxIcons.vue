<script setup lang="ts">
import { Bell, Mail, MessageSquare } from "@lucide/vue";
import { ref } from "vue";

import { Listbox, ListboxContent, ListboxDescription, ListboxIcon, ListboxItem, ListboxTitle } from "@/ui/listbox";

const channel = ref("email");
</script>

<template>
  <Listbox v-model="channel" aria-label="Notify me by" class="w-full max-w-sm">
    <ListboxItem value="email">
      <ListboxIcon>
        <Mail class="size-5" />
      </ListboxIcon>
      <ListboxContent>
        <ListboxTitle>Email</ListboxTitle>
        <ListboxDescription>A daily digest at 9:00.</ListboxDescription>
      </ListboxContent>
    </ListboxItem>
    <ListboxItem value="push">
      <ListboxIcon>
        <Bell class="size-5" />
      </ListboxIcon>
      <ListboxContent>
        <ListboxTitle>Push</ListboxTitle>
        <ListboxDescription>Right away, on every device.</ListboxDescription>
      </ListboxContent>
    </ListboxItem>
    <ListboxItem value="sms">
      <ListboxIcon>
        <MessageSquare class="size-5" />
      </ListboxIcon>
      <ListboxContent>
        <ListboxTitle>SMS</ListboxTitle>
        <ListboxDescription>Only for security alerts.</ListboxDescription>
      </ListboxContent>
    </ListboxItem>
  </Listbox>
</template>
