import { test, expect } from '@playwright/test';

test.describe('UC-13: ออกจากระบบ', () => {

  // Pre-requisite: ผู้ใช้เข้าสู่ระบบแล้วและอยู่ในหน้า Editor
  test.beforeEach(async ({ page }) => {
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

  });

  // TC 1301: ตรวจสอบการออกจากระบบสำเร็จผ่านเมนู Dropdown บน Navbar
  test('TC 1301 - ตรวจสอบการออกจากระบบสำเร็จผ่านเมนู Dropdown บน Navbar', async ({ page }) => {
    // 1. กดโปรไฟล์บน Navbar
    await page.getByRole('button', { name: /สมาชิกธรรมดา/i }).click();

    // 2. กดปุ่ม "ออกจากระบบ" และยืนยันตกลง
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();


    // ตรวจสอบว่ากลับมาหน้าหลัก/หน้า Login (พบปุ่ม ลงชื่อเข้าใช้)
    await expect(page.getByRole('link', { name: 'ลงชื่อเข้าใช้' })).toBeVisible();
    await expect(page.getByText('Next-Gen AI Grammar Engine')).toBeVisible();
  });

  // TC 1302: ตรวจสอบการกดปุ่ม Back ใน Browser เพื่อเข้าถึงหน้าสมาชิกหลังออกจากระบบแล้ว
  test('TC 1302 - ตรวจสอบการกดปุ่ม Back ใน Browser เพื่อเข้าถึงหน้าสมาชิกหลังออกจากระบบแล้ว', async ({ page }) => {
    // 1. ดำเนินการกดออกจากระบบ
    await page.getByRole('button', { name: /สมาชิกธรรมดา/i }).click();
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 2. กดปุ่มย้อนกลับ (Browser Back)
    await page.goBack();

    // 3. ตรวจสอบว่าระบบป้องกันการเข้าถึง ไม่แสดงข้อมูลสมาชิก และบังคับกลับมาหน้า Login / ให้ล็อกอินใหม่
    await expect(page.getByRole('link', { name: 'ลงชื่อเข้าใช้' })).toBeVisible();
    await expect(page.getByRole('button', { name: /สมาชิกธรรมดา/i })).not.toBeVisible();
  });

});