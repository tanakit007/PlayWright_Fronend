import { test, expect } from '@playwright/test';

test.describe('UC-15: ดูแดชบอร์ดผู้ดูแลระบบ', () => {

  // TC 1501: ตรวจสอบผู้ดูแลระบบเข้าดูข้อมูลสรุปและสถิติภาพรวมทั้งระบบสำเร็จ
  test('TC 1501 - ตรวจสอบผู้ดูแลระบบเข้าดูข้อมูลสรุปและสถิติภาพรวมทั้งระบบสำเร็จ', async ({ page }) => {
    // 1. เข้าสู่ระบบด้วยบัญชีแอดมิน
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('admin');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('admin1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 2. เปิดหน้าแดชบอร์ดผู้ดูแล (Admin Panel)
    await page.getByRole('button', { name: 'Admin Panel' }).click();

    // 3. ตรวจสอบการ์ดสรุปข้อมูลผู้ใช้งานและสถานะระบบ
    await expect(page.getByText('ผู้ใช้งานทั้งหมด')).toBeVisible();
    await expect(page.getByText('ผู้ใช้งานระดับ Pro')).toBeVisible();
    await expect(page.getByText('ผู้ใช้ธรรมดา')).toBeVisible();
    await expect(page.getByText('ผู้ใช้งานที่ถูกระงับ')).toBeVisible();
    await expect(page.getByText('การเรียกใช้ AI (วันนี้)')).toBeVisible();
    
    // แก้ไขจุดนี้: ใส่ .first() หรือใช้ role paragraph
    await expect(page.getByText('โทเค็นที่ใช้ไปวันนี้').first()).toBeVisible();
    
    await expect(page.getByText('อัตราข้อผิดพลาด (Error Rate)')).toBeVisible();
    await expect(page.getByText('เวลาตอบสนองเฉลี่ย')).toBeVisible();
    // 4. ตรวจสอบกราฟสรุป 7 วัน
    await expect(page.getByText(/ปริมาณการใช้โทเค็น.*7/i).first()).toBeVisible();
    await expect(page.getByText(/จำนวนการตรวจสอบคำผิด.*7 วันย้อนหลัง/i)).toBeVisible();
  });

  // TC 1502: ตรวจสอบสมาชิกทั่วไปพยายามเข้าถึงหน้าแดชบอร์ดผู้ดูแลระบบ
  test('TC 1502 - ตรวจสอบสมาชิกทั่วไปพยายามเข้าถึงหน้าแดชบอร์ดผู้ดูแลระบบ', async ({ page }) => {
    // 1. เข้าสู่ระบบด้วยบัญชีสมาชิกธรรมดา
    await page.goto('https://t-check-two.vercel.app/');
    await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // 2. พยายามเข้าถึง URL แดชบอร์ดแอดมินโดยตรง
    await page.goto('https://t-check-two.vercel.app/admin');

    // 3. ระบบปฏิเสธสิทธิ์และนำกลับไปยังหน้าหลัก หรือไม่แสดงปุ่ม Admin Panel
    await expect(page).toHaveURL(/^https:\/\/t-check-two\.vercel\.app\/?$/);
    await expect(page.getByRole('button', { name: 'Admin Panel' })).not.toBeVisible();
  });

  // TC 1503: ตรวจสอบการเปิดหน้าแดชบอร์ดแอดมินกรณีดึงข้อมูลจาก Database ไม่สำเร็จ
//   test('TC 1503 - ตรวจสอบการเปิดหน้าแดชบอร์ดแอดมินกรณีดึงข้อมูลจาก Database ไม่สำเร็จ', async ({ page }) => {
//     // 1. เข้าสู่ระบบด้วยบัญชีแอดมิน
//     await page.goto('https://t-check-two.vercel.app/');
//     await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
//     await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('admin');
//     await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('admin123');
//     await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
//     await page.getByRole('button', { name: 'ตกลง' }).click();

//     // 2. ดัก Mock Network ให้ API ดึงข้อมูลสถิติตอบกลับ Error Status 500
//     await page.route('**/api/admin/**', async route => {
//       await route.fulfill({
//         status: 500,
//         contentType: 'application/json',
//         body: JSON.stringify({ message: 'Internal Server Error' }),
//       });
//     });

//     // 3. เปิดหน้าแดชบอร์ดผู้ดูแล
//     await page.getByRole('button', { name: 'Admin Panel' }).click();

//     // 4. ตรวจสอบการแสดงข้อความเตือนเมื่อโหลดข้อมูลไม่สำเร็จ
//     await expect(page.getByText(/ไม่สามารถโหลดข้อมูลได้.*กรุณาลองใหม่/i)).toBeVisible();
//   });

});