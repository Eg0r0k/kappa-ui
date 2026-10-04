<script setup lang="ts">
import { Copy, Palette, RotateCcw } from '@lucide/vue'

import { type ThemeConfig, fontStack, fonts, neutrals, presets, radii, surfaceBorders, themeCss } from '~/lib/theme'
import { Button } from '@/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { useToast } from '@/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const { theme, set, reset } = useSiteTheme()
const toast = useToast()

const copyCss = async () => {
  await navigator.clipboard.writeText(themeCss(theme.value))
  toast.add({ title: 'Theme CSS copied', color: 'success' })
}

const update = (patch: Partial<ThemeConfig>) => set({ ...theme.value, ...patch })

const font = computed({ get: () => theme.value.font, set: (value) => update({ font: value }) })

const swatch = (preset: { hue: number; chroma: number }) => `oklch(0.6 ${preset.chroma} ${preset.hue})`
const current = (preset: { hue: number; chroma: number }) =>
  theme.value.hue === preset.hue && theme.value.chroma === preset.chroma
</script>

<template>
  <Popover>
    <Tooltip>
      <TooltipTrigger as-child>
      <PopoverTrigger as-child>
        <Button variant="ghost" color="neutral" size="icon" aria-label="Customise the theme">
          <Palette />
        </Button>
      </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent>Theme</TooltipContent>
    </Tooltip>
    <PopoverContent align="end" class="flex w-80 flex-col gap-5 p-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-title-sm">Theme</h2>
        <p class="text-body-sm text-muted-foreground">Applies to the whole site and its examples.</p>
      </div>

      <section class="flex flex-col gap-2" aria-labelledby="customizer-colour">
        <h3 id="customizer-colour" class="text-label-md text-muted-foreground">Colour</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in presets"
            :key="preset.name"
            type="button"
            :aria-label="preset.name"
            :aria-pressed="current(preset)"
            :title="preset.name"
            class="size-7 rounded-full outline-offset-2 transition-transform duration-short-3 ease-standard hover:scale-110 focus-visible:focus-ring aria-pressed:outline-2 aria-pressed:outline-foreground"
            :style="{ background: swatch(preset) }"
            @click="update({ hue: preset.hue, chroma: preset.chroma })"
          />
        </div>
      </section>

      <section class="flex flex-col gap-2" aria-labelledby="customizer-neutral">
        <h3 id="customizer-neutral" class="text-label-md text-muted-foreground">Neutral</h3>
        <div class="flex flex-wrap gap-1.5">
          <Button
            v-for="neutral in neutrals"
            :key="neutral.key"
            size="xs"
            :variant="theme.neutral === neutral.key ? 'soft' : 'outline'"
            :color="theme.neutral === neutral.key ? 'primary' : 'neutral'"
            :aria-pressed="theme.neutral === neutral.key"
            @click="update({ neutral: neutral.key })"
          >
            {{ neutral.name }}
          </Button>
        </div>
      </section>

      <section class="flex flex-col gap-2" aria-labelledby="customizer-radius">
        <h3 id="customizer-radius" class="text-label-md text-muted-foreground">Radius</h3>
        <div class="flex flex-wrap gap-1.5">
          <Button
            v-for="radius in radii"
            :key="radius"
            size="xs"
            :variant="theme.radius === radius ? 'soft' : 'outline'"
            :color="theme.radius === radius ? 'primary' : 'neutral'"
            :aria-pressed="theme.radius === radius"
            @click="update({ radius })"
          >
            {{ radius }}
          </Button>
        </div>
      </section>

      <section class="flex flex-col gap-2" aria-labelledby="customizer-borders">
        <h3 id="customizer-borders" class="text-label-md text-muted-foreground">Surface borders</h3>
        <div class="flex flex-wrap gap-1.5">
          <Button
            v-for="option in surfaceBorders"
            :key="option.key"
            size="xs"
            :variant="theme.surfaceBorder === option.key ? 'soft' : 'outline'"
            :color="theme.surfaceBorder === option.key ? 'primary' : 'neutral'"
            :aria-pressed="theme.surfaceBorder === option.key"
            @click="update({ surfaceBorder: option.key })"
          >
            {{ option.name }}
          </Button>
        </div>
      </section>

      <section class="flex flex-col gap-2" aria-labelledby="customizer-font">
        <h3 id="customizer-font" class="text-label-md text-muted-foreground">Font</h3>
        <Select v-model="font">
          <SelectTrigger size="sm" aria-labelledby="customizer-font">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="item in fonts"
              :key="item.key"
              :value="item.key"
              :style="{ fontFamily: fontStack(item) }"
            >
              {{ item.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <div class="flex gap-2">
        <Button variant="ghost" color="neutral" size="sm" @click="reset">
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button variant="outline" color="neutral" size="sm" class="ms-auto" @click="copyCss">
          <Copy data-icon="inline-start" />
          Copy CSS
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
