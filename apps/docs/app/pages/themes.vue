<script setup lang="ts">
import { Check, Code, RotateCcw, Shuffle } from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'

import CodeBlock from '~/components/CodeBlock.vue'
import ThemePreview from '~/components/themes/ThemePreview.vue'
import { highlight } from '~/lib/highlight'
import {
  type ThemeConfig,
  chromaRange,
  defaultTheme,
  fontStack,
  fontUrl,
  fonts,
  neutrals,
  presets,
  previewCss,
  radii,
  randomTheme,
  surfaceBorders,
  themeCss,
  themeFromQuery,
  themeToQuery,
} from '~/lib/theme'
import { Button } from '@/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Slider } from '@/ui/slider'

useSeoMeta({
  title: 'Themes · delta-ui',
  description: 'Pick a brand colour, neutral, corner radius and font, and copy the CSS.',
})

defineOgImage('DeltaDocs', {
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
  <main class="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-10 lg:px-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-headline-lg">Themes</h1>
      <p class="max-w-2xl text-body-lg text-muted-foreground">
        Pick a brand colour, a neutral, a corner radius and a font. The preview follows as you go, in the light or dark
        theme from the header, and the CSS is ready to paste when it looks right.
      </p>
    </header>

    <div class="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside class="flex flex-col gap-6 rounded-2xl border p-5 lg:sticky lg:top-20">
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
              class="size-7 rounded-full outline-offset-2 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring aria-pressed:outline-2 aria-pressed:outline-foreground"
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

        <Separator />

        <FieldSet>
          <FieldLegend>Neutral</FieldLegend>
          <FieldDescription>The tint of backgrounds, borders and muted text.</FieldDescription>
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
          <FieldDescription>The border of cards, dialogs, menus, popovers, select lists and toasts. None keeps the width, so nothing moves.</FieldDescription>
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

        <Field>
          <FieldLabel>Font</FieldLabel>
          <Select v-model="theme.font">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="font in fonts" :key="font.key" :value="font.key" :style="{ fontFamily: fontStack(font) }">
                {{ font.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Separator />

        <div class="flex flex-wrap gap-2">
          <Button @click="apply(randomTheme())">
            <Shuffle data-icon="inline-start" />
            Randomize
          </Button>
          <Button variant="ghost" color="neutral" @click="apply({ ...defaultTheme })">
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button variant="outline" color="neutral" :disabled="onSite" @click="site.set({ ...theme })">
            <Check data-icon="inline-start" />
            {{ onSite ? 'Used on this site' : 'Use on this site' }}
          </Button>
          <Dialog>
            <DialogTrigger as-child>
              <Button variant="outline" color="neutral">
                <Code data-icon="inline-start" />
                Copy code
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Theme CSS</DialogTitle>
                <DialogDescription>
                  Paste it into your global CSS, after the delta-ui theme. The font import goes with your other imports,
                  at the top.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <CodeBlock filename="globals.css" :html="html" :source="css" />
              </DialogBody>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      <ThemePreview />
    </div>
  </main>
</template>
