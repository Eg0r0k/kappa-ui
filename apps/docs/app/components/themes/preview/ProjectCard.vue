<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Project</CardTitle>
      <CardDescription>Tabs, questions and a loading state.</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs default-value="faq">
        <TabsList variant="line" size="sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" class="text-body-md text-muted-foreground">
          A shared space for the Q4 launch: roadmap, budget and the design files, with everyone who works on them.
        </TabsContent>
        <TabsContent value="activity" class="flex flex-col gap-3">
          <div v-for="index in 3" :key="index" class="flex items-center gap-3">
            <Skeleton animation="wave" variant="circle" class="size-8" />
            <div class="flex flex-1 flex-col gap-1">
              <Skeleton animation="wave" variant="text" class="w-2/3 text-body-sm" />
              <Skeleton animation="wave" variant="text" class="w-1/3 text-body-sm" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="faq">
          <Accordion type="single" default-value="export">
            <AccordionItem value="export">
              <AccordionTrigger>Can I export my data?</AccordionTrigger>
              <AccordionContent>Yes. Any project exports to CSV or JSON from its settings.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="seats">
              <AccordionTrigger>How are seats counted?</AccordionTrigger>
              <AccordionContent>Everyone who can edit takes a seat; viewers are free.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancel">
              <AccordionTrigger>Can I cancel at any time?</AccordionTrigger>
              <AccordionContent>Yes, and your data stays readable for 30 days.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
</template>
