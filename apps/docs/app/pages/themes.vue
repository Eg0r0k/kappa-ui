<script setup lang="ts">
import { Check, Code, RotateCcw, Shuffle, TriangleAlert } from '@lucide/vue'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'

import CodeBlock from '~/components/CodeBlock.vue'
import ContrastBadge from '~/components/ContrastBadge.vue'
import ThemePreview from '~/components/themes/ThemePreview.vue'
import { statusChecks, themeChecks } from '~/lib/contrast'
import { highlight } from '~/lib/highlight'
import {
  type StatusName,
  type ThemeConfig,
  chromaRange,
  defaultTheme,
  fontStack,
  fontUrl,
  fonts,
  lightnessRange,
  neutrals,
  presets,
  previewCss,
  radii,
  randomTheme,
  statusKeys,
  statuses,
  surfaceBorders,
  surfaces,
  themeCss,
  themeFromQuery,
  themeToQuery,
} from '~/lib/theme'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/ui/field'
import { ScrollArea } from '@/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Slider } from '@/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

useSeoMeta({
  title: 'Themes · kappa-ui',
  description: 'Pick a brand colour, neutral, corner radius and font, and copy the CSS.',
})

defineOgImage('KappaDocs', {
  title: 'Themes',
  description: 'Pick a brand colour, neutral, corner radius and font, and copy the CSS.',
})

const route = useRoute()
const router = useRouter()

const site = useSiteTheme()

const theme = reactive<ThemeConfig>({ ...defaultTheme })
const apply = (next: ThemeConfig) => Object.assign(theme, next)

const onSite = computed(() => JSON.stringify(themeToQuery(site.theme.value)) === JSON.stringify(themeToQuery(theme)))

onMounted(() => {
  apply(Object.keys(route.query).length ? themeFromQuery(route.query) : { ...site.theme.value })
  watch(theme, () => router.replace({ query: themeToQuery(theme) }), { deep: true })
})

const hue = computed({ get: () => theme.hue, set: (value) => (theme.hue = value) })
const chroma = computed({ get: () => Math.round(theme.chroma * 100), set: (value) => (theme.chroma = value / 100) })

const status = ref<StatusName>('destructive')
const statusHue = (key: StatusName) => theme[statusKeys(key).hue]
const statusChroma = (key: StatusName) => Math.round(theme[statusKeys(key).chroma] * 100)
const statusLightness = (key: StatusName) => Math.round(theme[statusKeys(key).lightness] * 100)
const setStatusHue = (key: StatusName, value?: number | number[]) => (theme[statusKeys(key).hue] = Number(value))
const setStatusChroma = (key: StatusName, value?: number | number[]) =>
  (theme[statusKeys(key).chroma] = Number(value) / 100)
const setStatusLightness = (key: StatusName, value?: number | number[]) =>
  (theme[statusKeys(key).lightness] = Number(value) / 100)
const statusChanged = (key: StatusName) =>
  Object.values(statusKeys(key)).some((name) => theme[name] !== defaultTheme[name])
const resetStatus = (key: StatusName) => {
  for (const name of Object.values(statusKeys(key))) theme[name] = defaultTheme[name]
}

const textClass: Record<StatusName, string> = {
  destructive: 'text-destructive',
  success: 'text-success-text',
  warning: 'text-warning-text',
  info: 'text-info-text',
}

const colorMode = useColorMode()
const scope = useTemplateRef<HTMLElement>('contrast-scope')
const contrast = useContrast(scope, themeChecks, () => ({ ...theme }))
const failing = computed(() => contrast.value.filter((result) => result.grade !== 'pass'))
const checksOf = (key: StatusName) => {
  const checks = key === 'destructive' ? statusChecks(key, 'destructive-foreground', key) : statusChecks(key)
  return contrast.value
    .filter((result) => checks.some((check) => check.fg === result.fg && check.bg === result.bg))
    .map((result) => ({ ...result, label: checks.find((check) => check.fg === result.fg)!.label }))
}

const css = computed(() => themeCss(theme))
const html = ref('')
watch(css, async (value) => (html.value = await highlight(value, 'css')), { immediate: true })

useHead({
  link: [{ rel: 'stylesheet', href: fontUrl(fonts.filter((font) => font.key !== 'inter').map((font) => font.name)) }],
  style: [{ key: 'theme-preview', innerHTML: computed(() => previewCss(theme, '[data-theme-preview]')) }],
})

const swatch = (preset: { hue: number; chroma: number }) => `oklch(0.6 ${preset.chroma} ${preset.hue})`
const hueTrack = `linear-gradient(to right in oklch longer hue, oklch(0.6 0.15 0), oklch(0.6 0.15 360))`
</script>

<template>
  <main
    class="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4 lg:h-[calc(100svh-3.5rem-1px)] lg:flex-row lg:gap-6 lg:px-6 lg:py-6"
  >
    <aside class="flex flex-col overflow-hidden rounded-2xl border lg:w-80 lg:shrink-0">
      <ScrollArea class="scroll-fade-overlay-y h-[60svh] lg:h-auto lg:min-h-0 lg:flex-1">
        <div class="flex flex-col gap-6 p-5">
          <header class="flex flex-col gap-1">
            <h1 class="text-headline-sm">Themes</h1>
            <p class="text-body-md text-muted-foreground">
              The preview follows as you go, in the light or dark theme from the header.
            </p>
          </header>

          <Alert v-if="failing.length" variant="soft" color="warning" size="sm">
            <TriangleAlert />
            <AlertTitle>
              {{ failing.length === 1 ? 'One pair is' : `${failing.length} pairs are` }} below WCAG AA
            </AlertTitle>
            <AlertDescription>
              {{ failing.map((result) => result.label).join(', ') }}, in the {{ colorMode.value }} theme. See Contrast
              below.
            </AlertDescription>
          </Alert>

          <FieldSet>
            <FieldLegend>Brand colour</FieldLegend>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in presets"
                :key="preset.name"
                type="button"
                :aria-label="preset.name"
                :aria-pressed="theme.hue === preset.hue && theme.chroma === preset.chroma"
                :title="preset.name"
                class="size-7 rounded-full outline-offset-2 transition-transform hover:scale-110 focus-visible:focus-ring aria-pressed:outline-2 aria-pressed:outline-foreground"
                :style="{ background: swatch(preset) }"
                @click="apply({ ...theme, hue: preset.hue, chroma: preset.chroma })"
              />
            </div>
            <Field>
              <FieldLabel>Hue</FieldLabel>
              <div class="h-2 rounded-full" :style="{ background: hueTrack }" aria-hidden="true" />
              <Slider v-model="hue" :min="0" :max="360" size="sm" />
              <FieldDescription>{{ theme.hue }}°</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Chroma</FieldLabel>
              <Slider v-model="chroma" :min="chromaRange.min * 100" :max="chromaRange.max * 100" size="sm" />
              <FieldDescription>{{ theme.chroma.toFixed(2) }}, how vivid the colour is.</FieldDescription>
            </Field>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Status colours</FieldLegend>
            <FieldDescription>
              Hue, chroma and fill lightness of each status colour. The label on the fill keeps its lightness, so watch
              its contrast as you move the fill.
            </FieldDescription>
            <Tabs v-model="status">
              <TabsList size="xs" class="w-full">
                <TabsTrigger v-for="entry in statuses" :key="entry.key" :value="entry.key">
                  {{ entry.name }}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                v-for="entry in statuses"
                :key="entry.key"
                :value="entry.key"
                class="flex flex-col gap-4 pt-3"
              >
                <div data-theme-preview class="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
                  <Badge :color="entry.key">Solid</Badge>
                  <Badge variant="soft" :color="entry.key">Soft</Badge>
                  <Badge variant="outline" :color="entry.key">Outline</Badge>
                  <span class="text-label-md" :class="textClass[entry.key]">Text on the page</span>
                </div>
                <Field>
                  <FieldLabel>Hue</FieldLabel>
                  <div class="h-2 rounded-full" :style="{ background: hueTrack }" aria-hidden="true" />
                  <Slider
                    :model-value="statusHue(entry.key)"
                    :min="0"
                    :max="360"
                    size="sm"
                    @update:model-value="(value) => setStatusHue(entry.key, value)"
                  />
                  <FieldDescription>{{ statusHue(entry.key) }}°</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Chroma</FieldLabel>
                  <Slider
                    :model-value="statusChroma(entry.key)"
                    :min="chromaRange.min * 100"
                    :max="chromaRange.max * 100"
                    size="sm"
                    @update:model-value="(value) => setStatusChroma(entry.key, value)"
                  />
                  <FieldDescription>{{ (statusChroma(entry.key) / 100).toFixed(2) }}</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Fill lightness</FieldLabel>
                  <Slider
                    :model-value="statusLightness(entry.key)"
                    :min="lightnessRange.min * 100"
                    :max="lightnessRange.max * 100"
                    size="sm"
                    @update:model-value="(value) => setStatusLightness(entry.key, value)"
                  />
                  <FieldDescription>
                    {{ (statusLightness(entry.key) / 100).toFixed(2) }} in the light theme; the dark fill moves with it.
                  </FieldDescription>
                </Field>
                <ul class="flex flex-col gap-1.5">
                  <li
                    v-for="result in checksOf(entry.key)"
                    :key="result.fg"
                    class="flex items-center justify-between gap-2 text-body-sm"
                  >
                    {{ result.label }}
                    <ContrastBadge :ratio="result.ratio" :grade="result.grade" :min="result.min" />
                  </li>
                </ul>
                <Button
                  v-if="statusChanged(entry.key)"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  class="self-start"
                  @click="resetStatus(entry.key)"
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset {{ entry.name.toLowerCase() }}
                </Button>
              </TabsContent>
            </Tabs>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend>Neutral</FieldLegend>
            <FieldDescription>The tint of the page, borders, muted fills and text, in both themes.</FieldDescription>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="neutral in neutrals"
                :key="neutral.key"
                size="sm"
                :variant="theme.neutral === neutral.key ? 'soft' : 'outline'"
                :color="theme.neutral === neutral.key ? 'primary' : 'neutral'"
                :aria-pressed="theme.neutral === neutral.key"
                @click="theme.neutral = neutral.key"
              >
                {{ neutral.name }}
              </Button>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Radius</FieldLegend>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="radius in radii"
                :key="radius"
                size="sm"
                :variant="theme.radius === radius ? 'soft' : 'outline'"
                :color="theme.radius === radius ? 'primary' : 'neutral'"
                :aria-pressed="theme.radius === radius"
                @click="theme.radius = radius"
              >
                {{ radius }}
              </Button>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Surface borders</FieldLegend>
            <FieldDescription
              >The border of cards, dialogs, menus, popovers, select lists and toasts. None keeps the width, so nothing
              moves.</FieldDescription
            >
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in surfaceBorders"
                :key="option.key"
                size="sm"
                :variant="theme.surfaceBorder === option.key ? 'soft' : 'outline'"
                :color="theme.surfaceBorder === option.key ? 'primary' : 'neutral'"
                :aria-pressed="theme.surfaceBorder === option.key"
                @click="theme.surfaceBorder = option.key"
              >
                {{ option.name }}
              </Button>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Light surfaces</FieldLegend>
            <FieldDescription>
              The light theme only. Raised lifts white cards off a tinted page, Flat keeps both white, and Tinted greys
              the cards on a white page.
            </FieldDescription>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in surfaces"
                :key="option.key"
                size="sm"
                :variant="theme.surfaces === option.key ? 'soft' : 'outline'"
                :color="theme.surfaces === option.key ? 'primary' : 'neutral'"
                :aria-pressed="theme.surfaces === option.key"
                @click="theme.surfaces = option.key"
              >
                {{ option.name }}
              </Button>
            </div>
          </FieldSet>

          <Field>
            <FieldLabel>Font</FieldLabel>
            <Select v-model="theme.font">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="font in fonts"
                  :key="font.key"
                  :value="font.key"
                  :style="{ fontFamily: fontStack(font) }"
                >
                  {{ font.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          <FieldSet>
            <FieldLegend>Contrast</FieldLegend>
            <FieldDescription>
              WCAG contrast in the theme picked in the header. Text needs 4.5:1, control borders 3:1.
            </FieldDescription>
            <ul class="flex flex-col gap-1.5">
              <li
                v-for="result in contrast"
                :key="`${result.fg}/${result.bg}`"
                class="flex items-center justify-between gap-2 text-body-sm"
              >
                {{ result.label }}
                <ContrastBadge :ratio="result.ratio" :grade="result.grade" :min="result.min" />
              </li>
            </ul>
          </FieldSet>
        </div>
      </ScrollArea>

      <div class="flex items-center gap-2 border-t p-4">
        <Button size="sm" variant="outline" color="neutral" @click="apply(randomTheme(Math.random, theme))">
          <Shuffle data-icon="inline-start" />
          Randomize
        </Button>
        <Button size="sm" variant="soft" color="destructive" @click="apply({ ...defaultTheme })">
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button size="sm" class="ms-auto" :disabled="onSite" @click="site.set({ ...theme })">
          <Check data-icon="inline-start" />
          {{ onSite ? 'In use' : 'Use' }}
        </Button>
      </div>
    </aside>

    <div ref="contrast-scope" data-theme-preview hidden />

    <ThemePreview class="h-[85svh] min-w-0 lg:h-auto lg:flex-1">
      <template #actions>
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="ghost" color="neutral" size="icon-sm" aria-label="Copy code" title="Copy code">
              <Code />
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Theme CSS</DialogTitle>
              <DialogDescription>
                Paste it into your global CSS, after the kappa-ui theme. The font import goes with your other imports,
                at the top.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <CodeBlock filename="globals.css" :html="html" :source="css" />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </template>
    </ThemePreview>
  </main>
</template>
