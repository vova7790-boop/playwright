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
  });
  const page = await context.newPage();

  await page.goto('https://web.max.ru/-74167276777563', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Ждём загрузки интерфейса
  await page.waitForFunction(() => document.body.innerText.length > 50, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Поле ввода поста в канале (placeholder="Пост")
  const messageInput = page.locator('[contenteditable][placeholder="Пост"]');
  await messageInput.waitFor({ state: 'visible', timeout: 20000 });
  await messageInput.click();
  await page.keyboard.type('тест автоматизации');

  await page.screenshot({ path: 'test-results/message-typed.png' });

  // Нажимаем кнопку отправки (рядом с полем ввода)
  const sendButton = page.locator('button.button--neutral-primary').last();
  await sendButton.click();

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/message-sent.png' });

  // Проверяем что сообщение появилось
  await expect(page.locator('text=тест автоматизации')).toBeVisible({ timeout: 10000 });

  await context.close();
});
