<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";

const sections = [
  {
    value: "billing",
    title: "Billing",
    text: "You are billed on the first of each month. Each invoice lists every seat and add-on, and a copy is emailed to the billing contact.",
  },
  {
    value: "seats",
    title: "Seats",
    text: "Adding a seat charges the remaining days of the month at once; removing one credits the next invoice.",
  },
  {
    value: "taxes",
    title: "Taxes",
    text: "Enter a VAT number to have it printed on the invoice and to apply the reverse charge where it is due.",
  },
];
</script>

<template>
  <div class="flex max-w-lg flex-col gap-3">
    <p class="text-body-sm text-muted-foreground">Press Ctrl+F (⌘F on a Mac) and search for “invoice”.</p>
    <Accordion type="single">
      <AccordionItem v-for="section in sections" :key="section.value" :value="section.value">
        <AccordionTrigger>{{ section.title }}</AccordionTrigger>
        <AccordionContent>{{ section.text }}</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
