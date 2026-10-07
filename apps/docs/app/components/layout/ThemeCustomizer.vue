<script setup lang="ts">
import { Check, ChevronRight, Copy, Palette, RotateCcw } from '@lucide/vue'
import { useElementSize } from '@vueuse/core'

import ThemeSlider from '~/components/layout/ThemeSlider.vue'
import {
  type StatusName,
  type ThemeConfig,
  chromaRange,
  defaultTheme,
  fontStack,
  fonts,
  lightnessRange,
  neutrals,
  presets,
  radii,
  shadows,
  statusKeys,
  statuses,
  surfaceBorders,
  surfaces,
  themeCss,
} from '~/lib/theme'
import { Button } from '@/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible'
import { Field, FieldLabel } from '@/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { ScrollArea } from '@/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Switch } from '@/ui/switch'
import { useToast } from '@/ui/toast'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import { vTooltip } from '@/ui/tooltip'

const { theme, set, reset } = useSiteTheme()
const toast = useToast()

const copyCss = async () => {
  await navigator.clipboard.writeText(themeCss(theme.value))
  toast.add({ title: 'Theme CSS copied', color: 'success' })
}

const update = (patch: Partial<ThemeConfig>) => set({ ...theme.value, ...patch })

const setting = <K extends keyof ThemeConfig>(key: K) =>
  computed({ get: () => theme.value[key], set: (value) => update({ [key]: value } as Partial<ThemeConfig>) })

const hue = setting('hue')
const chroma = setting('chroma')
const radius = setting('radius')
const neutral = setting('neutral')
const font = setting('font')
const ripple = computed({ get: () => theme.value.ripple === 'on', set: (on) => update({ ripple: on ? 'on' : 'off' }) })

// A single ToggleGroup lets the pressed item go; a theme always has a value.
const choice = <K extends 'surfaces' | 'surfaceBorder' | 'shadows'>(key: K) =>
  computed({
    get: () => theme.value[key],
    set: (value?: ThemeConfig[K]) => {
      if (value) update({ [key]: value } as Partial<ThemeConfig>)
    },
  })

const surfacesChoice = choice('surfaces')
const bordersChoice = choice('surfaceBorder')
const shadowsChoice = choice('shadows')

const swatch = (preset: { hue: number; chroma: number }) => `oklch(0.6 ${preset.chroma} ${preset.hue})`
const current = (preset: { hue: number; chroma: number }) =>
  theme.value.hue === preset.hue && theme.value.chroma === preset.chroma

const hueTrack = (chroma: number) =>
  `linear-gradient(to right in oklch longer hue, oklch(0.65 ${chroma} 0), oklch(0.65 ${chroma} 360))`
const chromaTrack = (hue: number) =>
  `linear-gradient(to right, oklch(0.65 ${chromaRange.min} ${hue}), oklch(0.65 ${chromaRange.max} ${hue}))`
const lightnessTrack = (hue: number, chroma: number) =>
  `linear-gradient(to right, oklch(${lightnessRange.min} ${chroma} ${hue}), oklch(${lightnessRange.max} ${chroma} ${hue}))`

const status = ref<StatusName>('destructive')
const statusSetting = (part: 'hue' | 'chroma' | 'lightness') =>
  computed({
    get: () => theme.value[statusKeys(status.value)[part]],
    set: (value: number) => update({ [statusKeys(status.value)[part]]: value }),
  })
const statusHue = statusSetting('hue')
const statusChroma = statusSetting('chroma')
const statusLightness = statusSetting('lightness')
const statusChanged = computed(() =>
  Object.values(statusKeys(status.value)).some((key) => theme.value[key] !== defaultTheme[key]),
)
const resetStatus = () =>
  update(Object.fromEntries(Object.values(statusKeys(status.value)).map((key) => [key, defaultTheme[key]])))

const segmented = {
  variant: 'soft',
  color: 'primary',
  activeVariant: 'solid',
  activeColor: 'primary',
  size: 'xs',
} as const
const heading = 'text-label-md text-muted-foreground'

// The scroll area gets its content's height, so the popover fits it and shrinks only to the space there is.
const body = useTemplateRef<HTMLElement>('body')
const { height: bodyHeight } = useElementSize(body, undefined, { box: 'border-box' })
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button v-tooltip="'Theme'" variant="ghost" color="neutral" size="icon-md" aria-label="Customise the theme">
        <Palette />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :collision-padding="8"
      class="flex max-h-(--reka-popover-content-available-height) w-88 flex-col p-0"
    >
      <div class="flex flex-col gap-1 px-4 pt-4 pb-3">
        <h2 class="text-title-sm">Theme</h2>
        <p class="text-body-sm text-muted-foreground">Applies to the whole site and its examples.</p>
      </div>

      <ScrollArea
        class="min-h-0 scroll-fade-overlay-y [--scroll-fade-color:var(--popover)] [--scroll-fade-size:--spacing(6)]"
        :style="{ height: `${bodyHeight}px` }"
      >
        <div ref="body" class="flex flex-col gap-5 px-4 pb-2">
          <section class="flex flex-col gap-3" aria-labelledby="customizer-colour">
            <h3 id="customizer-colour" :class="heading">Colour</h3>
            <div class="grid grid-cols-10 gap-1.5">
              <button
                v-for="preset in presets"
                :key="preset.name"
                v-tooltip="preset.name"
                type="button"
                :aria-label="preset.name"
                :aria-pressed="current(preset)"
                class="flex aspect-square items-center justify-center rounded-full text-white outline-offset-2 transition-transform duration-short-3 ease-standard hover:scale-110 focus-visible:focus-ring aria-pressed:outline-2 aria-pressed:outline-foreground"
                :style="{ background: swatch(preset) }"
                @click="update({ hue: preset.hue, chroma: preset.chroma })"
              >
                <Check v-if="current(preset)" class="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <ThemeSlider
              v-model="hue"
              label="Hue"
              :value="`${hue}°`"
              :min="0"
              :max="360"
              :step="1"
              :track="hueTrack(0.15)"
            />
            <ThemeSlider
              v-model="chroma"
              label="Chroma"
              :value="chroma.toFixed(2)"
              :min="chromaRange.min"
              :max="chromaRange.max"
              :step="0.01"
              :track="chromaTrack(hue)"
            />
          </section>

          <section class="flex flex-col gap-3" aria-labelledby="customizer-type">
            <h3 id="customizer-type" :class="heading">Neutrals and type</h3>
            <Field orientation="horizontal">
              <FieldLabel>Neutral</FieldLabel>
              <Select v-model="neutral">
                <SelectTrigger size="sm" class="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in neutrals" :key="item.key" :value="item.key">{{ item.name }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>Font</FieldLabel>
              <Select v-model="font">
                <SelectTrigger size="sm" class="w-40">
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
            </Field>
          </section>

          <section class="flex flex-col gap-3" aria-labelledby="customizer-shape">
            <h3 id="customizer-shape" :class="heading">Shape and depth</h3>
            <ThemeSlider
              v-model="radius"
              label="Radius"
              :value="`${radius}rem`"
              :min="radii[0]!"
              :max="radii.at(-1)!"
              :step="radii[1]! - radii[0]!"
            />
            <Field>
              <FieldLabel id="customizer-surfaces">Surfaces</FieldLabel>
              <ToggleGroup
                type="single"
                v-bind="segmented"
                v-model="surfacesChoice"
                aria-labelledby="customizer-surfaces"
                class="w-full"
              >
                <ToggleGroupItem v-for="option in surfaces" :key="option.key" :value="option.key" class="flex-1">
                  {{ option.name }}
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel id="customizer-borders">Surface borders</FieldLabel>
              <ToggleGroup
                type="single"
                v-bind="segmented"
                v-model="bordersChoice"
                aria-labelledby="customizer-borders"
                class="w-full"
              >
                <ToggleGroupItem v-for="option in surfaceBorders" :key="option.key" :value="option.key" class="flex-1">
                  {{ option.name }}
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel id="customizer-shadows">Shadows</FieldLabel>
              <ToggleGroup
                type="single"
                v-bind="segmented"
                v-model="shadowsChoice"
                aria-labelledby="customizer-shadows"
                class="w-full"
              >
                <ToggleGroupItem v-for="option in shadows" :key="option.key" :value="option.key" class="flex-1">
                  {{ option.name }}
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>Ripple on press</FieldLabel>
              <Switch v-model="ripple" size="sm" />
            </Field>
          </section>

          <Collapsible>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" color="neutral" size="sm" class="group/status -mx-2 justify-start px-2">
                <ChevronRight
                  data-icon="inline-start"
                  class="transition-transform duration-short-4 ease-standard group-data-[state=open]/status:rotate-90 motion-reduce:transition-none rtl:rotate-180"
                />
                Status colours
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div class="flex flex-col gap-3 pt-3">
                <ToggleGroup
                  type="single"
                  v-bind="segmented"
                  :model-value="status"
                  aria-label="Status colour"
                  class="w-full"
                  @update:model-value="(value) => value && (status = value as StatusName)"
                >
                  <ToggleGroupItem v-for="entry in statuses" :key="entry.key" :value="entry.key" class="flex-1">
                    {{ entry.name }}
                  </ToggleGroupItem>
                </ToggleGroup>
                <ThemeSlider
                  v-model="statusHue"
                  label="Hue"
                  :value="`${statusHue}°`"
                  :min="0"
                  :max="360"
                  :step="1"
                  :track="hueTrack(0.15)"
                />
                <ThemeSlider
                  v-model="statusChroma"
                  label="Chroma"
                  :value="statusChroma.toFixed(2)"
                  :min="chromaRange.min"
                  :max="chromaRange.max"
                  :step="0.01"
                  :track="chromaTrack(statusHue)"
                />
                <ThemeSlider
                  v-model="statusLightness"
                  label="Fill lightness"
                  :value="statusLightness.toFixed(2)"
                  :min="lightnessRange.min"
                  :max="lightnessRange.max"
                  :step="0.01"
                  :track="lightnessTrack(statusHue, statusChroma)"
                />
                <Button
                  v-if="statusChanged"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="self-start"
                  @click="resetStatus"
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset {{ statuses.find((entry) => entry.key === status)!.name.toLowerCase() }}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      <div class="flex gap-2 px-4 pt-2 pb-4">
        <Button variant="soft" color="destructive" size="sm" @click="reset">
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button color="primary" size="sm" class="ms-auto" @click="copyCss">
          <Copy data-icon="inline-start" />
          Copy CSS
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
