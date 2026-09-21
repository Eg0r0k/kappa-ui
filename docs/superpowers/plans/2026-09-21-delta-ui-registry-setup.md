# delta-ui: окружение под registry — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить стартер Vite + Vue в монорепозиторий, из которого собирается shadcn-совместимый registry с одним эталонным компонентом Button.

**Architecture:** pnpm workspace из двух пакетов. `packages/registry` — источник правды с компонентами; `apps/docs` — витрина разработки, она же статический хост для публикуемых JSON. Скрипт `scripts/build-registry.ts` читает манифест `packages/registry/registry.json`, инлайнит содержимое файлов и пишет `apps/docs/public/r/*.json`. Витрина импортирует компоненты напрямую из исходников через алиас, а не из сгенерированного JSON.

**Tech Stack:** Vue 3.5 (`<script setup>` + TS), Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`), reka-ui 2.10, class-variance-authority, clsx + tailwind-merge, Node 24, pnpm 10.

Спека: `docs/superpowers/specs/2026-09-21-delta-ui-registry-setup-design.md`

## Global Constraints

- **Никаких дизайн-токенов.** В `globals.css` нет ни `@theme`, ни `--background` / `--foreground` / `--radius`. Компоненты стилизуются утилитами палитры Tailwind напрямую. Единственное, что там есть помимо `@import "tailwindcss"` — директива `@source` на каталог registry: это конфигурация сканера классов, без неё компоненты отрисуются без стилей. Она добавляется в Task 4, Step 4, когда каталог уже существует, — не раньше.
- **Алиас `@` указывает на `packages/registry/src`**, а не на исходники витрины. Это сделано намеренно: внутри компонента путь `@/lib/utils` резолвится одинаково и у нас, и в проекте потребителя после копирования. Собственные файлы витрины импортируются через алиас `~` или относительно.
- **Пути в `files[].path` — относительно каталога манифеста** (`packages/registry/`), не относительно корня репозитория.
- **`scripts/build-registry.ts` запускается как `node scripts/build-registry.ts`**, без транспайлера. Node 24 стирает типы штатно, поэтому в скрипте допустим только стираемый синтаксис: никаких `enum`, `namespace`, параметров-свойств конструктора и `const enum`. Тип-алиасы и `interface` — можно.
- **Домен-плейсхолдер `https://delta-ui.dev`** живёт единственной константой `HOMEPAGE` в `scripts/build-registry.ts`. Манифест `registry.json` поле `homepage` **не содержит** — скрипт подставляет его сам. (Это уточнение к примеру JSON в спеке, где `homepage` показан внутри манифеста: единственный источник правды — константа.)
- **Каталог `apps/docs/public/r/` генерируемый** и в git не попадает.
- Все допустимые значения `type` в registry: `registry:block`, `registry:component`, `registry:lib`, `registry:hook`, `registry:ui`, `registry:page`, `registry:file`. Для `registry:page` и `registry:file` обязательно поле `target`.
- Команды в плане даны для PowerShell на Windows. `&&` в PowerShell 5.1 не работает — команды разделены `;` или вынесены в отдельные строки.

---

### Task 1: Нормализация переводов строк

Репозиторий разрабатывается на Windows, но содержимое компонентов попадает в `files[].content` публикуемых JSON дословно. Без нормализации в registry утекут `CRLF`, и файлы, которые CLI запишет потребителю, будут отличаться от исходных на каждой строке.

**Files:**
- Create: `.gitattributes`

**Interfaces:**
- Consumes: ничего
- Produces: рабочее дерево с `LF` во всех текстовых файлах — на это полагается Task 6, читающий файлы с диска

- [ ] **Step 1: Зафиксировать текущее состояние переводов строк**

Run:
```powershell
git -C F:\delta-ui ls-files --eol src/App.vue
```
Expected: строка вида `i/lf    w/crlf  attr/    src/App.vue` — в рабочем дереве `CRLF`.

- [ ] **Step 2: Создать `.gitattributes`**

`.gitattributes`:
```gitattributes
# Единый перевод строки во всём репозитории: содержимое компонентов
# попадает в публикуемый registry дословно.
* text=auto eol=lf

*.png binary
*.ico binary
*.woff binary
*.woff2 binary
```

- [ ] **Step 3: Проверить, что дерево чистое перед перенормализацией**

Run:
```powershell
git -C F:\delta-ui status --short
```
Expected: единственная строка `?? .gitattributes`. Если есть другие изменения — сначала закоммитить их, шаг 5 использует `git reset --hard` и сотрёт незакоммиченное.

- [ ] **Step 4: Перенормализовать индекс и закоммитить**

Run:
```powershell
git -C F:\delta-ui add --renormalize .
git -C F:\delta-ui add .gitattributes
git -C F:\delta-ui commit -m "chore: normalize line endings to LF"
```

- [ ] **Step 5: Переписать рабочее дерево из индекса**

Git не перезаписывает файлы, которые считает актуальными, поэтому `CRLF` останется в рабочем дереве до принудительного пересчёта. Дерево на этом шаге чистое (только что закоммичено), поэтому `reset --hard` ничего не теряет.

Run:
```powershell
git -C F:\delta-ui rm --cached -r . --quiet
git -C F:\delta-ui reset --hard
```

- [ ] **Step 6: Проверить результат**

Run:
```powershell
git -C F:\delta-ui ls-files --eol src/App.vue vite.config.ts package.json
```
Expected: у каждого файла и `i/lf`, и `w/lf`.

Run:
```powershell
git -C F:\delta-ui status --short
```
Expected: пустой вывод.

---

### Task 2: Каркас workspace и переезд приложения в `apps/docs`

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `apps/docs/package.json`
- Create: `apps/docs/tsconfig.json`
- Modify: корневой `package.json` (полностью переписывается)
- Delete: корневой `tsconfig.json` (новый появится в Task 6)
- Modify: `.gitignore` (добавляется одна строка)
- Move: `index.html`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `src/`, `public/` → `apps/docs/`

**Interfaces:**
- Consumes: ничего
- Produces: скрипты `pnpm dev`, `pnpm build`, `pnpm typecheck` в корне; пакет `@delta-ui/docs`

- [ ] **Step 1: Перенести файлы приложения**

`git mv` сохраняет историю. Каталог создаётся заранее, иначе `git mv` ругнётся.

Run:
```powershell
New-Item -ItemType Directory -Force F:\delta-ui\apps\docs | Out-Null
git -C F:\delta-ui mv index.html vite.config.ts tsconfig.app.json tsconfig.node.json src public apps/docs/
```

- [ ] **Step 2: Проверить, что переезд прошёл**

Run:
```powershell
git -C F:\delta-ui status --short
```
Expected: список строк `R  <старый путь> -> apps/docs/<новый путь>` для всех перечисленных файлов, включая содержимое `src/` и `public/`. В корне не должно остаться ни `src`, ни `public`.

- [ ] **Step 3: Создать `pnpm-workspace.yaml`**

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 4: Переписать корневой `package.json`**

Зависимости приложения уезжают в `apps/docs/package.json` (следующий шаг). В корне остаются только инструменты, нужные скрипту сборки и общему typecheck.

`package.json`:
```json
{
  "name": "delta-ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "dev": "pnpm --filter @delta-ui/docs dev",
    "build": "pnpm --filter @delta-ui/docs build",
    "preview": "pnpm --filter @delta-ui/docs preview",
    "typecheck": "pnpm -r typecheck",
    "registry:build": "node scripts/build-registry.ts"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "typescript": "~6.0.2"
  }
}
```

`typecheck` пока обходит только пакеты. В Task 6, когда появится `scripts/`, он расширится до `tsc -p tsconfig.json && pnpm -r typecheck`. `registry:build` объявлен заранее, но до Task 6 работать не будет — это нормально, в критерии проверки этой задачи он не входит.

- [ ] **Step 5: Создать `apps/docs/package.json`**

`apps/docs/package.json`:
```json
{
  "name": "@delta-ui/docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "vue-tsc -b"
  },
  "dependencies": {
    "@vueuse/core": "^15.0.0",
    "vue": "^3.5.42"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-vue": "^6.0.8",
    "@vue/tsconfig": "^0.9.1",
    "tailwindcss": "^4.3.3",
    "vite": "^8.3.0",
    "vue-tsc": "^3.3.11"
  }
}
```

`@delta-ui/registry` в зависимости пока не добавляется — пакета ещё нет, он появится в Task 4.

- [ ] **Step 6: Создать `apps/docs/tsconfig.json`**

Это solution-файл: он ничего не компилирует сам, только ссылается на два проекта. Именно его читает `vue-tsc -b`.

`apps/docs/tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 7: Удалить корневой `tsconfig.json`**

Это solution-файл стартера, ссылающийся на `tsconfig.app.json` и `tsconfig.node.json` — оба уехали в `apps/docs`, так что ссылки битые. Новый корневой конфиг, покрывающий `scripts/`, создаётся в Task 6, когда появится сам каталог: TypeScript падает с `TS18003: No inputs were found`, если `include` не находит ни одного файла, поэтому создавать его раньше нельзя.

Run:
```powershell
git -C F:\delta-ui rm -q tsconfig.json
```

- [ ] **Step 8: Добавить генерируемый каталог в `.gitignore`**

Добавить в конец `.gitignore`:
```gitignore

# Сгенерированный registry
apps/docs/public/r/
```

- [ ] **Step 9: Переустановить зависимости под workspace**

Старый `node_modules` был собран для одного пакета и не соответствует новой раскладке.

Run:
```powershell
Remove-Item -Recurse -Force F:\delta-ui\node_modules
pnpm -C F:\delta-ui install
```
Expected: pnpm сообщает об установке для двух проектов (корень и `apps/docs`), завершается без ошибок. `pnpm-lock.yaml` обновляется.

- [ ] **Step 10: Проверить typecheck**

Run:
```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: завершается без вывода ошибок, код возврата 0.

- [ ] **Step 11: Проверить, что витрина запускается**

Run:
```powershell
pnpm -C F:\delta-ui dev
```
Expected: Vite печатает `Local: http://localhost:5173/`. Открыть адрес — видна неизменённая стартовая страница Vite + Vue (логотипы, счётчик). Остановить сервер по Ctrl+C.

- [ ] **Step 12: Commit**

```powershell
git -C F:\delta-ui add -A
git -C F:\delta-ui commit -m "refactor: move app into apps/docs, set up pnpm workspace"
```

---

### Task 3: Tailwind v4, алиасы и чистка стартера

**Files:**
- Modify: `apps/docs/vite.config.ts` (полностью переписывается)
- Modify: `apps/docs/tsconfig.app.json` (полностью переписывается)
- Create: `apps/docs/src/styles/globals.css`
- Modify: `apps/docs/src/main.ts` (полностью переписывается)
- Modify: `apps/docs/src/App.vue` (полностью переписывается)
- Delete: `apps/docs/src/style.css`, `apps/docs/src/components/HelloWorld.vue`, `apps/docs/src/assets/hero.png`, `apps/docs/src/assets/vite.svg`, `apps/docs/src/assets/vue.svg`, `apps/docs/public/icons.svg`

**Interfaces:**
- Consumes: раскладку `apps/docs` из Task 2
- Produces: алиасы `@` → `packages/registry/src` и `~` → `apps/docs/src`, работающие и в Vite, и в TypeScript; подключённый Tailwind

- [ ] **Step 1: Удалить файлы стартера**

Пути указываются от корня репозитория.

Run:
```powershell
git -C F:\delta-ui rm -q apps/docs/src/style.css apps/docs/src/components/HelloWorld.vue apps/docs/src/assets/hero.png apps/docs/src/assets/vite.svg apps/docs/src/assets/vue.svg apps/docs/public/icons.svg
```

`apps/docs/public/favicon.svg` остаётся — на него ссылается `index.html`.

- [ ] **Step 2: Переписать `apps/docs/vite.config.ts`**

`apps/docs/vite.config.ts`:
```ts
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // Намеренно указывает на registry, а не на src витрины: внутри
      // компонента путь `@/lib/utils` должен резолвиться так же, как он
      // будет резолвиться в проекте потребителя после копирования.
      '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 3: Переписать `apps/docs/tsconfig.app.json`**

Пути обязаны совпадать с алиасами Vite, иначе `vue-tsc` и дев-сервер разойдутся во мнениях.

`apps/docs/tsconfig.app.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["../../packages/registry/src/*"],
      "~/*": ["./src/*"]
    },

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

- [ ] **Step 4: Создать `apps/docs/src/styles/globals.css`**

Никаких `@theme` и CSS-переменных — токены в эту итерацию не входят.

`apps/docs/src/styles/globals.css`:
```css
@import "tailwindcss";
```

Позже сюда добавится директива `@source` на `packages/registry/src` — без неё Tailwind не найдёт классы компонентов. Сейчас её добавить нельзя: каталога ещё не существует, а `@source` на несуществующий путь Tailwind не обязан переваривать молча. Директива появится в Task 4, вместе с самим каталогом.

- [ ] **Step 5: Переписать `apps/docs/src/main.ts`**

`apps/docs/src/main.ts`:
```ts
import { createApp } from 'vue'

import App from './App.vue'
import './styles/globals.css'

createApp(App).mount('#app')
```

- [ ] **Step 6: Переписать `apps/docs/src/App.vue`**

Временная заглушка — в Task 5 сюда приедет галерея Button. Задача этого шага: доказать, что Tailwind работает.

`apps/docs/src/App.vue`:
```vue
<script setup lang="ts"></script>

<template>
  <main class="min-h-svh bg-white p-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
    <h1 class="text-2xl font-semibold tracking-tight">delta-ui</h1>
    <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      Витрина разработки. Компоненты живут в packages/registry.
    </p>
  </main>
</template>
```

- [ ] **Step 7: Проверить typecheck**

Run:
```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: 0 ошибок.

- [ ] **Step 8: Проверить, что Tailwind применился**

Run:
```powershell
pnpm -C F:\delta-ui dev
```
Expected: на странице заголовок «delta-ui» полужирным крупным шрифтом с отступом от краёв, ниже — серый текст меньшего кегля. Если стили не применились, страница будет выглядеть как немодифицированный HTML (Times New Roman, без отступов) — это признак того, что плагин Tailwind не подключился. Остановить сервер.

- [ ] **Step 9: Commit**

```powershell
git -C F:\delta-ui add -A
git -C F:\delta-ui commit -m "feat(docs): wire up Tailwind v4 and registry aliases"
```

---

### Task 4: Пакет `packages/registry` и хелпер `cn()`

**Files:**
- Create: `packages/registry/package.json`
- Create: `packages/registry/tsconfig.json`
- Create: `packages/registry/src/lib/utils.ts`
- Modify: `apps/docs/package.json` (добавляется зависимость)
- Modify: `apps/docs/src/styles/globals.css` (добавляется `@source`)
- Modify: `apps/docs/src/App.vue` (временное использование `cn`)

**Interfaces:**
- Consumes: алиас `@` → `packages/registry/src` из Task 3
- Produces: `cn(...inputs: ClassValue[]): string` по пути `@/lib/utils`; workspace-пакет `@delta-ui/registry`, в котором объявлены `reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`

- [ ] **Step 1: Создать `packages/registry/package.json`**

Зависимости компонентов объявлены здесь, а не в витрине: пакет должен быть самодостаточен, а перечень `dependencies` в `registry.json` — соответствовать реальным импортам.

`packages/registry/package.json`:
```json
{
  "name": "@delta-ui/registry",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "reka-ui": "^2.10.4",
    "tailwind-merge": "^3.7.0",
    "vue": "^3.5.42"
  },
  "devDependencies": {
    "@vue/tsconfig": "^0.9.1",
    "typescript": "~6.0.2",
    "vue-tsc": "^3.3.11"
  }
}
```

Поле `exports` не объявляется намеренно: витрина обращается к исходникам через алиас `@`, а не по имени пакета. Зависимость в `apps/docs/package.json` нужна только чтобы pnpm слинковал пакет и установил его зависимости.

- [ ] **Step 2: Создать `packages/registry/tsconfig.json`**

Внутри пакета `@/*` указывает на его собственный `src` — ровно так, как этот же путь будет резолвиться у потребителя.

`packages/registry/tsconfig.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "types": [],
    "allowArbitraryExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

- [ ] **Step 3: Создать `packages/registry/src/lib/utils.ts`**

`packages/registry/src/lib/utils.ts`:
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Указать Tailwind, где искать классы компонентов**

Каталог `packages/registry/src` теперь существует, поэтому директиву можно добавить — в Task 3 это было преждевременно.

Tailwind 4 определяет, какие файлы сканировать, отталкиваясь от расположения CSS-файла и не выходя за пределы проекта. `packages/registry` лежит выше корня Vite (`apps/docs`), поэтому автоматически он туда не заглянет, и классы из компонентов не попадут в собранный CSS — Button в Task 5 отрисовался бы без стилей. Это конфигурация сканера, к дизайн-токенам отношения не имеющая.

Путь считается от каталога самого CSS-файла: `styles` → `src` → `docs` → `apps` → корень репозитория, то есть четыре уровня вверх.

`apps/docs/src/styles/globals.css` целиком после правки:
```css
@import "tailwindcss";

/* packages/registry лежит вне корня Vite — автоопределение его не видит. */
@source "../../../../packages/registry/src";
```

- [ ] **Step 5: Подключить пакет к витрине**

В `apps/docs/package.json` добавить в `dependencies` (сохраняя алфавитный порядок, перед `@vueuse/core`):
```json
    "@delta-ui/registry": "workspace:*",
```

Блок `dependencies` после правки:
```json
  "dependencies": {
    "@delta-ui/registry": "workspace:*",
    "@vueuse/core": "^15.0.0",
    "vue": "^3.5.42"
  },
```

- [ ] **Step 6: Установить зависимости**

Run:
```powershell
pnpm -C F:\delta-ui install
```
Expected: pnpm сообщает о трёх проектах, создаёт симлинк `apps/docs/node_modules/@delta-ui/registry` → `packages/registry`.

- [ ] **Step 7: Задействовать `cn` в витрине**

Без реального использования алиас не проверен. Заменить `<script setup>` и класс заголовка в `apps/docs/src/App.vue`.

`apps/docs/src/App.vue`:
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <main class="min-h-svh bg-white p-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
    <!-- Два конфликтующих класса: tailwind-merge обязан оставить text-2xl -->
    <h1 :class="cn('text-base font-semibold tracking-tight', 'text-2xl')">delta-ui</h1>
    <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      Витрина разработки. Компоненты живут в packages/registry.
    </p>
  </main>
</template>
```

- [ ] **Step 8: Проверить typecheck**

Run:
```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: 0 ошибок. Если TypeScript не находит `@/lib/utils` — разошлись `paths` в `apps/docs/tsconfig.app.json` и алиас в `vite.config.ts`.

- [ ] **Step 9: Проверить, что `cn` схлопывает конфликт классов**

Run:
```powershell
pnpm -C F:\delta-ui dev
```
Expected: заголовок отрисован крупно (`text-2xl`), а не базовым кеглем. В инспекторе браузера у `h1` класс `font-semibold tracking-tight text-2xl` — `text-base` вытеснен. Если видны оба класса, `tailwind-merge` не отработал. Остановить сервер.

Это первый раз, когда дев-сервер отдаёт файл из-за пределов своего корня (`apps/docs`). Vite определяет корень workspace по `pnpm-workspace.yaml` и разрешает такие пути сам. Если всё же прилетит `403 Restricted`, добавить в `apps/docs/vite.config.ts` рядом с `resolve`:
```ts
  server: {
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
```

- [ ] **Step 10: Commit**

```powershell
git -C F:\delta-ui add -A
git -C F:\delta-ui commit -m "feat(registry): add package scaffold and cn() helper"
```

---

### Task 5: Компонент Button

**Files:**
- Create: `packages/registry/src/ui/button/index.ts`
- Create: `packages/registry/src/ui/button/Button.vue`
- Modify: `apps/docs/src/App.vue` (полностью переписывается — галерея)

**Interfaces:**
- Consumes: `cn` из `@/lib/utils` (Task 4)
- Produces:
  - `buttonVariants` — функция `cva`, варианты `variant: 'default' | 'outline' | 'ghost' | 'link'`, `size: 'sm' | 'default' | 'lg' | 'icon'`
  - `type ButtonVariants = VariantProps<typeof buttonVariants>`
  - компонент `Button` с пропсами `variant`, `size`, `class`, `as` (по умолчанию `'button'`), `asChild`
  - импорт: `import { Button, buttonVariants } from '@/ui/button'`

- [ ] **Step 1: Создать `packages/registry/src/ui/button/index.ts`**

Классы намеренно заданы утилитами палитры Tailwind, а не семантическими переменными: токены в эту итерацию не входят.

`packages/registry/src/ui/button/index.ts`:
```ts
import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300 dark:focus-visible:ring-offset-neutral-950',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90',
        outline:
          'border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
        ghost:
          'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
        link: 'text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

- [ ] **Step 2: Создать `packages/registry/src/ui/button/Button.vue`**

`Primitive` из reka-ui даёт `as` (сменить тег) и `as-child` (отдать рендер слоту, сохранив классы и атрибуты) — ровно как `asChild` в shadcn. Импорт из `'.'` образует цикл `Button.vue ↔ index.ts`; это штатная схема shadcn, ESM и TypeScript её разрешают.

`packages/registry/src/ui/button/Button.vue`:
```vue
<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'

import { cn } from '@/lib/utils'
import { type ButtonVariants, buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
```

- [ ] **Step 3: Переписать `apps/docs/src/App.vue` под галерею**

`apps/docs/src/App.vue`:
```vue
<script setup lang="ts">
import { Button } from '@/ui/button'
</script>

<template>
  <main class="min-h-svh bg-white p-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
    <h1 class="text-2xl font-semibold tracking-tight">delta-ui</h1>
    <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      Витрина разработки. Компоненты живут в packages/registry.
    </p>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Варианты</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Размеры</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Добавить">+</Button>
    </div>

    <h2 class="mt-10 mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Состояния</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
      <Button as="a" href="https://vuejs.org">as=&quot;a&quot;</Button>
      <Button as-child>
        <a href="https://vuejs.org">as-child</a>
      </Button>
      <Button class="rounded-full">class переопределяет радиус</Button>
    </div>
  </main>
</template>
```

- [ ] **Step 4: Проверить typecheck**

Run:
```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: 0 ошибок. Проверяются оба пакета: `@delta-ui/registry` через собственный `vue-tsc --noEmit`, витрина — через `vue-tsc -b`.

- [ ] **Step 5: Проверить галерею в браузере**

Run:
```powershell
pnpm -C F:\delta-ui dev
```

Expected — все пункты должны выполняться:
1. Четыре кнопки в блоке «Варианты» выглядят по-разному: тёмная заливка, рамка без заливки, без рамки и заливки, подчёркивание при наведении.
2. В блоке «Размеры» кнопки растут по высоте слева направо; `size="icon"` — квадратная.
3. `Disabled` полупрозрачна и не реагирует на наведение.
4. `as="a"` и `as-child` отрисованы как `<a>` (проверить в инспекторе), выглядят как обычная кнопка, клик ведёт на vuejs.org.
5. У `as-child` в DOM ровно один элемент `<a>` — не `<button>` с `<a>` внутри.
6. Последняя кнопка полностью скруглена: `class="rounded-full"` вытеснил `rounded-md` из базовых классов — это работа `cn`.
7. Фокус с клавиатуры (Tab) рисует видимое кольцо вокруг кнопки.

Остановить сервер.

- [ ] **Step 6: Commit**

```powershell
git -C F:\delta-ui add -A
git -C F:\delta-ui commit -m "feat(registry): add Button component with cva variants"
```

---

### Task 6: Манифест, сборка registry и `components.json`

**Files:**
- Create: `packages/registry/registry.json`
- Create: `scripts/build-registry.ts`
- Create: `components.json`
- Create: корневой `tsconfig.json` (покрывает `scripts/`)
- Modify: корневой `package.json` (расширяется скрипт `typecheck`)

**Interfaces:**
- Consumes: файлы `packages/registry/src/lib/utils.ts`, `packages/registry/src/ui/button/Button.vue`, `packages/registry/src/ui/button/index.ts`
- Produces: `apps/docs/public/r/utils.json`, `apps/docs/public/r/button.json`, `apps/docs/public/r/registry.json`; CLI `node scripts/build-registry.ts [--manifest <путь>] [--out <путь>]`

- [ ] **Step 1: Создать `packages/registry/registry.json`**

Поля `homepage` здесь нет — его подставляет скрипт из константы `HOMEPAGE`. Пути указаны относительно каталога этого файла.

`packages/registry/registry.json`:
```json
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "delta-ui",
  "items": [
    {
      "name": "utils",
      "type": "registry:lib",
      "title": "Utils",
      "description": "Хелпер cn() для склейки классов Tailwind без конфликтов.",
      "dependencies": ["clsx", "tailwind-merge"],
      "files": [
        {
          "path": "src/lib/utils.ts",
          "type": "registry:lib"
        }
      ]
    },
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "Кнопка с вариантами оформления и размеров, поддерживает as и as-child.",
      "dependencies": ["class-variance-authority", "reka-ui"],
      "registryDependencies": ["utils"],
      "files": [
        {
          "path": "src/ui/button/Button.vue",
          "type": "registry:ui"
        },
        {
          "path": "src/ui/button/index.ts",
          "type": "registry:ui"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Написать `scripts/build-registry.ts`**

Только стираемый синтаксис — Node исполняет файл напрямую, без транспайлера.

`scripts/build-registry.ts`:
```ts
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

// Плейсхолдер. При деплое витрины меняется только эта строка.
const HOMEPAGE = 'https://delta-ui.dev'

const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'
const ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'

const ITEM_TYPES = new Set([
  'registry:block',
  'registry:component',
  'registry:lib',
  'registry:hook',
  'registry:ui',
  'registry:page',
  'registry:file',
])

const TARGET_REQUIRED = new Set(['registry:page', 'registry:file'])

type RegistryFile = {
  path: string
  type: string
  target?: string
}

type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  files: RegistryFile[]
  author?: string
  dependencies?: string[]
  registryDependencies?: string[]
  categories?: string[]
  docs?: string
}

type Registry = {
  name: string
  items: RegistryItem[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const { values } = parseArgs({
  options: {
    manifest: { type: 'string', default: 'packages/registry/registry.json' },
    out: { type: 'string', default: 'apps/docs/public/r' },
  },
})

const manifestPath = resolve(repoRoot, values.manifest as string)
const outDir = resolve(repoRoot, values.out as string)
const manifestDir = dirname(manifestPath)

function abort(messages: string[]): never {
  console.error(`build-registry: ошибок — ${messages.length}`)
  for (const message of messages) {
    console.error(`  • ${message}`)
  }
  process.exit(1)
}

if (!existsSync(manifestPath)) {
  abort([`манифест не найден: ${values.manifest}`])
}

const registry = JSON.parse(await readFile(manifestPath, 'utf8')) as Registry

const errors: string[] = []
const names = new Set<string>()

for (const item of registry.items) {
  if (names.has(item.name)) {
    errors.push(`item "${item.name}": имя повторяется в манифесте`)
  }
  names.add(item.name)

  if (!ITEM_TYPES.has(item.type)) {
    errors.push(`item "${item.name}": недопустимый type "${item.type}"`)
  }

  for (const file of item.files) {
    if (!ITEM_TYPES.has(file.type)) {
      errors.push(`item "${item.name}", файл "${file.path}": недопустимый type "${file.type}"`)
    }
    if (TARGET_REQUIRED.has(file.type) && !file.target) {
      errors.push(
        `item "${item.name}", файл "${file.path}": для type "${file.type}" обязательно поле target`,
      )
    }
    if (!existsSync(resolve(manifestDir, file.path))) {
      errors.push(`item "${item.name}": файл не найден — ${file.path}`)
    }
  }
}

// Отдельным проходом: ссылаться можно и на item, объявленный ниже по списку.
for (const item of registry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.startsWith('http://') || dependency.startsWith('https://')) {
      continue
    }
    if (!names.has(dependency)) {
      errors.push(
        `item "${item.name}": registryDependencies ссылается на "${dependency}", которого нет в манифесте`,
      )
    }
  }
}

if (errors.length > 0) {
  abort(errors)
}

// Каталог очищается целиком, иначе удалённый из манифеста item остался бы
// опубликованным.
await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

for (const item of registry.items) {
  const files: (RegistryFile & { content: string })[] = []
  for (const file of item.files) {
    files.push({
      ...file,
      content: await readFile(resolve(manifestDir, file.path), 'utf8'),
    })
  }

  await writeFile(
    join(outDir, `${item.name}.json`),
    `${JSON.stringify({ $schema: ITEM_SCHEMA, ...item, files }, null, 2)}\n`,
    'utf8',
  )
}

await writeFile(
  join(outDir, 'registry.json'),
  `${JSON.stringify(
    {
      $schema: REGISTRY_SCHEMA,
      name: registry.name,
      homepage: HOMEPAGE,
      items: registry.items,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`build-registry: записано items — ${registry.items.length} → ${values.out}`)
for (const item of registry.items) {
  console.log(`  • ${item.name} (${item.files.length} файл(ов))`)
}
```

- [ ] **Step 3: Создать `components.json`**

Конфиг для shadcn-vue CLI. `cssVariables: false` соответствует решению не заводить токены.

`components.json`:
```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "apps/docs/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/ui",
    "ui": "@/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "composables": "@/composables"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 4: Подключить `scripts/` к typecheck**

Корневой `tsconfig.json` был удалён в Task 2 вместе с уехавшими ссылками. Создаём заново — теперь он покрывает единственный код вне пакетов, каталог `scripts/`. Раньше этого шага его создать было нельзя: TypeScript падает с `TS18003`, если `include` не находит ни одного файла.

Пакеты по-прежнему наследуются от `@vue/tsconfig`, а не от этого файла: им нужны DOM-библиотеки и поддержка `.vue`.

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["scripts/**/*.ts"]
}
```

В корневом `package.json` расширить скрипт `typecheck`:
```json
    "typecheck": "tsc -p tsconfig.json && pnpm -r typecheck",
```

`&&` здесь корректен: npm-скрипты на Windows исполняет `cmd.exe`, где `&&` — штатный оператор. Ограничение из Global Constraints касается только команд, набираемых в PowerShell вручную.

- [ ] **Step 5: Проверить typecheck**

Скрипт теперь покрыт корневым `tsconfig.json`.

Run:
```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: 0 ошибок. Ошибка вида «`enum` is not allowed» означала бы нарушение `erasableSyntaxOnly` — в приведённом коде его нет.

- [ ] **Step 6: Запустить сборку registry**

Run:
```powershell
pnpm -C F:\delta-ui registry:build
```
Expected:
```
build-registry: записано items — 2 → apps/docs/public/r
  • utils (1 файл(ов))
  • button (2 файл(ов))
```

- [ ] **Step 7: Проверить состав выходного каталога**

Run:
```powershell
Get-ChildItem F:\delta-ui\apps\docs\public\r | Select-Object Name, Length
```
Expected: три файла — `button.json`, `registry.json`, `utils.json`.

- [ ] **Step 8: Проверить, что содержимое файлов заинлайнено**

Run:
```powershell
$item = Get-Content F:\delta-ui\apps\docs\public\r\button.json -Raw | ConvertFrom-Json
$item.'$schema'
$item.registryDependencies
$item.files | ForEach-Object { "$($_.path) → $($_.content.Length) символов" }
$item.files[0].content.Contains("`r")
```
Expected:
- `$schema` = `https://shadcn-vue.com/schema/registry-item.json`
- `registryDependencies` = `utils`
- обе строки с ненулевой длиной содержимого (сотни символов)
- последняя строка — `False`: в содержимом нет `CR`, то есть нормализация из Task 1 работает

- [ ] **Step 9: Проверить индекс**

Run:
```powershell
$index = Get-Content F:\delta-ui\apps\docs\public\r\registry.json -Raw | ConvertFrom-Json
$index.name
$index.homepage
$index.items.name
```
Expected: `delta-ui`, `https://delta-ui.dev`, затем `utils` и `button`.

- [ ] **Step 10: Проверить, что битый манифест роняет сборку**

Проверка на копии манифеста — рабочий файл не трогаем.

Run:
```powershell
$scratch = "$env:TEMP\delta-ui-broken"
New-Item -ItemType Directory -Force $scratch | Out-Null
$broken = Get-Content F:\delta-ui\packages\registry\registry.json -Raw | ConvertFrom-Json
$broken.items[1].files[0].path = "src/ui/button/Nope.vue"
$broken.items[1].registryDependencies = @("does-not-exist")
$broken | ConvertTo-Json -Depth 10 | Set-Content "$scratch\registry.json" -Encoding utf8
node F:\delta-ui\scripts\build-registry.ts --manifest "$scratch\registry.json" --out "$scratch\out"
"exit code: $LASTEXITCODE"
```
Expected:
```
build-registry: ошибок — 2
  • item "button": файл не найден — src/ui/button/Nope.vue
  • item "button": registryDependencies ссылается на "does-not-exist", которого нет в манифесте
exit code: 1
```

Каталог `$scratch\out` создаваться не должен — валидация падает до записи.

- [ ] **Step 11: Убрать временные файлы проверки**

Run:
```powershell
Remove-Item -Recurse -Force "$env:TEMP\delta-ui-broken"
```

- [ ] **Step 12: Убедиться, что сгенерированное не попадает в git**

Run:
```powershell
git -C F:\delta-ui status --short
```
Expected: в списке есть `?? components.json`, `?? packages/registry/registry.json` и изменение `scripts/build-registry.ts`, но **нет** ничего из `apps/docs/public/r/`.

- [ ] **Step 13: Commit**

```powershell
git -C F:\delta-ui add -A
git -C F:\delta-ui commit -m "feat: add registry manifest, build script and components.json"
```

---

## Финальная приёмка

Соответствует критерию готовности из спеки. Выполняется целиком, подряд, после Task 6.

- [ ] **Проверка 1: чистая установка**

```powershell
Remove-Item -Recurse -Force F:\delta-ui\node_modules, F:\delta-ui\apps\docs\node_modules, F:\delta-ui\packages\registry\node_modules -ErrorAction SilentlyContinue
pnpm -C F:\delta-ui install
```
Expected: установка завершается без ошибок.

- [ ] **Проверка 2: типы**

```powershell
pnpm -C F:\delta-ui typecheck
```
Expected: 0 ошибок.

- [ ] **Проверка 3: сборка registry**

```powershell
pnpm -C F:\delta-ui registry:build
```
Expected: 2 items, три файла в `apps/docs/public/r/`, содержимое заинлайнено.

- [ ] **Проверка 4: продакшен-сборка витрины**

```powershell
pnpm -C F:\delta-ui build
```
Expected: `vue-tsc -b` проходит, Vite пишет `apps/docs/dist/`. Сгенерированные JSON копируются из `public/` в `dist/r/` — проверить:
```powershell
Get-ChildItem F:\delta-ui\apps\docs\dist\r | Select-Object Name
```
Expected: `button.json`, `registry.json`, `utils.json`.

- [ ] **Проверка 5: витрина**

```powershell
pnpm -C F:\delta-ui dev
```
Expected: все семь пунктов из Task 5, Step 5 выполняются.

- [ ] **Проверка 6: чистое дерево**

```powershell
git -C F:\delta-ui status --short
```
Expected: пустой вывод — `dist/` и `public/r/` отфильтрованы `.gitignore`.
