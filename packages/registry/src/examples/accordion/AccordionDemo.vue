<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";

const questions = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Orders ship within two working days and arrive three to five days later.",
  },
  {
    value: "returns",
    question: "Can I return an item?",
    answer: "Yes, within 30 days of delivery, as long as it is unused and in its original packaging.",
  },
  {
    value: "support",
    question: "How do I reach support?",
    answer: "Write to the support address in your order email; we answer within one working day.",
  },
];
</script>

<template>
  <Accordion type="single" default-value="shipping" class="max-w-lg">
    <AccordionItem v-for="item in questions" :key="item.value" :value="item.value">
      <AccordionTrigger>{{ item.question }}</AccordionTrigger>
      <AccordionContent>{{ item.answer }}</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
