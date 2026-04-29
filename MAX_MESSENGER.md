# Автоматизация Max Messenger (web.max.ru)

## Авторизация

Сессия хранится в `session.json` (localStorage, без cookies).

Ключевые поля в localStorage:
- `__oneme_auth` — JWT-токен авторизации
- `__oneme_device_id` — идентификатор устройства

Для обновления сессии запустить локально (нужен дисплей):
```bash
npx ts-node tests/save-session.ts
```
Отсканировать QR в приложении Max, нажать Enter — файл `session.json` сохранится.

## Отправка сообщения в канал

```typescript
const context = await browser.newContext({
  storageState: 'session.json',
  ignoreHTTPSErrors: true,   // обязательно, у web.max.ru проблемы с сертификатом
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();

await page.goto('https://web.max.ru/<chat_id>', { waitUntil: 'domcontentloaded' });

// Ждём загрузки SPA (занимает ~3–8 сек)
await page.waitForFunction(() => document.body.innerText.length > 50, { timeout: 30000 });
await page.waitForTimeout(3000);

// 1. Поле ввода поста — contenteditable с placeholder="Пост"
const messageInput = page.locator('[contenteditable][placeholder="Пост"]');
await messageInput.waitFor({ state: 'visible', timeout: 20000 });
await messageInput.click();
await page.keyboard.type('текст сообщения');

// 2. Кнопка отправки — синий круг со стрелкой вверх, правый нижний угол
const sendButton = page.locator('button.svelte-1cuof8n');
await sendButton.waitFor({ state: 'visible', timeout: 5000 });
await sendButton.click();
```

### Селекторы (актуальны на апрель 2026)

| Элемент | Селектор |
|---|---|
| Поле ввода поста | `[contenteditable][placeholder="Пост"]` |
| Кнопка отправки | `button.svelte-1cuof8n` |

> Svelte-классы могут измениться после обновления сайта. Если кнопка не найдена — перепроверить через `page.evaluate` все `button` на странице после набора текста.

## ID каналов

| Название | URL |
|---|---|
| тест | `https://web.max.ru/-74167276777563` |
