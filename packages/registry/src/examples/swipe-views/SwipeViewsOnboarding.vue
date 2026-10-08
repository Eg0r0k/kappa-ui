<script setup lang="ts">
import { Compass, Rocket, Sparkles } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";
import { SwipeView, SwipeViews } from "@/ui/swipe-views";

const steps = [
  { icon: Sparkles, title: "Welcome", text: "Everything you save lands in one place, on every device." },
  { icon: Compass, title: "Find your way", text: "Swipe between your lists, or pick one from the tabs." },
  { icon: Rocket, title: "Ready to go", text: "Start with an empty list or import the one you have." },
];

const page = ref(1);
const next = () => (page.value = page.value === steps.length ? 1 : page.value + 1);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-4 overflow-clip rounded-xl border border-border pb-5">
    <SwipeViews v-model="page" class="w-full select-none">
      <SwipeView
        v-for="(step, index) in steps"
        :key="step.title"
        :value="index + 1"
        class="flex flex-col items-center gap-3 px-8 pt-10 pb-2 text-center"
      >
        <component :is="step.icon" class="size-10 text-primary" />
        <h3 class="text-title-md">{{ step.title }}</h3>
        <p class="text-body-md text-muted-foreground">{{ step.text }}</p>
      </SwipeView>
    </SwipeViews>
    <PageIndicator v-slot="{ pages }" v-model:page="page" :count="steps.length" variant="pill" aria-label="Steps">
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" :aria-label="steps[value - 1]!.title" />
    </PageIndicator>
    <Button @click="next">{{ page === steps.length ? "Start over" : "Next" }}</Button>
  </div>
</template>
