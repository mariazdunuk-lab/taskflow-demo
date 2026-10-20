# TaskFlow

Виконання завдання КП 2–3: Vue 3, Framework7, Vite, PWA та конфігурація Cloudflare Workers.

## Запуск

Встановіть Node.js 24. Відкрийте термінал у каталозі `taskflow-demo`.

```bash
npm ci
npm run dev
```

Для перевірки production-версії:

```bash
npm run build
npm run preview
```

Відкрийте адресу, яку покаже термінал. Не відкривайте `index.html` подвійним натисканням: PWA потрібно запускати через HTTP на localhost або через HTTPS.

## Що реалізовано

- Головна сторінка з чотирма тестовими завданнями з методички.
- Компонент TaskCard зі статусом, пріоритетом, назвою й описом.
- Обчислюваний показник виконання: 1 / 4.
- Сторінка «Про застосунок» і переходи між сторінками.
- Web App Manifest, автоматична реєстрація Service Worker та кешування ресурсів.
- Іконки 192×192 і 512×512 та окрема maskable-іконка.
- Конфігурація публікації статичних файлів у Cloudflare Workers.

Дані демонстраційні та зберігаються у `src/data/tasks.js`. Редагування завдань через інтерфейс і серверна база даних у цьому завданні не передбачені.

## Перевірка PWA

1. Виконайте `npm run build`, потім `npm run preview`.
2. Один раз відкрийте застосунок онлайн.
3. У Chrome або Edge натисніть `Ctrl+Shift+I` та відкрийте Application.
4. У Manifest перевірте назву TaskFlow, `start_url: /`, `display: standalone` та іконки.
5. У Service workers перевірте `sw.js` зі статусом activated/running.
6. Увімкніть Offline і оновіть сторінку. Список завдань має залишитися доступним.
7. Вимкніть Offline. За наявності команди встановлення у браузері встановіть TaskFlow і відкрийте його як окремий застосунок.

Фактична локальна перевірка: збірка успішна, 4 картки, показник 1 / 4, обидва переходи працюють, Service Worker активований, після офлайн-перезавантаження відображаються всі 4 завдання. Chromium не повернув помилок Manifest або критеріїв встановлення. Встановлення в операційну систему користувача не виконувалося.

## GitHub

Спочатку створіть порожній репозиторій `taskflow-demo` у своєму GitHub. У наступних командах замініть `YOUR_GITHUB_LOGIN` на свій логін:

```bash
git init
git branch -M main
git add .
git status
git commit -m "Initial commit: TaskFlow Demo PWA"
git remote add origin https://github.com/YOUR_GITHUB_LOGIN/taskflow-demo.git
git push -u origin main
```

Якщо Git попросить налаштувати ім’я й email, введіть власні дані через `git config user.name` та `git config user.email` у цьому репозиторії. Файл `package-lock.json` потрібно завантажити; `node_modules/`, `dist/`, `.env*`, `.dev.vars*` і `.wrangler/` виключені через `.gitignore`.

## Cloudflare Workers

Відкрийте Workers & Pages, створіть застосунок та імпортуйте GitHub-репозиторій.

| Параметр | Значення |
| --- | --- |
| Project / Worker name | `taskflow-demo` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Preview version command | `npx wrangler versions upload` |
| Static assets | `./dist` |

Назва Worker має збігатися з `name` у `wrangler.jsonc`. Після Deploy відкрийте фактичну адресу `workers.dev` у результатах розгортання. Для завантаження версії без production-публікації використовується `wrangler versions upload`; команда `wrangler preview` з методички не застосовується.

Альтернативна публікація з локального термінала:

```bash
npx wrangler login
npm run deploy
```

Публікація в GitHub та Cloudflare потребує входу до ваших облікових записів. В архіві немає вигаданих адрес репозиторію чи сайту.

## Файли для завершення звіту після публікації

1. Посилання на власний репозиторій і скриншот його файлів на GitHub.
2. Посилання на сайт і скриншот успішного розгортання в Cloudflare.
3. За потреби викладача — скриншот встановленого TaskFlow у Windows.

## Відмінності від методички

- Додано пропущені залежності та npm scripts.
- Назву Worker узгоджено як `taskflow-demo`.
- `.gitignore` містить `.dev.vars*` та `.wrangler/`; `package-lock.json` зберігається.
- Створено `.gitattributes` і maskable-іконку.
- Генерація PNG-іконок автоматично запускається перед збіркою.
- Команду попереднього завантаження версії перевірено для встановленого Wrangler.

Версії залежностей зафіксовано у `package-lock.json`. Каталог `dist/` у готовому архіві містить зібрану версію; у Git його додавати не потрібно.
