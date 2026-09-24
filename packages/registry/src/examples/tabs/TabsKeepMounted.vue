<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";
</script>

<template>
  <Tabs default-value="draft" :unmount-on-hide="false" class="w-full max-w-md">
    <TabsList>
      <TabsTrigger value="draft">Draft</TabsTrigger>
      <TabsTrigger value="notes">Notes</TabsTrigger>
    </TabsList>
    <TabsContent value="draft">
      <Textarea placeholder="Type here, switch tabs, come back: the text is still there." />
    </TabsContent>
    <TabsContent value="notes">
      <Textarea placeholder="A second field that also keeps its text." />
    </TabsContent>
  </Tabs>
</template>
