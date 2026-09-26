<script setup lang="ts">
import {
  Bold,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Copy,
  Download,
  Ellipsis,
  FileText,
  HardDrive,
  Heart,
  Italic,
  Mail,
  MessageSquare,
  Music,
  Pause,
  Play,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Underline,
  UserPlus,
  Volume1,
  Volume2,
} from '@lucide/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { provideOverlayPortalTarget } from '@delta-ui/core/overlay'
import MemberMenu from '~/components/themes/MemberMenu.vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/ui/item'
import { Kbd } from '@/ui/kbd'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination'
import { Radio, RadioGroup } from '@/ui/radio-group'
import { ScrollArea } from '@/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Skeleton } from '@/ui/skeleton'
import { Slider } from '@/ui/slider'
import { Spinner } from '@/ui/spinner'
import { Switch } from '@/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Textarea } from '@/ui/textarea'
import { Toaster, useToast } from '@/ui/toast'

const portalTarget = ref<HTMLElement>()
provideOverlayPortalTarget(portalTarget)

const toast = useToast()
const group = 'theme-preview'

const budget = ref(40)
const plan = ref('pro')

const plans = [
  { value: 'starter', label: 'Starter', description: 'For individuals.' },
  { value: 'pro', label: 'Pro', description: 'For small teams.' },
]

const roles = ['Owner', 'Editor', 'Viewer'] as const
const roleColor = { Owner: 'primary', Editor: 'success', Viewer: 'neutral' } as const

interface Member {
  initials: string
  name: string
  email: string
  role: (typeof roles)[number]
  avatar: string
}

const team = ref<Member[]>([
  { initials: 'AL', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', avatar: 'bg-primary/15 text-primary' },
  { initials: 'GH', name: 'Grace Hopper', email: 'grace@example.com', role: 'Editor', avatar: 'bg-success/15 text-success-text' },
  { initials: 'AT', name: 'Alan Turing', email: 'alan@example.com', role: 'Viewer', avatar: 'bg-warning/15 text-warning-text' },
  { initials: 'KJ', name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Viewer', avatar: 'bg-muted text-muted-foreground' },
])

const leaving = ref<Member>()
const confirmRemove = ref(false)

const askRemove = (member: Member) => {
  leaving.value = member
  confirmRemove.value = true
}

const remove = () => {
  const member = leaving.value
  if (!member) return
  const index = team.value.indexOf(member)
  team.value.splice(index, 1)
  toast.add({
    group,
    title: `${member.name} removed`,
    description: 'They no longer see this project.',
    actions: [{ label: 'Undo', onClick: () => team.value.splice(index, 0, member) }],
  })
}

const message = (member: Member) => toast.add({ group, color: 'primary', title: `Message sent to ${member.name.split(' ')[0]}` })

const track = { title: 'Midnight City', artist: 'M83', length: 243 }
const position = ref(71)
const volume = ref(60)
const playing = ref(false)
const liked = ref(true)

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

let ticker: ReturnType<typeof setInterval> | undefined
watch(playing, (value) => {
  clearInterval(ticker)
  if (value) ticker = setInterval(() => (position.value = (position.value + 1) % track.length), 1000)
})
onBeforeUnmount(() => clearInterval(ticker))

const inbox = [
  { id: 1, icon: MessageSquare, title: 'Grace commented on Roadmap', time: '2m' },
  { id: 2, icon: FileText, title: 'Alan shared Budget.xlsx', time: '1h' },
  { id: 3, icon: Download, title: 'Your export is ready', time: '3h' },
  { id: 4, icon: UserPlus, title: 'Ada invited you to Design', time: 'Yesterday' },
  { id: 5, icon: CircleCheck, title: 'Build 482 passed', time: 'Yesterday' },
  { id: 6, icon: HardDrive, title: 'Storage is 92% full', time: 'Mon' },
  { id: 7, icon: Mail, title: 'Weekly summary is ready', time: 'Mon' },
  { id: 8, icon: MessageSquare, title: 'Alan resolved 3 comments', time: 'Sun' },
]
const unread = ref(new Set([1, 2, 3, 6]))
const inboxTab = ref('all')
const inboxQuery = ref('')

const inboxItems = computed(() =>
  inbox.filter(
    (entry) =>
      (inboxTab.value === 'all' || unread.value.has(entry.id)) &&
      entry.title.toLowerCase().includes(inboxQuery.value.trim().toLowerCase()),
  ),
)

const invoiceStatus = (index: number) =>
  index === 0
    ? { label: 'Pending', color: 'warning' as const }
    : index === 2
      ? { label: 'Overdue', color: 'destructive' as const }
      : index % 7 === 5
        ? { label: 'Refunded', color: 'neutral' as const }
        : { label: 'Paid', color: 'success' as const }

const months = ['Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr']
const invoices = Array.from({ length: 24 }, (_, index) => ({
  id: `INV-${1042 - index}`,
  date: `${28 - (index % 4) * 7} ${months[Math.floor(index / 4)]} 2026`,
  amount: `$${(120 + ((index * 137) % 380)).toFixed(2)}`,
  status: invoiceStatus(index),
}))
const invoicePage = ref(1)
const invoicesPerPage = 4
const pageOfInvoices = computed(() =>
  invoices.slice((invoicePage.value - 1) * invoicesPerPage, invoicePage.value * invoicesPerPage),
)

const link = 'https://delta.dev/d/q4-roadmap'
const copied = ref(false)
const copyLink = () => {
  navigator.clipboard?.writeText(link).catch(() => {})
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
  toast.add({ group, color: 'success', title: 'Link copied' })
}
const access = ref<Record<string, string>>({ 'ada@example.com': 'edit', 'grace@example.com': 'view' })

const formats = ref<string[]>([])
const toggleFormat = (format: string) =>
  (formats.value = formats.value.includes(format) ? formats.value.filter((entry) => entry !== format) : [...formats.value, format])
const formatting = [
  { key: 'bold', label: 'Bold', icon: Bold },
  { key: 'italic', label: 'Italic', icon: Italic },
  { key: 'underline', label: 'Underline', icon: Underline },
]

const send = () =>
  toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 1500)), {
    loading: { group, title: 'Sending…' },
    success: () => ({ title: 'Reply sent', description: 'Grace will see it in the thread.' }),
    error: () => ({ title: 'Could not send' }),
  })
</script>

<template>
  <div data-theme-preview class="flex flex-col overflow-hidden rounded-2xl border bg-background text-foreground">
    <div class="flex h-12 shrink-0 items-center justify-between gap-2 border-b ps-4 pe-2">
      <span class="text-label-lg text-muted-foreground">Preview</span>
      <slot name="actions" />
    </div>

    <ScrollArea class="min-h-0 flex-1">
      <div class="@container p-4 sm:p-6">
        <div class="gap-4 *:mb-4 *:break-inside-avoid @2xl:columns-2 @5xl:columns-3">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your email to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input type="email" placeholder="ada@example.com" />
                </Field>
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input type="password" default-value="analytical" />
                  <FieldDescription>At least 8 characters.</FieldDescription>
                </Field>
                <Button>Create account</Button>
                <Separator label="or continue with" />
                <div class="grid grid-cols-2 gap-2">
                  <Button variant="outline" color="neutral">GitHub</Button>
                  <Button variant="outline" color="neutral">Google</Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Right-click a person, or use the menu button.</CardDescription>
            </CardHeader>
            <CardContent class="px-2">
              <ItemGroup v-if="team.length" class="gap-0.5">
                <Item v-for="member in team" :key="member.email" size="sm" class="hover:bg-muted/60">
                  <ItemMedia>
                    <span :class="['flex size-9 items-center justify-center rounded-full text-label-md', member.avatar]">
                      {{ member.initials }}
                    </span>
                  </ItemMedia>
                  <ItemContent class="min-w-0">
                    <ItemTitle class="w-full truncate">{{ member.name }}</ItemTitle>
                    <ItemDescription class="truncate">{{ member.email }}</ItemDescription>
                  </ItemContent>
                  <ItemActions class="gap-1">
                    <Badge variant="soft" :color="roleColor[member.role]">{{ member.role }}</Badge>
                    <Button variant="ghost" color="neutral" size="icon-sm" :aria-label="`Actions for ${member.name}`">
                      <Ellipsis />
                      <MemberMenu
                        v-model:role="member.role"
                        :name="member.name"
                        :roles="roles"
                        @message="message(member)"
                        @remove="askRemove(member)"
                      />
                    </Button>
                  </ItemActions>
                  <MemberMenu
                    v-model:role="member.role"
                    context-menu
                    :name="member.name"
                    :roles="roles"
                    @message="message(member)"
                    @remove="askRemove(member)"
                  />
                </Item>
              </ItemGroup>
              <p v-else class="px-4 py-3 text-body-md text-muted-foreground">Nobody else has access.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="flex flex-col gap-5">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/50 text-primary-foreground"
                >
                  <Music class="size-7" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-title-md">{{ track.title }}</p>
                  <p class="truncate text-body-md text-muted-foreground">{{ track.artist }}</p>
                </div>
                <Button
                  variant="ghost"
                  color="neutral"
                  size="icon"
                  :aria-label="liked ? 'Unlike' : 'Like'"
                  :aria-pressed="liked"
                  @click="liked = !liked"
                >
                  <Heart :class="liked && 'fill-current text-destructive'" />
                </Button>
              </div>
              <div class="flex flex-col gap-2">
                <Slider v-model="position" variant="inset" :max="track.length" aria-label="Position" :aria-valuetext="clock(position)" />
                <div class="flex justify-between text-body-sm text-muted-foreground tabular-nums">
                  <span>{{ clock(position) }}</span>
                  <span>-{{ clock(track.length - position) }}</span>
                </div>
              </div>
              <div class="flex items-center justify-center gap-2">
                <Button variant="ghost" color="neutral" size="icon" aria-label="Shuffle"><Shuffle /></Button>
                <Button variant="ghost" color="neutral" size="icon" aria-label="Previous" @click="position = 0"><SkipBack /></Button>
                <Button size="icon-lg" class="rounded-full" :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
                  <Pause v-if="playing" />
                  <Play v-else />
                </Button>
                <Button variant="ghost" color="neutral" size="icon" aria-label="Next"><SkipForward /></Button>
                <Button variant="ghost" color="neutral" size="icon" aria-label="Repeat"><Repeat /></Button>
              </div>
              <div class="flex items-center gap-3 text-muted-foreground">
                <Volume1 class="size-4 shrink-0" />
                <Slider v-model="volume" variant="inset" size="sm" aria-label="Volume" :aria-valuetext="`${volume}%`" />
                <Volume2 class="size-4 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div class="flex items-center justify-between gap-2">
                <CardTitle>Inbox</CardTitle>
                <Button variant="ghost" size="xs" :disabled="!unread.size" @click="unread = new Set()">Mark all read</Button>
              </div>
            </CardHeader>
            <CardContent class="flex flex-col gap-3 px-2">
              <div class="flex flex-col gap-3 px-4">
                <Tabs v-model="inboxTab">
                  <TabsList size="sm" class="w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread
                      <Badge v-if="unread.size" size="xs" class="tabular-nums">{{ unread.size }}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <InputGroup size="sm">
                  <InputGroupInput v-model="inboxQuery" placeholder="Search" aria-label="Search the inbox" />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Kbd>⌘K</Kbd>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <ScrollArea class="scroll-fade-overlay-y h-60">
                <ItemGroup v-if="inboxItems.length" class="gap-0.5">
                  <Item
                    v-for="entry in inboxItems"
                    :key="entry.id"
                    as="button"
                    type="button"
                    size="xs"
                    class="w-full px-4"
                    @click="unread.delete(entry.id)"
                  >
                    <ItemMedia variant="icon">
                      <component :is="entry.icon" />
                    </ItemMedia>
                    <ItemContent class="min-w-0">
                      <ItemTitle
                        :class="['w-full truncate', unread.has(entry.id) ? 'text-foreground' : 'font-normal text-muted-foreground']"
                      >
                        {{ entry.title }}
                      </ItemTitle>
                      <ItemDescription>{{ entry.time }}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <span v-if="unread.has(entry.id)" class="size-2 rounded-full bg-primary" aria-label="Unread" />
                    </ItemActions>
                  </Item>
                </ItemGroup>
                <p v-else class="px-4 py-8 text-center text-body-md text-muted-foreground">Nothing here.</p>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Everything you were billed this year.</CardDescription>
            </CardHeader>
            <CardContent class="px-2">
              <ItemGroup class="gap-0.5">
                <Item v-for="invoice in pageOfInvoices" :key="invoice.id" size="sm">
                  <ItemContent>
                    <ItemTitle>{{ invoice.id }}</ItemTitle>
                    <ItemDescription>{{ invoice.date }}</ItemDescription>
                  </ItemContent>
                  <ItemActions class="gap-3">
                    <span class="text-label-lg tabular-nums">{{ invoice.amount }}</span>
                    <Badge variant="soft" :color="invoice.status.color" class="w-18 justify-center">{{ invoice.status.label }}</Badge>
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
            <CardFooter class="justify-center">
              <Pagination
                v-model:page="invoicePage"
                :total="invoices.length"
                :items-per-page="invoicesPerPage"
                :sibling-count="0"
                show-edges
                size="sm"
              >
                <PaginationContent v-slot="{ items }">
                  <PaginationItem>
                    <PaginationPrevious class="w-8 px-0" aria-label="Previous page">
                      <ChevronLeft class="rtl:rotate-180" />
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem v-for="(item, index) in items" :key="index">
                    <PaginationLink v-if="item.type === 'page'" :value="item.value" />
                    <PaginationEllipsis v-else />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext class="w-8 px-0" aria-label="Next page">
                      <ChevronRight class="rtl:rotate-180" />
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
              <CardDescription>Anyone with the link can view.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <InputGroup>
                <InputGroupInput :default-value="link" readonly aria-label="Link" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" :aria-label="copied ? 'Copied' : 'Copy link'" @click="copyLink">
                    <Check v-if="copied" />
                    <Copy v-else />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Separator />
              <p class="text-label-lg">People with access</p>
              <div v-for="member in team.slice(0, 2)" :key="member.email" class="flex items-center gap-3">
                <span :class="['flex size-8 shrink-0 items-center justify-center rounded-full text-label-sm', member.avatar]">
                  {{ member.initials }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-label-lg">{{ member.name }}</p>
                  <p class="truncate text-body-sm text-muted-foreground">{{ member.email }}</p>
                </div>
                <Select v-model="access[member.email]">
                  <SelectTrigger size="sm" class="w-28" :aria-label="`Access for ${member.name}`">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">Can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
              <CardDescription>Change it at any time.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <RadioGroup v-model="plan" variant="card" orientation="horizontal">
                  <Field v-for="option in plans" :key="option.value" orientation="horizontal">
                    <Radio :value="option.value" />
                    <FieldContent>
                      <FieldLabel>{{ option.label }}</FieldLabel>
                      <FieldDescription>{{ option.description }}</FieldDescription>
                    </FieldContent>
                  </Field>
                </RadioGroup>
                <Field>
                  <FieldLabel>Monthly budget</FieldLabel>
                  <Slider v-model="budget" :max="100" />
                  <FieldDescription>${{ budget * 10 }} a month.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Billing country</FieldLabel>
                  <Select default-value="fi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fi">Finland</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter class="justify-end gap-2">
              <Button variant="ghost" color="neutral">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reply to Grace</CardTitle>
              <CardDescription>Re: Q4 roadmap review</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-3">
              <ButtonGroup aria-label="Formatting">
                <Button
                  v-for="format in formatting"
                  :key="format.key"
                  variant="outline"
                  color="neutral"
                  size="icon-sm"
                  :aria-label="format.label"
                  :aria-pressed="formats.includes(format.key)"
                  class="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                  @click="toggleFormat(format.key)"
                >
                  <component :is="format.icon" />
                </Button>
              </ButtonGroup>
              <Textarea
                autoresize
                placeholder="Write a reply…"
                aria-label="Reply"
                :class="{ 'font-semibold': formats.includes('bold'), italic: formats.includes('italic'), underline: formats.includes('underline') }"
              />
            </CardContent>
            <CardFooter class="justify-between gap-2">
              <p class="text-body-sm text-muted-foreground"><Kbd>⌘</Kbd> <Kbd>Enter</Kbd> to send</p>
              <ButtonGroup aria-label="Send">
                <Button @click="send">Send</Button>
                <ButtonGroupSeparator />
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button size="icon" aria-label="More send options"><ChevronDown /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @select="send">Send now</DropdownMenuItem>
                    <DropdownMenuItem>Schedule for tomorrow</DropdownMenuItem>
                    <DropdownMenuItem>Send without notifying</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you hear about.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Push notifications</FieldLabel>
                    <FieldDescription>Mentions and replies.</FieldDescription>
                  </FieldContent>
                  <Switch :default-value="true" />
                </Field>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Weekly digest</FieldLabel>
                    <FieldDescription>A summary every Monday.</FieldDescription>
                  </FieldContent>
                  <Switch />
                </Field>
                <Separator />
                <Field orientation="horizontal">
                  <Checkbox :default-value="true" />
                  <FieldLabel>Email me about security</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox />
                  <FieldLabel>Product news</FieldLabel>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Every variant in the brand colour and in neutral.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-3">
              <div class="flex flex-wrap gap-2">
                <Button>Solid</Button>
                <Button variant="soft">Soft</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div class="flex flex-wrap gap-2">
                <Button color="neutral">Solid</Button>
                <Button variant="soft" color="neutral">Soft</Button>
                <Button variant="outline" color="neutral">Outline</Button>
                <Button variant="ghost" color="neutral">Ghost</Button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <Button disabled>
                  <Spinner data-icon="inline-start" />
                  Saving
                </Button>
                <Button variant="soft" color="success">Approve</Button>
                <Button variant="soft" color="warning">Review</Button>
                <Button color="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>The typescale in the chosen font.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
              <p class="text-display-sm">Aa Bb Cc</p>
              <p class="text-headline-sm">The quick brown fox</p>
              <p class="text-title-md">jumps over the lazy dog.</p>
              <p class="text-body-md text-muted-foreground">
                Body text reads at 14px with 20px lines. Numbers: 0123456789.
              </p>
              <p class="text-label-md text-primary">A label in the brand colour</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>

    <Dialog v-model:open="confirmRemove">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {{ leaving?.name }}?</DialogTitle>
          <DialogDescription>They lose access to this project at once. You can invite them again later.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline" color="neutral">Cancel</Button>
          </DialogClose>
          <DialogClose as-child>
            <Button color="destructive" @click="remove">Remove</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div ref="portalTarget" data-slot="preview-portal" class="contents text-foreground" />
    <Toaster :group="group" position="bottom-end" />
  </div>
</template>
