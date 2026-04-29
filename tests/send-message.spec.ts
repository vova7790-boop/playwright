import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.resolve('session.json');

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

  // Вводим текст в поле поста
  const messageInput = page.locator('[contenteditable][placeholder="Пост"]');
  await messageInput.waitFor({ state: 'visible', timeout: 20000 });
  await messageInput.click();
  await page.keyboard.type('тест автоматизации');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/message-typed.png' });

  // Кнопка отправки — синий круг со стрелкой вверх (svelte-1cuof8n)
  const sendButton = page.locator('button.svelte-1cuof8n');
  await sendButton.waitFor({ state: 'visible', timeout: 5000 });
  await sendButton.click();

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/message-sent.png' });

  // Проверяем что сообщение появилось в чате
  await expect(page.locator('text=тест автоматизации').first()).toBeVisible({ timeout: 10000 });

  await context.close();
});
