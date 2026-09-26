<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";
</script>

<template>
  <ButtonGroup aria-label="Pagination">
    <ButtonGroup>
      <Button variant="outline" color="neutral" size="sm">1</Button>
      <Button variant="outline" color="neutral" size="sm">2</Button>
      <Button variant="outline" color="neutral" size="sm">3</Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button variant="outline" color="neutral" size="icon-sm" aria-label="Previous page">
        <ArrowLeft class="rtl:rotate-180" />
      </Button>
      <Button variant="outline" color="neutral" size="icon-sm" aria-label="Next page">
        <ArrowRight class="rtl:rotate-180" />
      </Button>
    </ButtonGroup>
  </ButtonGroup>
</template>
