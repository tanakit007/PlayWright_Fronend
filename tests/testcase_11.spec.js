import { test, expect } from '@playwright/test';

test.describe('UC-11: ดูประวัติการแก้ไขคำผิด', () => {

  // TC 1101: ตรวจสอบการแสดงรายการประวัติการแก้ไขของสมาชิกในเซสชันที่มีการแก้คำ
  test('TC 1101 - ตรวจสอบการแสดงรายการประวัติการแก้ไขของสมาชิกในเซสชันที่มีการแก้คำ', async ({ page }) => {
    // 1. เข้าสู่ระบบ
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 2. ไปที่หน้าจัดการเอกสาร และเปิดเอกสารที่มีประวัติ
    await page.getByRole('link', { name: 'จัดการเอกสาร' }).click();
    await page.getByRole('heading', { name: 'มีประวัติการแก้' })
      .or(page.getByText('มีประวัติการแก้', { exact: false }))
      .first()
      .click();

    // 3. เปิดแถบประวัติ
    await page.getByRole('button', { name: 'ประวัติ' }).click();

    // 4. ตรวจสอบคำเดิมและคำที่แก้ไข
    await expect(page.getByText('ปรากฏการ→ปรากฏการณ์').first()).toBeVisible();

    // 5. ตรวจสอบเวลาที่แก้ไข (รูปแบบ HH:mm)
    await expect(page.getByText(/^\d{2}:\d{2}$/).first()).toBeVisible();
  });

  // TC 1102: ตรวจสอบการดูประวัติการแก้ไขในเอกสารที่ยังไม่มีการแก้ไขใดๆ
  test('TC 1102 - ตรวจสอบการดูประวัติการแก้ไขในเอกสารที่ยังไม่มีการแก้ไขใดๆ', async ({ page }) => {
    // 1. เข้าสู่ระบบ
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 2. ไปที่หน้าจัดการเอกสาร แล้วเลือกเปิดเอกสารที่ยังไม่มีการแก้ไข
    await page.getByRole('link', { name: 'จัดการเอกสาร' }).click();
    
    const createDocBtn = page.getByRole('button', { name: /สร้างเอกสาร|เอกสารใหม่/ });
    if (await createDocBtn.isVisible()) {
      await createDocBtn.click();
    } else {
      await page.locator('.document-card, tr').last().click();
    }

    // 3. เปิดแถบประวัติ
    await page.getByRole('button', { name: 'ประวัติ' }).click();

    // 4. ตรวจสอบข้อความว่างเปล่า
    await expect(page.getByText('ไม่มีประวัติการแก้ไขในเซสชันนี้')).toBeVisible();
  });

});