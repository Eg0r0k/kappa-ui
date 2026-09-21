# delta-ui: подготовка окружения под registry в стиле shadcn

**Дата:** 2026-09-21
**Статус:** утверждено, готово к планированию реализации

## Цель

Подготовить окружение для собственной UI-библиотеки `delta-ui`, распространяемой
по модели shadcn: компоненты не ставятся как npm-пакет, а копируются в проект
потребителя командой `npx shadcn-vue add <url>` из опубликованных JSON-файлов.

Объём этой итерации — **только окружение**: раскладка монорепозитория, сборка
registry, витрина для разработки и один эталонный компонент, прогоняющий весь
конвейер. Дизайн-токены сознательно отложены.

## Что уже есть

`F:\delta-ui` — стартер Vite + Vue 3 + TypeScript, ничего не сконфигурировано:

- Зависимости под shadcn-стек установлены: `reka-ui` 2.10, `class-variance-authority`,
  `clsx`, `tailwind-merge`, `tailwindcss` 4.3, `@tailwindcss/vite`, `@vueuse/core`.
- `vite.config.ts` содержит только `vue()` — ни Tailwind-плагина, ни алиасов.
- `src/style.css` — демо-стили стартера, подлежат удалению.
- `src/components/` содержит только `HelloWorld.vue` — подлежит удалению.
- Git-репозиторий отсутствует.

Инструменты: Node 24.11.1, pnpm 10.33.0, git 2.52.0.

## Архитектура

### Раскладка

```
F:\delta-ui\
├─ pnpm-workspace.yaml
├─ package.json                  корневые скрипты, общие devDependencies
├─ tsconfig.json                 база, пакеты наследуются через extends
├─ components.json               конфиг shadcn-vue CLI (алиасы)
├─ .gitignore
├─ .gitattributes                нормализация переводов строк
├─ docs/superpowers/specs/       спеки
├─ packages/
│  └─ registry/                  источник правды
│     ├─ package.json            @delta-ui/registry, private: true
│     ├─ tsconfig.json
│     ├─ registry.json           манифест: перечень items
│     └─ src/
│        ├─ lib/utils.ts         cn()
│        └─ ui/button/
│           ├─ Button.vue
│           └─ index.ts          re-export + buttonVariants
├─ apps/
│  └─ docs/                      витрина разработки и хостинг JSON-ов
│     ├─ package.json
│     ├─ vite.config.ts          @tailwindcss/vite + алиасы
│     ├─ tsconfig.json
│     ├─ index.html
│     ├─ public/                 статика; public/r/ генерируется
│     └─ src/
│        ├─ main.ts
│        ├─ App.vue              галерея вариантов Button
│        └─ styles/globals.css   @import "tailwindcss";
└─ scripts/
   └─ build-registry.ts          registry.json → apps/docs/public/r/*.json
```

`registry.json` лежит внутри `packages/registry/`, а не в корне репозитория:
манифест хранится рядом с компонентами, которые он описывает, поэтому пакет
самодостаточен и переносим.

### Единицы и их границы

**`packages/registry`** — единственный источник правды для компонентов. Не знает
ни о витрине, ни о формате публикации, ни о скрипте сборки. Экспортирует
компоненты и `cn()`. Заменяемо: любой потребитель (витрина, сборщик, будущий
пакет) обращается только к файлам и к `registry.json`.

**`scripts/build-registry.ts`** — чистое преобразование манифеста в набор
публикуемых JSON. Вход: `packages/registry/registry.json` и файлы на диске.
Выход: каталог `apps/docs/public/r/`. Не импортирует Vue-компоненты, работает с
ними как с текстом, поэтому не зависит от их содержимого.

**`apps/docs`** — витрина. Потребитель `packages/registry`, зависимость
односторонняя. Отвечает за Vite-конфиг, Tailwind и статический хостинг
сгенерированных JSON.

### Поток данных

```
packages/registry/registry.json
        │  (перечень items, относительные пути к .vue/.ts)
        ▼
scripts/build-registry.ts
        │  читает файлы, инлайнит содержимое в files[].content,
        │  валидирует, подставляет $schema и homepage
        ▼
apps/docs/public/r/button.json        item, пригодный для CLI
apps/docs/public/r/registry.json      индекс всех items
        │
        ▼
npx shadcn-vue add https://<домен>/r/button.json
```

Витрина импортирует компоненты **напрямую** из `@delta-ui/registry` через
workspace-линк, а не из сгенерированного JSON. Правка `.vue` видна в HMR сразу;
пересборка registry нужна только перед публикацией.

### Формат registry

Придерживаемся схемы shadcn-vue, чтобы работал штатный CLI потребителя.

`registry.json`:

```json
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "delta-ui",
  "homepage": "https://delta-ui.dev",
  "items": [
    {
      "name": "utils",
      "type": "registry:lib",
      "title": "Utils",
      "description": "Хелпер cn() для склейки классов Tailwind.",
      "dependencies": ["clsx", "tailwind-merge"],
      "files": [{ "path": "src/lib/utils.ts", "type": "registry:lib" }]
    },
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "Кнопка с вариантами оформления и размеров.",
      "dependencies": ["reka-ui", "class-variance-authority"],
      "registryDependencies": ["utils"],
      "files": [
        { "path": "src/ui/button/Button.vue", "type": "registry:ui" },
        { "path": "src/ui/button/index.ts", "type": "registry:ui" }
      ]
    }
  ]
}
```

Допустимые значения `type`: `registry:block`, `registry:component`,
`registry:lib`, `registry:hook`, `registry:ui`, `registry:page`, `registry:file`.
Для `registry:page` и `registry:file` обязательно поле `target`.

На выходе каждый item получает `$schema: https://shadcn-vue.com/schema/registry-item.json`
и поле `content` в каждом элементе `files`.

Пути в `files[].path` указываются **относительно каталога манифеста**
(`packages/registry/`), а не корня репозитория. Скрипт сборки разрешает их
относительно `registry.json` и переносит в публикуемый JSON как есть.

`path` — **не просто имя файла**. CLI потребителя сопоставляет сегменты каталогов
из `path` со своими алиасами и с общим корнем файлов элемента, и всё, что
осталось после совпадения, становится путём на диске. Отсюда требование к
авторам: путь обязан сохранять форму `src/<группа>/<имя>/<файл>` —
`src/ui/button/Button.vue`, а не `Button.vue`. Плоский путь схлопнет файлы в
корень каталога `ui`, и `index.ts` одного компонента молча перезапишет `index.ts`
другого.

`registryDependencies` в манифесте пишутся **голыми именами** (`"utils"`), но
скрипт сборки разворачивает их в абсолютные URL при записи. Это обязательно:
по соглашению shadcn голое имя в опубликованном JSON означает элемент верхнего
registry самого shadcn-vue, а не соседний элемент нашего. Оставленное голым имя
привело бы к тому, что потребитель получил бы чужой `utils.ts`, а наш не скачал
бы никогда.

Namespace плоский: уровня «стилей» вроде `new-york` у shadcn-vue не заводим —
вариант оформления один.

### Отсутствие токенов

В `globals.css` не объявляем ни `@theme`, ни CSS-переменных
`--background` / `--foreground` / `--radius`. Помимо `@import "tailwindcss"`
файл содержит только директиву `@source` на `packages/registry/src`:
автоопределение исходников в Tailwind 4 не выходит за корень Vite, а registry
лежит выше него, поэтому без явного указания классы компонентов не попадут в
сборку и они отрисуются без стилей. Это конфигурация сканера классов, к токенам
отношения не имеющая.
`Button` стилизуется утилитами из палитры Tailwind напрямую
(`bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900`).

Это осознанный временный выбор. Когда дойдём до токенов, меняются два места:
классы в `Button.vue` — на семантические, и в item появляется секция `cssVars`,
чтобы CLI дописывал переменные в проект потребителя. Структура и сборка не
затрагиваются.

### Переводы строк

`.gitattributes` с правилом `* text=auto eol=lf` и `*.png binary`; `*.svg`
остаётся текстом. Репозиторий разрабатывается на
Windows, но содержимое компонентов попадает в `files[].content` публикуемых JSON
дословно. Без нормализации в опубликованный registry утекут `CRLF`, и файлы,
которые CLI запишет в проект потребителя, будут отличаться от исходных на каждой
строке — это ломает и диффы, и любые проверки хешей.

## Состав работ

1. `git init`, `.gitignore` (включая `apps/docs/public/r/`), `.gitattributes`,
   первый коммит.
2. `pnpm-workspace.yaml`, корневой `package.json` со скриптами `dev`, `build`,
   `typecheck`, `registry:build`.
3. Перенос текущего приложения в `apps/docs`: `index.html`, `src/`, `public/`,
   `vite.config.ts`, tsconfig-файлы. Удаление `src/style.css` и
   `src/components/HelloWorld.vue`.
4. Подключение `@tailwindcss/vite` и алиасов в Vite и tsconfig: `@` →
   `packages/registry/src`, `~` → `apps/docs/src`.

   Алиас `@` указывает на registry, а не на исходники витрины. Это обязательное
   условие переносимости: внутри компонента путь `@/lib/utils` должен
   резолвиться одинаково и у нас, и в проекте потребителя после копирования —
   там `@` по соглашению shadcn указывает на корень исходников проекта.
   Собственные файлы витрины (их два) импортируются через `~` или относительно.
5. `packages/registry`: `package.json`, `src/lib/utils.ts` с `cn()`.
6. `Button.vue` на `cva` + `reka-ui/Primitive` с поддержкой `as` / `as-child`,
   `index.ts` с re-export компонента и `buttonVariants`.
7. `registry.json` с items `utils` и `button`.
8. `scripts/build-registry.ts`. Запускается как `node scripts/build-registry.ts`
   без транспайлера: Node 24 исполняет TypeScript штатно, стирая типы. Из этого
   следует ограничение — в скрипте допустим только стираемый синтаксис (никаких
   `enum`, `namespace` и параметров-свойств конструктора).
9. `components.json` с алиасами.
10. `App.vue` — галерея вариантов Button.

### Эталонный компонент

`Button` входит в объём, хотя строго это уже не «окружение»: без него конвейер
`cva → cn → reka-ui → JSON` нечем проверить, а проверяемость — главная ценность
этой итерации. Любой второй компонент был бы избыточен.

## Обработка ошибок

Единственный компонент с нетривиальным поведением при ошибках — скрипт сборки.
Он завершается ненулевым кодом с сообщением, указывающим имя item и проблемное
поле, если:

- файл из `files[].path` не существует на диске;
- `type` вне списка допустимых значений;
- имя item не уникально в пределах манифеста;
- у item типа `registry:page` или `registry:file` отсутствует `target`;
- `registryDependencies` ссылается на имя, которого нет ни в манифесте, ни в виде
  абсолютного URL.

Каталог `apps/docs/public/r/` очищается перед записью, чтобы удалённый item не
оставался опубликованным.

## Тестирование

Автотестов эта итерация не вводит: тестировать нечего, кроме скрипта сборки, а
его поведение полностью покрывается ручной проверкой ниже. Vitest добавим, когда
появятся компоненты с логикой.

Критерий готовности — все пункты выполняются подряд на чистом клоне:

1. `pnpm install` завершается без ошибок.
2. `pnpm typecheck` — 0 ошибок (`vue-tsc` по обоим пакетам).
3. `pnpm registry:build` создаёт `apps/docs/public/r/button.json`,
   `utils.json` и `registry.json`; в `files[].content` лежит исходный текст.
4. `pnpm dev` открывает витрину, на которой Button отрисован во всех вариантах и
   размерах, `as-child` работает (кнопка-ссылка).
5. Временная правка `registry.json` на несуществующий путь роняет
   `pnpm registry:build` с сообщением, называющим item и путь; правка
   откатывается.

## За рамками итерации

ESLint и Prettier, Vitest, CI, страницы документации и MDX, переключатель тёмной
темы, собственная CLI-обёртка, публикация в npm, деплой витрины, дизайн-токены,
любые компоненты кроме Button.

## Открытые вопросы

Нет. Домен `https://delta-ui.dev` — заведомый плейсхолдер, вынесенный в
константу `scripts/build-registry.ts`; замена на реальный домен при деплое
правит одну строку.
