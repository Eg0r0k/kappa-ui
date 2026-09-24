<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
</script>

<template>
  <Accordion type="multiple" :default-value="['notifications', 'privacy']" class="max-w-lg">
    <AccordionItem value="notifications">
      <AccordionTrigger>Notifications</AccordionTrigger>
      <AccordionContent>Email for mentions and replies, push for direct messages.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="privacy">
      <AccordionTrigger>Privacy</AccordionTrigger>
      <AccordionContent>Your profile is visible to members of your workspaces only.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="sessions">
      <AccordionTrigger>Sessions</AccordionTrigger>
      <AccordionContent>Two devices are signed in: this laptop and a phone.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
