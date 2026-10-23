const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = process.env.TF_QA_OUTPUT || path.join(__dirname, 'results');
  fs.mkdirSync(output, { recursive: true });
  const { default: initial } = await import(pathToFileURL(path.join(root, 'src/data/tasks.js')));
  const { taskState, setTaskStatus, setTaskPriority } = await import(pathToFileURL(path.join(root, 'src/store/tasks.js')));
  const { formatDueDate } = await import(pathToFileURL(path.join(root, 'src/utils/tasks.js')));
  assert.equal(initial.length, 10);
  assert.equal(new Set(initial.map(t => t.id)).size, 10);
  assert.equal(initial.slice(0, 6).filter(t => t.status === 'progress').length, 2);
  assert.equal(initial.slice(0, 6).filter(t => t.status === 'done').length, 2);
  setTaskStatus({ id: 1, status: 'progress' });
  setTaskPriority({ id: 1, priority: 'low' });
  assert.equal(taskState.tasks[0].status, 'progress');
  assert.equal(taskState.tasks[0].priority, 'low');
  assert.equal(initial[0].status, 'todo');
  assert.equal(initial[0].priority, 'high');
  const stateBeforeInvalid = JSON.stringify(taskState.tasks);
  setTaskStatus({ id: 1, status: 'invalid' });
  setTaskPriority({ id: 1, priority: 'invalid' });
  setTaskStatus({ id: 9999, status: 'done' });
  setTaskPriority({ id: 9999, priority: 'high' });
  assert.equal(JSON.stringify(taskState.tasks), stateBeforeInvalid);
  assert.equal(formatDueDate(''), 'Без терміну');
  assert.equal(formatDueDate('bad-date'), 'Дата не визначена');
  assert.match(formatDueDate('2026-10-25'), /25 жовтня 2026/);

  const { preview, createServer } = await import(pathToFileURL(path.join(root, 'node_modules/vite/dist/node/index.js')));
  const dev = await createServer({ root, server: { host: '127.0.0.1', port: 5176, strictPort: true } });
  await dev.listen();
  const server = await preview({ root, preview: { host: '127.0.0.1', port: 4176, strictPort: true } });
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--disable-gpu'],
    headless: true,
  });
  try {
    const devPage = await browser.newPage();
    await devPage.goto('http://127.0.0.1:5176');
    await devPage.locator('.page-current .tf3-task-card').nth(2).waitFor();
    assert.deepEqual(await devPage.locator('.page-current .tf3-stat strong').allTextContents(), ['10','3','3','4']);
    await devPage.close();
    const context = await browser.newContext({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 1.5 });
    const page = await context.newPage();
    const errors = [], consoleIssues = [], failedResponses = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (['warning', 'error'].includes(m.type())) consoleIssues.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) failedResponses.push({ url: r.url(), status: r.status() }); });
    const current = () => page.locator('.page-current');
    const cards = () => current().locator('.tf3-task-card');
    const card = id => current().locator(`.tf3-task-card[data-task-id="${id}"]`);
    const ids = async () => cards().evaluateAll(elements => elements.map(e => Number(e.dataset.taskId)));
    const ready = async name => {
      await page.locator(`.page-current[data-name="${name}"]`).waitFor();
      await page.waitForTimeout(300);
    };
    const top = async () => current().locator('.page-content').evaluate(e => e.scrollTo(0, 0));
    const go = async name => {
      if (await current().getAttribute('data-name') !== name) {
        await current().locator(`.app-tabbar a[href="${name === 'home' ? '/' : '/' + name + '/'}"]`).click();
        await ready(name);
      }
      await top();
    };
    const filter = async (group, label) => current().getByRole('group', { name: group, exact: true }).getByRole('button', { name: label, exact: true }).click();
    const snap = async name => { await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: path.join(output, name + '.png') }); };
    await page.goto('http://127.0.0.1:4176');
    await ready('home');
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','3','3','4']);
    assert.equal(await current().getByRole('progressbar').getAttribute('aria-valuenow'), '30');
    assert.deepEqual(await ids(), [1,3,4]);
    await snap('home-desktop');
    await card(1).getByRole('button', {name:'Докладніше', exact:true}).click();
    await page.getByRole('dialog', {name:'Створити макет картки завдання'}).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await card(1).getByRole('button', {name:'Взяти в роботу', exact:true}).click();
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','4','3','3']);
    await current().getByText('Усі завдання', {exact:true}).click();
    await ready('tasks');
    const filterButtons = current().getByRole('group', {name:'Статус',exact:true}).getByRole('button');
    assert.equal(Math.round((await filterButtons.nth(0).boundingBox()).y), Math.round((await filterButtons.nth(1).boundingBox()).y));
    assert.equal(await card(1).locator('.tf3-status--progress').count(), 1);
    await card(1).getByRole('button', {name:'Завершити', exact:true}).click();
    assert.equal(await card(1).locator('.tf3-status--done').count(), 1);
    await card(1).getByRole('button', {name:'Повернути в план', exact:true}).click();
    assert.equal(await card(1).locator('.tf3-status--todo').count(), 1);
    for (const priority of ['low','medium','high']) {
      await card(1).getByRole('button', {name:'Змінити пріоритет', exact:true}).click();
      assert.equal(await card(1).locator(`.tf3-priority--${priority}`).count(), 1);
    }
    const statuses = { all:'Усі', todo:'Заплановано', progress:'У роботі', done:'Виконано' };
    const priorities = { all:'Усі', low:'Низький', medium:'Середній', high:'Високий' };
    const rank = { high:0, medium:1, low:2 };
    const combinations = [];
    for (const [status, label] of Object.entries(statuses)) {
      await filter('Статус', label);
      for (const [priority, title] of Object.entries(priorities)) {
        await filter('Пріоритет', title);
        const expected = initial.filter(t => (status === 'all' || t.status === status) && (priority === 'all' || t.priority === priority))
          .sort((a,b) => rank[a.priority] - rank[b.priority] || a.id - b.id).map(t => t.id);
        assert.deepEqual(await ids(), expected);
        assert.equal(await current().locator('.tf3-counter').textContent(), `Знайдено: ${expected.length}`);
        assert.equal(await current().getByRole('group', {name:'Статус',exact:true}).locator('[aria-pressed="true"]').count(), 1);
        assert.equal(await current().getByRole('group', {name:'Пріоритет',exact:true}).locator('[aria-pressed="true"]').count(), 1);
        combinations.push({status,priority,count:expected.length});
      }
    }
    await filter('Статус','Усі');
    await filter('Пріоритет','Усі');
    await current().getByLabel('Сортування', {exact:true}).selectOption('low-first');
    assert.deepEqual(await ids(), [5,6,7,2,4,8,10,1,3,9]);
    await current().getByLabel('Сортування', {exact:true}).selectOption('high-first');
    assert.deepEqual(await ids(), [1,3,9,2,4,8,10,5,6,7]);
    await top();
    await snap('tasks-desktop');
    await filter('Статус','У роботі');
    await filter('Пріоритет','Високий');
    assert.deepEqual(await ids(), [3]);
    await top();
    await snap('tasks-filtered');
    await card(3).evaluate(e => e.scrollIntoView({block:'center'}));
    await card(3).screenshot({path:path.join(output,'card-before.png')});
    await card(3).getByRole('button', {name:'Завершити',exact:true}).click();
    assert.equal(await cards().count(),0);
    assert.match(await current().locator('.tf3-empty').textContent(), /не знайдено/);
    await top();
    await snap('tasks-empty');
    await go('home');
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','2','4','4']);
    assert.equal(await current().getByRole('progressbar').getAttribute('aria-valuenow'), '40');
    assert.deepEqual(await ids(), [1,4,8]);
    await snap('home-updated');
    await go('tasks');
    await filter('Статус','Усі');
    await filter('Пріоритет','Усі');
    await card(3).getByRole('button', {name:'Змінити пріоритет',exact:true}).click();
    assert.equal(await card(3).locator('.tf3-priority--low').count(),1);
    await card(3).evaluate(e => e.scrollIntoView({block:'center'}));
    await card(3).screenshot({path:path.join(output,'card-after.png')});
    await card(3).getByRole('button', {name:'Докладніше',exact:true}).click();
    const detail = page.getByRole('dialog', {name:'Створити індикатор статусу'});
    await detail.waitFor();
    assert.equal(await detail.locator('.tf3-status--done').count(),1);
    assert.equal(await detail.locator('.tf3-priority--low').count(),1);
    await snap('task-selected');
    await detail.screenshot({path:path.join(output,'task-detail.png')});
    await detail.getByRole('button',{name:'Закрити',exact:true}).click();
    assert.equal(await page.locator('dialog[open]').count(),0);
    await page.reload();
    await ready('home');
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','3','3','4']);
    const responsive = [];
    for (const width of [320,375,768]) {
      await page.setViewportSize({width,height:900});
      for (const name of ['home','tasks','about','help']) {
        if (name === 'help') {
          await current().getByText('Правила використання',{exact:true}).click();
          await ready('help');
        } else await go(name);
        const dimensions = await current().evaluate(p => {
          const content=p.querySelector('.page-content'), toolbar=p.querySelector('.app-tabbar');
          return {overflow:document.documentElement.scrollWidth>innerWidth || content.scrollWidth>content.clientWidth,
            bottom:Math.round(toolbar.getBoundingClientRect().bottom), height:innerHeight,
            direct:toolbar.parentElement===p, active:toolbar.querySelectorAll('.app-link-active').length};
        });
        assert.equal(dimensions.overflow,false,`${name} overflow ${width}`);
        assert.equal(dimensions.bottom,dimensions.height);
        assert.equal(dimensions.direct,true);
        assert.equal(dimensions.active,1);
        responsive.push({width,page:name,...dimensions});
        if (width===375 || (width===768 && name==='home')) await snap(`${name}-${width}`);
      }
      await current().getByText('Повернутися',{exact:true}).click();
      await ready('about');
    }
    await current().getByText('Правила використання',{exact:true}).click();
    await ready('help');
    await current().locator('.navbar a.back').click();
    await ready('about');
    await go('home');
    await current().locator('.navbar a[aria-label="Про застосунок"]').click();
    await ready('about');
    await go('home');
    await page.setViewportSize({width:1100,height:1000});
    await go('tasks');
    for (const t of initial) {
      const button = card(t.id).locator('.tf3-action--primary');
      if (t.status==='todo') await button.click();
      if (t.status!=='done') await button.click();
    }
    await go('home');
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','0','10','0']);
    assert.equal(await current().getByRole('progressbar').getAttribute('aria-valuenow'),'100');
    assert.match(await current().locator('.tf3-empty').textContent(),/всі завдання виконані/);
    const registration = await page.evaluate(async () => {
      const r = await navigator.serviceWorker.ready;
      return {scope:r.scope,state:r.active.state};
    });
    await page.reload();
    await ready('home');
    assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller),true);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.enable');
    const manifest = await cdp.send('Page.getAppManifest');
    const installability = await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(manifest.errors,[]);
    assert.deepEqual(installability.installabilityErrors,[]);
    await context.setOffline(true);
    await page.reload();
    await ready('home');
    assert.deepEqual(await current().locator('.tf3-stat strong').allTextContents(), ['10','3','3','4']);
    await card(1).getByRole('button',{name:'Взяти в роботу',exact:true}).click();
    await go('tasks');
    assert.equal(await card(1).locator('.tf3-status--progress').count(),1);
    await go('about');
    await current().getByText('Правила використання',{exact:true}).click();
    await ready('help');
    await current().getByText('Повернутися',{exact:true}).click();
    await ready('about');
    await go('home');
    assert.equal(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('24px "Framework7 Icons"'); }),true);
    assert.deepEqual(errors,[]);
    assert.deepEqual(consoleIssues,[]);
    assert.deepEqual(failedResponses,[]);
    const result = {checkedAt:new Date().toISOString(),browserVersion:browser.version(),dev:true,build:true,
      initial:{total:10,progress:3,done:3,todo:4,percent:30},baseline:{total:6,progress:2,done:2,todo:2},
      storeValidation:true,initialDataUnchanged:true,dateFallbacks:true,statusCycle:true,priorityCycle:true,
      crossPageSynchronization:true,filterCombinations:combinations,sortBothDirections:true,
      taskSelectionOnBothPages:true,resetOnReload:true,allCompletedEmptyState:true,responsive,
      navigation:true,helpBackLinks:true,registration,offlineReload:true,offlineUpdates:true,
      offlineNavigation:true,manifestErrors:manifest.errors,installabilityErrors:installability.installabilityErrors,
      browserErrors:errors,consoleIssues,failedResponses};
    fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally {
    await browser.close();
    await dev.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
})().catch(e => {console.error(e);process.exit(1);});
