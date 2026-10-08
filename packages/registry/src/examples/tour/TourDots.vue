<script setup lang="ts">
import { useTemplateRef } from "vue";

import { Button } from "@/ui/button";
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";
import {
  Tour,
  TourContent,
  TourDescription,
  TourFooter,
  TourNext,
  TourProgress,
  type TourStep,
  TourTitle,
  useTour,
} from "@/ui/tour";

type Step = TourStep & { title: string };

const first = useTemplateRef<HTMLElement>("first");
const second = useTemplateRef<HTMLElement>("second");
const third = useTemplateRef<HTMLElement>("third");

const tour = useTour<Step>([
  { target: () => first.value, title: "Pick a plan" },
  { target: () => second.value, title: "Invite your team" },
  { target: () => third.value, title: "Connect your repository" },
]);
</script>

<template>
  <div class="flex w-full max-w-md flex-col items-center gap-6">
    <ol class="grid w-full grid-cols-3 gap-2 text-center text-label-md">
      <li ref="first" class="rounded-lg border p-3">Plan</li>
      <li ref="second" class="rounded-lg border p-3">Team</li>
      <li ref="third" class="rounded-lg border p-3">Repository</li>
    </ol>
    <Button variant="outline" color="neutral" @click="tour.start()">Start</Button>

    <Tour v-slot="{ step, index }" :tour="tour">
      <TourContent>
        <TourTitle>{{ step.title }}</TourTitle>
        <TourDescription>Step {{ index + 1 }} of the setup.</TourDescription>
        <TourFooter>
          <TourProgress v-slot="{ index: current, total }">
            <PageIndicator v-slot="{ pages }" :count="total" :page="current + 1" size="sm" readonly>
              <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
            </PageIndicator>
          </TourProgress>
          <TourNext />
        </TourFooter>
      </TourContent>
    </Tour>
  </div>
</template>
