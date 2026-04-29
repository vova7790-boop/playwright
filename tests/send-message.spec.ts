import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.resolve('session.json');

const MESSAGE = `🫀 Давление скачет? Вот что реально работает — без таблеток
Современные кардиологи говорят прямо: при умеренном давлении (до 150/90) начинать надо не с таблеток, а с образа жизни. И это не просто слова — есть конкретные цифры и методы, которые дают измеримый результат.
Например, убрать из рациона лишнюю соль — и верхнее давление падает на 2–8 мм рт. ст. Добавить 5 г клетчатки в день (пара ложек отрубей или горсть чечевицы) — ещё минус 3 мм. Всего пару изменений в еде — и эффект уже виден.
А если давление поднялось прямо сейчас: опусти ноги в горячую воду на 10–15 минут и подышите медленно — вдох на 5 счётов, выдох на 5. Уже через 3–5 минут такого дыхания сосуды расслабятся и станет легче. Главное — при 170/100 и выше это не замена врачу, а первая помощь до него.
Используешь какой-нибудь домашний способ контролировать давление?
👍 — да, есть свой метод
❤️ — нет, только таблетки`;

test('отправить сообщение в канал тест', async ({ browser }) => {
  if (!fs.existsSync(SESSION_PATH)) {
    throw new Error(`Файл сессии не найден: ${SESSION_PATH}`);
  }

  const context = await browser.newContext({
    storageState: SESSION_PATH,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  await page.goto('https://web.max.ru/-74167276777563', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForFunction(() => document.body.innerText.length > 50, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const messageInput = page.locator('[contenteditable][placeholder="Пост"]');
  await messageInput.waitFor({ state: 'visible', timeout: 20000 });
  await messageInput.click();

  // Вставляем через буфер обмена чтобы корректно передать эмодзи и переносы строк
  await page.evaluate((text) => {
    const el = document.querySelector('[contenteditable][placeholder="Пост"]') as HTMLElement;
    el.focus();
    document.execCommand('insertText', false, text);
  }, MESSAGE);

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/message-typed.png' });

  const sendButton = page.locator('button.svelte-1cuof8n');
  await sendButton.waitFor({ state: 'visible', timeout: 5000 });
  await sendButton.click();

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/message-sent.png' });

  await expect(page.locator('text=Давление скачет').first()).toBeVisible({ timeout: 10000 });

  await context.close();
});
