import { test, expect } from '@playwright/test';

const baseURL = 'https://t-check-two.vercel.app';

async function openInThai(page) {
  await page.goto(baseURL);
  const languageButton = page.getByRole('button', { name: 'toggle-language' });
  if ((await languageButton.innerText()) !== 'TH') {
    await languageButton.click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(languageButton).toHaveText('TH');
  }
}

test.describe('UC-20: เปลี่ยนภาษาแสดงผล', () => {
  test('TC 2001 - เปลี่ยนภาษาแสดงผลเป็นภาษาอังกฤษสำเร็จ', async ({ page }) => {
    await openInThai(page);

    await page.getByRole('button', { name: 'toggle-language' }).click();

    await expect(page.getByRole('dialog', { name: 'Language changed successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('button', { name: 'toggle-language' })).toHaveText('EN');
    await expect(page.getByRole('heading', { name: 'Write with Confidence' })).toBeVisible();
  });

  test('TC 2002 - คงภาษาที่เลือกไว้หลังโหลดหน้าใหม่', async ({ page }) => {
    await openInThai(page);

    const languageButton = page.getByRole('button', { name: 'toggle-language' });
    await languageButton.click();
    await expect(page.getByRole('dialog', { name: 'Language changed successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(languageButton).toHaveText('EN');

    await page.reload();

    await expect(page.getByRole('button', { name: 'toggle-language' })).toHaveText('EN');
    await expect(page.getByRole('heading', { name: 'Write with Confidence' })).toBeVisible();
  });

  test('TC 2003 - แสดงผลเสถียรเมื่อกดเปลี่ยนภาษารัว 10 ครั้ง', async ({ page }) => {
    await openInThai(page);

    await page.evaluate(() => {
      for (let click = 0; click < 10; click += 1) {
        document.querySelector('[aria-label="toggle-language"]')?.click();
      }
    });

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();

    const language = await page.getByRole('button', { name: 'toggle-language' }).innerText();
    expect(['TH', 'EN']).toContain(language);
    await expect(
      page.getByRole('heading', {
        name: language === 'TH' ? 'เขียนได้อย่าง มั่นใจ' : 'Write with Confidence',
      })
    ).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('TC 2004 - สลับภาษาอังกฤษกลับเป็นภาษาไทยได้', async ({ page }) => {
    await openInThai(page);

    const languageButton = page.getByRole('button', { name: 'toggle-language' });
    await languageButton.click();
    await expect(page.getByRole('dialog', { name: 'Language changed successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(languageButton).toHaveText('EN');
    await expect(page.getByRole('heading', { name: 'Write with Confidence' })).toBeVisible();

    await languageButton.click();
    await expect(page.getByRole('dialog', { name: 'เปลี่ยนภาษาสำเร็จ' })).toBeVisible();
    await page.getByRole('button', { name: 'ตกลง' }).click();
    await expect(languageButton).toHaveText('TH');
    await expect(page.getByRole('heading', { name: 'เขียนได้อย่าง มั่นใจ' })).toBeVisible();
  });

  test('TC 2005 - แสดงฟอร์มเข้าสู่ระบบเป็นภาษาอังกฤษเมื่อเลือก EN', async ({ page }) => {
    await openInThai(page);

    const languageButton = page.getByRole('button', { name: 'toggle-language' });
    await languageButton.click();
    await expect(page.getByRole('dialog', { name: 'Language changed successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.goto(`${baseURL}/sign-in`);

    await expect(languageButton).toHaveText('EN');
    await expect(page.getByRole('heading', { name: 'Welcome back, Member' })).toBeVisible();
    await expect(page.getByLabel('Username or Email')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  });
});