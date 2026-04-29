import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(__dirname, '../session.json');

test('отправить сообщение в канал тест', async ({ browser }) => {
  if (!fs.existsSync(SESSION_PATH)) {
    throw new Error(`Файл сессии не найден: ${SESSION_PATH}\nСначала запустите: npx ts-node tests/save-session.ts`);
  }

  const context = await browser.newContext({
    storageState: SESSION_PATH,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  await page.goto('https://web.max.ru/-74167276777563', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Ждём полной загрузки интерфейса
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

  // Поле ввода сообщения
  const messageInput = page.locator('[contenteditable="true"]').last();
  await messageInput.waitFor({ state: 'visible', timeout: 30000 });
  await messageInput.click();
  await page.keyboard.type('тест автоматизации');

  await page.screenshot({ path: 'test-results/message-typed.png' });

  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'test-results/message-sent.png' });

  await context.close();
});
