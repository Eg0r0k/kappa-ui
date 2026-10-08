<script setup lang="ts">
import { FilePlus, Search } from "@lucide/vue";
import { useTemplateRef } from "vue";

import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Tour,
  TourClose,
  TourContent,
  TourDescription,
  TourFooter,
  TourNext,
  TourPrev,
  TourProgress,
  type TourStep,
  TourTitle,
  useTour,
} from "@/ui/tour";

type Step = TourStep & { title: string; body: string; side?: "top" | "right" | "bottom" | "left" };

const profile = useTemplateRef<HTMLElement>("profile");

const tour = useTour<Step>([
  { target: null, title: "Welcome to Files", body: "A quick look around: three stops, under a minute." },
  { target: "tour-demo-new", title: "Create", body: "Start a document, a folder or an upload from here." },
  { target: "tour-demo-search", title: "Search", body: "Find any file by its name or by what is inside it." },
  {
    target: () => profile.value,
    title: "Your account",
    body: "Storage, sharing and sign-out live here.",
    side: "left",
  },
]);
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-6">
    <div class="flex items-center gap-2 rounded-xl border p-2">
      <Button id="tour-demo-new" size="sm">
        <FilePlus data-icon="inline-start" />
        New
      </Button>
      <div class="relative flex-1">
        <Input id="tour-demo-search" size="sm" placeholder="Search files" aria-label="Search files" class="ps-8" />
        <Search class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <div ref="profile">
        <Avatar size="sm">
          <AvatarFallback>EK</AvatarFallback>
        </Avatar>
      </div>
    </div>
    <Button variant="outline" color="neutral" class="self-center" @click="tour.start()">Start the tour</Button>

    <Tour v-slot="{ step }" :tour="tour">
      <TourContent :side="step.side">
        <TourTitle>{{ step.title }}</TourTitle>
        <TourDescription>{{ step.body }}</TourDescription>
        <TourFooter>
          <TourProgress />
          <TourPrev />
          <TourNext />
        </TourFooter>
        <TourClose />
      </TourContent>
    </Tour>
  </div>
</template>
