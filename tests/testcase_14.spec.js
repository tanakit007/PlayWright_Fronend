    import { test, expect } from '@playwright/test';

    test.describe('UC-14: ดูแดชบอร์ดสมาชิก', () => {

    // TC 1401: ตรวจสอบการเปิดดูข้อมูลแดชบอร์ดสมาชิกแสดงผลสถิติถูกต้องครบถ้วน
    test('TC 1401 - ตรวจสอบการเปิดดูข้อมูลแดชบอร์ดสมาชิกแสดงผลสถิติถูกต้องครบถ้วน', async ({ page }) => {
        await page.goto('https://t-check-two.vercel.app/');
        await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
        await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await page.getByRole('button', { name: 'ตกลง' }).click();

        // เปิดหน้าแดชบอร์ด
        await page.getByRole('button', { name: /สมาชิกธรรมดา/i }).click();
        await page.getByRole('link', { name: 'แดชบอร์ด' }).first().click();

        // 1. ตรวจสอบข้อความต้อนรับ
        await expect(page.getByText(/ยินดีต้อนรับกลับ/i)).toBeVisible();

        // 2. ตรวจสอบการ์ดสรุป 4 รายการ
        await expect(page.getByText(/โควต้าโทเค็น/i).first()).toBeVisible();
        await expect(page.getByText(/ประเภทบัญชี/i).first()).toBeVisible();
        await expect(page.getByText(/ตรวจสอบทั้งหมด/i).first()).toBeVisible();
        await expect(page.getByText(/แก้ไขคำผิด/i).first()).toBeVisible();

        // 3. ตรวจสอบกราฟสรุปการใช้งาน
        await expect(page.locator('svg, [role="application"]').first()).toBeVisible();
        await expect(page.getByText(/อาทิตย์.*จันทร์.*อังคาร/s)).toBeVisible();
    });

    // TC 1402: ตรวจสอบการแสดงเตือนแถบสีแดงเมื่อโควต้าโทเค็นถูกใช้ไปมากกว่า 90%
    test('TC 1402 - ตรวจสอบการแสดงเตือนแถบสีแดงเมื่อโควต้าโทเค็นถูกใช้ไปมากกว่า 90%', async ({ page }) => {
        // เข้าสู่ระบบ
        await page.goto('https://t-check-two.vercel.app/');
        await page.getByRole('link', { name: 'ลงชื่อเข้าใช้' }).click();
        await page.getByRole('textbox', { name: 'ชื่อผู้ใช้ หรือ อีเมล' }).fill('new2026');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Pass1234!');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await page.getByRole('button', { name: 'ตกลง' }).click();

        // ไปที่หน้าแดชบอร์ด
        await page.getByRole('button', { name: /สมาชิกธรรมดา/i }).click();
        await page.getByRole('link', { name: 'แดชบอร์ด' }).first().click();

        // ตรวจสอบข้อความแจ้งเตือนโควต้าใกล้หมด (ใช้ข้อความจริงจากหน้าเว็บ)
        const alertBanner = page.getByText(/โควต้าใกล้จะหมดแล้ว!/i).first();
        await expect(alertBanner).toBeVisible();

        // ตรวจสอบปุ่มดูแผนสมาชิกที่อยู่คู่กับการแจ้งเตือน
        await expect(page.getByRole('link', { name: 'ดูแผนสมาชิก' }).first()).toBeVisible();
    });

    // TC 1403: ตรวจสอบผู้เยี่ยมชม (Guest) พยายามเข้าถึงหน้าแดชบอร์ดโดยตรงทาง URL
    test('TC 1403 - ตรวจสอบผู้เยี่ยมชม (Guest) พยายามเข้าถึงหน้าแดชบอร์ดโดยตรงทาง URL', async ({ page }) => {
        // พิมพ์ URL /dashboard โดยตรงในขณะที่ยังไม่ได้ Login
        await page.goto('https://t-check-two.vercel.app/dashboard');

        // ตรวจสอบว่าระบบดีดกลับไปหน้า sign-in / login
        await expect(page).toHaveURL(/.*(sign-?in|login)/i);

        // ตรวจสอบปุ่มเข้าสู่ระบบ
        await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    });

    });