<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Button } from '@/ui/button'

// Paired the way the button actually consumes them: a fill and the text that
// sits on it. Showing them apart would hide the only thing that matters about
// a foreground token, which is whether it is readable on its partner.
const buttonColors = [
  {
    bg: 'primary',
    fg: 'primary-foreground',
    role: 'variant="default" fill and label; link text; spinner',
  },
  { bg: 'accent', fg: 'accent-foreground', role: 'hover fill for outline and ghost' },
  { bg: 'background', fg: 'foreground', role: 'outline fill; inherited label colour' },
  { bg: 'input', fg: null, role: 'outline border' },
  { bg: 'ring', fg: null, role: 'focus ring, drawn at 50% opacity' },
]

// Theme tokens that exist but nothing in Button reads yet.
const unusedColors = [
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'destructive',
  'border',
]

const variants = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const

const resolved = ref<Record<string, string>>({})

// Read from the live document rather than hardcoded, so the values shown are
// the ones actually in force and follow the theme toggle.
const readTokens = () => {
  const style = getComputedStyle(document.documentElement)
  const names = [
    ...buttonColors.flatMap((c) => (c.fg ? [c.bg, c.fg] : [c.bg])),
    ...unusedColors,
  ]
  resolved.value = Object.fromEntries(
    names.map((name) => [name, style.getPropertyValue(`--${name}`).trim()]),
  )
}

onMounted(readTokens)

const dark = ref(false)

const toggleTheme = () => {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  readTokens()
}

const busy = ref<'adjacent' | 'replace' | null>(null)
const clicks = ref(0)

// The counter is the test: it proves a consumer's own @click really is
// blocked while the button is busy, rather than merely looking blocked.
const run = (mode: 'adjacent' | 'replace') => {
  clicks.value += 1
  busy.value = mode
  setTimeout(() => (busy.value = null), 2000)
}
</script>

<template>
  <main class="min-h-svh bg-background p-10 text-foreground">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">delta-ui</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Development showcase. Components live in packages/registry.
        </p>
      </div>
      <Button variant="outline" size="sm" class="press-scale" @click="toggleTheme">
        {{ dark ? 'Light' : 'Dark' }}
      </Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Button colours</h2>
    <p class="mb-4 max-w-prose text-sm text-muted-foreground">
      Every colour token the button reads, paired the way it uses them. Values are read from the
      live document, so the theme toggle changes what is shown here too.
    </p>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in buttonColors" :key="c.bg" class="rounded-lg border border-input p-3">
        <div
          class="mb-3 flex h-20 items-center justify-center rounded-md text-sm font-medium"
          :style="{
            background: `var(--${c.bg})`,
            color: c.fg ? `var(--${c.fg})` : undefined,
          }"
        >
          <span v-if="c.fg">Label on {{ c.bg }}</span>
        </div>
        <p class="font-mono text-xs">--{{ c.bg }}</p>
        <p class="font-mono text-xs text-muted-foreground">{{ resolved[c.bg] }}</p>
        <template v-if="c.fg">
          <p class="mt-1 font-mono text-xs">--{{ c.fg }}</p>
          <p class="font-mono text-xs text-muted-foreground">{{ resolved[c.fg] }}</p>
        </template>
        <p class="mt-2 text-xs text-muted-foreground">{{ c.role }}</p>
      </div>
    </div>

    <p class="mt-6 mb-3 max-w-prose text-sm text-muted-foreground">
      Defined in the theme but not read by the button yet - they are here so the palette is
      complete, not because the button uses them:
    </p>
    <div class="flex flex-wrap gap-3">
      <div v-for="name in unusedColors" :key="name" class="w-40">
        <div
          class="h-10 rounded-md border border-input"
          :style="{ background: `var(--${name})` }"
        ></div>
        <p class="mt-1 font-mono text-xs">--{{ name }}</p>
        <p class="font-mono text-xs text-muted-foreground">{{ resolved[name] }}</p>
      </div>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Colour variants</h2>
    <p class="mb-4 max-w-prose text-sm text-muted-foreground">
      Every variant in every state it can be in. Hover and focus are the two you have to produce
      yourself - tab through the row to see the focus ring.
    </p>
    <div class="overflow-x-auto">
      <table class="w-full min-w-3xl border-collapse text-left">
        <thead>
          <tr class="border-b border-input">
            <th class="p-2 text-xs font-medium text-muted-foreground">variant</th>
            <th class="p-2 text-xs font-medium text-muted-foreground">normal</th>
            <th class="p-2 text-xs font-medium text-muted-foreground">disabled</th>
            <th class="p-2 text-xs font-medium text-muted-foreground">loading</th>
            <th class="p-2 text-xs font-medium text-muted-foreground">loading, replace</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v" class="border-b border-input/60">
            <td class="p-2 font-mono text-xs">{{ v }}</td>
            <td class="p-2"><Button :variant="v">Button</Button></td>
            <td class="p-2"><Button :variant="v" disabled>Button</Button></td>
            <td class="p-2"><Button :variant="v" loading>Button</Button></td>
            <td class="p-2"><Button :variant="v" loading loading-mode="replace">Button</Button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Custom spinner</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      The <code>#spinner</code> slot replaces the built-in one entirely. It cannot be combined with
      <code>as-child</code> - Slot takes exactly one child - so that pairing falls back to the
      built-in.
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <Button loading>Built-in</Button>
      <Button loading>
        <template #spinner>
          <span class="animate-pulse">...</span>
        </template>
        Custom, adjacent
      </Button>
      <Button variant="outline" loading loading-mode="replace">
        <template #spinner>
          <span class="animate-pulse text-xs tracking-widest">WAIT</span>
        </template>
        Custom, replace
      </Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Sizes</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </div>
    <p class="mt-3 mb-3 text-sm text-muted-foreground">
      Icon sizes are square and match those heights, so they line up with a text button of the same
      size:
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="icon-sm" aria-label="Add">+</Button>
      <Button size="default">Default</Button>
      <Button size="icon" aria-label="Add">+</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-lg" aria-label="Add">+</Button>
      <Button size="xl">Extra large</Button>
      <Button size="icon-xl" aria-label="Add">+</Button>
    </div>
    <p class="mt-3 max-w-prose text-sm text-muted-foreground">
      <code>xl</code> is 48px, which is exactly the touch-target minimum - so
      <code>touch-target</code> has nothing left to add on that size.
    </p>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">States</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
      <Button as="a" href="https://vuejs.org">as=&quot;a&quot;</Button>
      <Button as-child>
        <a href="https://vuejs.org">as-child</a>
      </Button>
      <Button class="rounded-full">class overrides the radius</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Loading</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      Press either button: it stays busy for two seconds. Tab to it first and watch the focus ring
      survive the whole time - that is the point of aria-disabled over the native attribute. Clicks
      counted so far: <strong>{{ clicks }}</strong> - it must not move while a button is busy.
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <Button :loading="busy === 'adjacent'" @click="run('adjacent')">Save (adjacent)</Button>
      <Button
        variant="outline"
        loading-mode="replace"
        :loading="busy === 'replace'"
        @click="run('replace')"
      >
        Save (replace, width held)
      </Button>
      <Button variant="ghost" loading>Ghost, stuck busy</Button>
      <Button variant="link" loading loading-mode="replace">Link, stuck busy</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Press feedback</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      <code>press-scale</code> is a utility, not a prop - pass it through <code>class</code>. Hold
      the second button to see it dip. It respects <code>prefers-reduced-motion</code>.
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <Button>No press feedback</Button>
      <Button class="press-scale">Press and hold me</Button>
      <Button variant="outline" class="press-scale">Outline, same utility</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-muted-foreground">Touch target</h2>
    <p class="mb-3 max-w-prose text-sm text-muted-foreground">
      All three look identical. The outlines below are drawn by the showcase, not by the component -
      they reveal where each button actually accepts a press.
    </p>
    <div
      class="flex flex-wrap items-center gap-6 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
    >
      <Button size="sm">none - 32px</Button>
      <Button size="sm" touch-target="expand">expand - 48px, may overlap</Button>
      <Button size="sm" touch-target="wrapper">wrapper - 48px, reserved</Button>
      <Button size="icon" touch-target="expand" aria-label="Add">+</Button>
      <Button size="sm" touch-target="expand">Ok</Button>
    </div>
    <p class="mt-3 max-w-prose text-sm text-muted-foreground">
      The last one is the case width expansion exists for: "Ok" renders about 40px wide, so its
      target grows sideways too. On the wider buttons above, max(48px, 100%) resolves to 100% and
      changes nothing.
    </p>
  </main>
</template>
