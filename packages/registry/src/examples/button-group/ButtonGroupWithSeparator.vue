<script setup lang="ts">
import { Button } from "@/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/ui/button-group";
</script>

<template>
  <ButtonGroup aria-label="Clipboard">
    <Button variant="soft" color="neutral">Copy</Button>
    <ButtonGroupSeparator />
    <Button variant="soft" color="neutral">Paste</Button>
    <ButtonGroupSeparator />
    <Button variant="soft" color="neutral">Cut</Button>
  </ButtonGroup>
</template>
