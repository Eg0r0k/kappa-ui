<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
</script>

<template>
  <Accordion type="single" class="max-w-lg">
    <AccordionItem value="basic">
      <AccordionTrigger>Basic plan</AccordionTrigger>
      <AccordionContent>Three projects and a week of history.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="team" disabled>
      <AccordionTrigger>Team plan (coming soon)</AccordionTrigger>
      <AccordionContent>Shared projects and roles.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="pro">
      <AccordionTrigger>Pro plan</AccordionTrigger>
      <AccordionContent>Unlimited projects and a year of history.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
