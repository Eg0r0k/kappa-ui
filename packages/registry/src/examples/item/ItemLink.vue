<script setup lang="ts">
import { ChevronRight, CreditCard, Shield, User } from "@lucide/vue";

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/ui/item";

const settings = [
  { title: "Account", description: "Name, email and photo.", icon: User },
  { title: "Security", description: "Password and two-step sign-in.", icon: Shield },
  { title: "Billing", description: "Plan, invoices and payment method.", icon: CreditCard },
];
</script>

<template>
  <ItemGroup role="group" aria-label="Settings" class="w-full max-w-md gap-1">
    <Item v-for="setting in settings" :key="setting.title" as-child>
      <a href="#">
        <ItemMedia variant="icon">
          <component :is="setting.icon" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{{ setting.title }}</ItemTitle>
          <ItemDescription>{{ setting.description }}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight class="size-4 text-muted-foreground rtl:rotate-180" />
        </ItemActions>
      </a>
    </Item>
  </ItemGroup>
</template>
