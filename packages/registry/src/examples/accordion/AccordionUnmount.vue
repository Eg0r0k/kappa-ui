<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
</script>

<template>
  <Accordion type="single" unmount-on-hide class="max-w-lg">
    <AccordionItem value="report">
      <AccordionTrigger>Monthly report</AccordionTrigger>
      <AccordionContent>A heavy chart is only mounted while this item is open.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="glossary" :unmount-on-hide="false">
      <AccordionTrigger>Glossary</AccordionTrigger>
      <AccordionContent>Stays in the page while closed, so find in page still reaches it.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
