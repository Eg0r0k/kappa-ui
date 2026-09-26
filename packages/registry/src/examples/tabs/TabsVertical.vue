<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

const sections = [
  { value: "general", label: "General", text: "Name, language and time zone." },
  { value: "notifications", label: "Notifications", text: "Email and push preferences." },
  { value: "billing", label: "Billing", text: "Plan, invoices and payment method." },
];
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-8">
    <Tabs default-value="general" orientation="vertical">
      <TabsList>
        <TabsTrigger v-for="section in sections" :key="section.value" :value="section.value">{{
          section.label
        }}</TabsTrigger>
      </TabsList>
      <TabsContent
        v-for="section in sections"
        :key="section.value"
        :value="section.value"
        class="text-body-md text-muted-foreground"
      >
        {{ section.text }}
      </TabsContent>
    </Tabs>
    <Tabs default-value="general" orientation="vertical">
      <TabsList variant="line">
        <TabsTrigger v-for="section in sections" :key="section.value" :value="section.value">{{
          section.label
        }}</TabsTrigger>
      </TabsList>
      <TabsContent
        v-for="section in sections"
        :key="section.value"
        :value="section.value"
        class="text-body-md text-muted-foreground"
      >
        {{ section.text }}
      </TabsContent>
    </Tabs>
  </div>
</template>
