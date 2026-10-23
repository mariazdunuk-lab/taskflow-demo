# TaskFlow — ПЗ 2.5

Продовження ПЗ 2.4. Реалізовано компоненти Vue 3, Props, Emits, спільний реактивний стан, зміну статусів і пріоритетів, фільтрацію та всі шість додаткових завдань.

## 1. Запуск на комп’ютері

1. Розпакуйте весь архів. Відкрийте папку `taskflow-kp25` у VS Code: **File → Open Folder**.
2. Відкрийте **Terminal → New Terminal**. Поточна папка повинна містити `package.json` і `package-lock.json`.
3. Перевірте Node.js та npm:

```powershell
node -v
npm -v
```

Проєкт вимагає Node.js 22.16.0 або новіший. Якщо Node.js ще не встановлено, використайте інсталятор з [офіційного сайту Node.js](https://nodejs.org/).

4. Встановіть зафіксовані залежності:

```powershell
npm ci
```

5. Запустіть розробку:

```powershell
npm run dev
```

6. Відкрийте адресу **Local**, яку покаже термінал, зазвичай `http://localhost:5173`. Залишайте термінал запущеним. Для зупинки натисніть **Ctrl+C**.

Якщо PowerShell блокує `npm.ps1`, виконайте ті самі команди як `npm.cmd ci` та `npm.cmd run dev`. Повідомлення `npm warn` саме по собі не означає, що встановлення завершилося помилкою; перевіряйте наявність `npm error` та код завершення.

Не запускайте застосунок подвійним кліком по `index.html`. `npm ci` потребує доступу до npm registry. Зберігайте `package-lock.json`: він фіксує версії залежностей.

## 2. Перевірка завдання

1. На головній початково: **10 усього, 3 у роботі, 3 виконано, 4 заплановано, 30%**. Методичка містить 6 базових записів; додаткове завдання № 1 додає ще 4.
2. Натискайте кнопку статусу: **Взяти в роботу → Завершити → Повернути в план**. Статуси циклічно змінюються: `todo → progress → done → todo`.
3. Кнопка **Змінити пріоритет** перемикає `low → medium → high → low`.
4. На сторінці **Мої завдання** виберіть статус **У роботі** й пріоритет **Високий**. Залишиться один запис — **Створити індикатор статусу**.
5. Натисніть **Завершити**. Список стане порожнім. Поверніться на головну: тепер **10 усього, 2 у роботі, 4 виконано, 4 заплановано, 40%**.
6. Поверніться до списку, у двох фільтрах виберіть **Усі**. Перевірте сортування від високого пріоритету та від низького.
7. Кнопка **Докладніше** відкриває вибране завдання. Закрийте його кнопкою **Закрити** або клавішею **Escape**.
8. Після повного перезавантаження браузера відновляться початкові дані. LocalStorage і серверне збереження в ПЗ 2.5 не використовуються.

## 3. Збірка та PWA

Зупиніть сервер розробки і виконайте:

```powershell
npm run build
npm run preview
```

Відкрийте адресу з термінала, зазвичай `http://localhost:4173`. Папка `dist` містить готову збірку, manifest, Service Worker та іконки.

Для перевірки офлайн у Chrome або Edge:

1. Відкрийте зібрану версію з доступом до мережі.
2. У DevTools → **Application → Service Workers** перевірте, що Service Worker активний, після цього перезавантажте сторінку.
3. У DevTools → **Network** увімкніть **Offline** та ще раз перезавантажте сторінку.
4. Перевірте сторінки, кнопки зміни статусу та пріоритету. Наприкінці поверніть **No throttling**.

У production для PWA потрібен HTTPS; localhost дозволений для локальної перевірки. Service Worker кешує файли застосунку. Він не зберігає зміни завдань після перезавантаження.

## 4. Оновлення попереднього репозиторію GitHub

Цей варіант використовуйте, якщо ПЗ 2.4 уже є у вашому локальному Git-репозиторії.

1. Збережіть свої поточні зміни окремим комітом. Відкрийте термінал у корені попереднього репозиторію та перевірте:

```powershell
git status
git remote -v
```

2. Створіть нову гілку:

```powershell
git switch -c pz2.5
```

3. Скопіюйте **вміст папки `src`** із цього архіву в `src` попереднього проєкту із заміною однойменних файлів. Також скопіюйте новий `README.md` і папку `verification`. Залежності, `App.vue`, маршрути та конфігурація PWA сумісні з ПЗ 2.4. Не переносіть `node_modules` і не замінюйте власні налаштування розгортання.
4. Виконайте `npm ci`, `npm run dev`, перевірте сценарії розділу 2, а після зупинки — `npm run build`.
5. Збережіть і надішліть зміни:

```powershell
git add src README.md verification
git diff --cached --stat
git commit -m "Complete PZ 2.5 Vue components and task state"
git push -u origin pz2.5
```

6. На GitHub виберіть гілку `pz2.5`. Для здачі можна скопіювати посилання на цю гілку. Якщо потрібне об’єднання з основною гілкою, відкрийте pull request через **Compare & pull request**.

## 5. Новий репозиторій GitHub

Цей варіант використовуйте, якщо потрібен окремий репозиторій для ПЗ 2.5.

1. На [GitHub](https://github.com/new) створіть порожній репозиторій, наприклад `taskflow-pz25`. Не додавайте README, `.gitignore` чи ліцензію під час створення: локальний проєкт уже має власні файли.
2. У терміналі всередині розпакованої папки виконайте:

```powershell
git init
git add .
git diff --cached --stat
git commit -m "Complete PZ 2.5 TaskFlow"
git branch -M main
```

3. Скопіюйте HTTPS-адресу створеного репозиторію. У команді нижче замініть `YOUR_USERNAME` та назву репозиторію своїми значеннями:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/taskflow-pz25.git
git push -u origin main
```

4. За потреби увійдіть у GitHub у вікні авторизації Git. Оновіть сторінку репозиторію і перевірте наявність `src`, `package.json`, `package-lock.json` та README.

`.gitignore` виключає `node_modules`, `dist`, локальні налаштування і секрети. Завантаження коду в репозиторій не публікує вебсайт автоматично. Для звіту вкажіть власні посилання лише після фактичного завантаження.

## 6. Структура

```text
taskflow-kp25/
  src/
    main.js
    App.vue
    routes.js
    components/
      AppTabbar.vue
      TaskCard.vue
      StatusBadge.vue
      PriorityBadge.vue
      TaskCounter.vue
      TaskDetails.vue
    pages/
      HomePage.vue
      TasksPage.vue
      AboutPage.vue
      HelpPage.vue
    data/tasks.js
    store/tasks.js
    utils/tasks.js
    css/app.css
    css/task-components.css
  public/icons/
  scripts/generate-icons.mjs
  verification/
  index.html
  package.json
  package-lock.json
  vite.config.js
  wrangler.jsonc
  README.md
  dist/
```

`dist` включено в ZIP як готову збірку. Для редагування використовуйте вихідний код у `src`.

## 7. Виконані додаткові завдання

| № | Результат |
|---|---|
| 1 | Чотири власні завдання, ID 7–10, з різними статусами та пріоритетами |
| 2 | Четвертий показник статистики «Заплановано» |
| 3 | `TaskCounter.vue` отримує `count` через Props |
| 4 | Відсоток виконаних завдань і смуга прогресу |
| 5 | `task-select` передає `{ id }`; батьківська сторінка відкриває `TaskDetails` |
| 6 | Сортування за пріоритетом у двох напрямках |

Батьківські сторінки отримують події карток та викликають функції `setTaskStatus` і `setTaskPriority`. Компонент `TaskCard` не змінює Props. Стан спільний для обох сторінок у межах одного завантаження.

## 8. Автоматична перевірка

У `verification/results` містяться результати та скриншоти перевірки. `verification/browser-check.cjs` перевіряє цикли статусів і пріоритетів, усі 16 поєднань фільтрів, сортування, вибір завдання, синхронізацію сторінок, адаптивність, PWA та офлайн-режим.

Для повторного запуску потрібен Playwright з Chromium. Ці пакети потрібні лише для тесту; сам застосунок запускається командами з розділу 1.

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run build
node verification/browser-check.cjs
```

Порти 5176 і 4176 мають бути вільними. Результат буде записано в `verification/results/checks.json`.

## Довідкові матеріали

- [Vue — Props](https://vuejs.org/guide/components/props.html)
- [Vue — Component Events](https://vuejs.org/guide/components/events.html)
- [Vue — State Management](https://vuejs.org/guide/scaling-up/state-management.html)
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
- [GitHub — Adding locally hosted code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
