import { test, expect } from '@playwright/test';

const baseURL = 'https://t-check-two.vercel.app';
const username = 'new2026';
const password = 'Pass1234!';

async function openSettings(page) {
  test.skip(
    !username || !password,
    'Set TEST_USERNAME and TEST_PASSWORD to a dedicated test account.'
  );

  await page.goto(`${baseURL}/sign-in`);
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill(username);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

  const signInError = page.getByRole('heading', { name: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  await expect(signInError).not.toBeVisible();
  await expect(page.getByText('เข้าสู่ระบบสำเร็จ')).toBeVisible();
  await page.getByRole('button', { name: 'ตกลง', exact: true }).click();

  await page.getByRole('button', { name: new RegExp(username, 'i') }).click();
  await page.getByRole('link', { name: /ตั้งค่า|settings/i }).click();
}

test.describe('UC-16: การตั้งค่าและจัดการบัญชี', () => {
  test('TC 1601 - เปลี่ยนการแสดงผลเป็นโหมดมืด', async ({ page }) => {
    await openSettings(page);

    await page.getByRole('button', { name: 'สว่าง', exact: true }).click();
    await page.getByRole('button', { name: 'มืด', exact: true }).click();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('TC 1602 - แจ้งเตือนเมื่อรหัสผ่านปัจจุบันไม่ถูกต้อง', async ({ page }) => {
    await openSettings(page);

    await page.locator('input[name="current"]').fill('Wrong123');
    await page.locator('input[name="new"]').fill('NewPass5678!');
    await page.locator('input[name="confirm"]').fill('NewPass5678!');
    await page.getByRole('button', { name: 'อัปเดตรหัสผ่าน', exact: true }).click();

    await expect(page.getByText(/รหัสผ่านปัจจุบันไม่ถูกต้อง|Old password is incorrect/i)).toBeVisible();
    await expect(page.getByText(/password updated successfully|เปลี่ยนรหัสผ่านสำเร็จ/i)).not.toBeVisible();
  });

  test('TC 1604 - ปฏิเสธเมื่อรหัสผ่านใหม่และคำยืนยันไม่ตรงกัน', async ({ page }) => {
    await openSettings(page);

    await page.locator('input[name="current"]').fill('Wrong123');
    await page.locator('input[name="new"]').fill('NewPass5678!');
    await page.locator('input[name="confirm"]').fill('Different5678!');
    await page.getByRole('button', { name: 'อัปเดตรหัสผ่าน', exact: true }).click();

    await expect(page.getByText('รหัสผ่านไม่ตรงกัน')).toBeVisible();
    await expect(page.getByText(/password updated successfully|เปลี่ยนรหัสผ่านสำเร็จ/i)).not.toBeVisible();
  });

  test('TC 1605 - บันทึกการแสดงผลโหมดมืดหลังโหลดหน้าใหม่', async ({ page }) => {
    await openSettings(page);

    const lightMode = page.getByRole('button', { name: 'สว่าง', exact: true });
    const darkMode = page.getByRole('button', { name: 'มืด', exact: true });

    try {
      await lightMode.click();
      await darkMode.click();
      await expect(page.locator('html')).toHaveClass(/dark/);

      await page.reload();

      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'มืด', exact: true })).toBeVisible();
    } finally {
      if (await page.getByRole('button', { name: 'สว่าง', exact: true }).isVisible().catch(() => false)) {
        await page.getByRole('button', { name: 'สว่าง', exact: true }).click();
      }
    }
  });

  test('TC 1603 - ป้องกันการลบบัญชีเมื่อคำยืนยันไม่ถูกต้อง', async ({ page }) => {
    await openSettings(page);

    await page.getByRole('button', { name: 'ลบบัญชีผู้ใช้', exact: true }).click();

    const confirmationInputs = page.locator('input[type="text"]:visible, input:not([type]):visible');
    if (await confirmationInputs.count() === 0) {
      await expect(page.getByText(/กรุณาติดต่อผู้ดูแลระบบ.*ลบบัญชีผู้ใช้/)).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(username, 'i') })).toBeVisible();
      return;
    }

    await confirmationInputs.last().fill('ข้อความยืนยันผิด');
    const confirmationButton = page.getByRole('button', { name: /ยืนยันการลบ|ลบบัญชีถาวร/i }).last();
    await expect(confirmationButton).toBeDisabled();
  });
});