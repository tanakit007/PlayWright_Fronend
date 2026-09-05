import { test, expect } from '@playwright/test';

test.describe('UC-12: แก้ไขโปรไฟล์', () => {

  // ขั้นตอนเตรียมพร้อม: เข้าสู่ระบบและเปิด Modal "แก้ไขโปรไฟล์"
  test.beforeEach(async ({ page }) => {
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // เปิดเมนูโปรไฟล์ และกดแก้ไขโปรไฟล์
    await page.getByText(/new2026.*สมาชิกธรรมดา/i).first().click();
    await page.getByRole('link', { name: 'โปรไฟล์ของฉัน' }).click();
    await page.getByRole('button', { name: 'แก้ไขโปรไฟล์' }).click();
  });

  // TC 1202: ตรวจสอบการบันทึกแก้ไขโปรไฟล์โดยไม่กรอกชื่อผู้ใช้
  test('TC 1202 - ตรวจสอบการบันทึกแก้ไขโปรไฟล์โดยไม่กรอกชื่อผู้ใช้', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'กรอกชื่อผู้ใช้ใหม่' });
    await input.click();
    await input.clear();
    await page.getByRole('button', { name: 'บันทึก' }).click();

    // ตรวจสอบข้อความเตือนเมื่อเว้นว่าง
    await expect(page.getByText('กรุณากรอกชื่อผู้ใช้')).toBeVisible();
  });

  // TC 1203: ตรวจสอบการแก้ไขชื่อผู้ใช้ที่มีความยาวสั้นกว่า 3 ตัวอักษร
  test('TC 1203 - ตรวจสอบการแก้ไขชื่อผู้ใช้ที่มีความยาวสั้นกว่า 3 ตัวอักษร', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'กรอกชื่อผู้ใช้ใหม่' });
    await input.click();
    await input.fill('AB');
    await page.getByRole('button', { name: 'บันทึก' }).click();

    // ตรวจสอบข้อความเตือนเมื่อสั้นกว่า 3 ตัวอักษร
    await expect(page.getByText('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')).toBeVisible();
  });

  // TC 1201: ตรวจสอบการแก้ไขชื่อผู้ใช้ (Username) ใหม่สำเร็จ
  test('TC 1201 - ตรวจสอบการแก้ไขชื่อผู้ใช้ (Username) ใหม่สำเร็จ', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'กรอกชื่อผู้ใช้ใหม่' });
    await input.click();
    await input.fill('Editor2026');
    await page.getByRole('button', { name: 'บันทึก' }).click();

    // ตรวจสอบข้อความแจ้งเตือนสำเร็จ (ถ้ามีแจ้งเตือน)
    await expect(page.getByText('เปลี่ยนชื่อผู้ใช้เรียบร้อยแล้ว')).toBeVisible();

    // ตรวจสอบว่าชื่อผู้ใช้ใหม่ปรากฏบนหน้าจอ
    await expect(page.getByRole('heading', { name: 'Editor2026' })).toBeVisible();
  });

});