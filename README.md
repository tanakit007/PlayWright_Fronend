# Playwright Test Automation

โปรเจกต์นี้เป็นชุดทดสอบ End-to-End (E2E) สำหรับเว็บ `https://t-check-two.vercel.app/` โดยใช้ [Playwright Test](https://playwright.dev/docs/test-intro) และ JavaScript เพื่อตรวจสอบการทำงานของระบบในมุมมองผู้ใช้จริง

## สิ่งที่ต้องติดตั้ง

- Node.js แนะนำเวอร์ชัน LTS
- npm ซึ่งติดตั้งมาพร้อม Node.js
- อินเทอร์เน็ต เนื่องจาก test เรียกใช้งานเว็บปลายทางจริง

ตรวจสอบเวอร์ชันที่ติดตั้งแล้ว:

```bash
node --version
npm --version
```

## วิธีติดตั้ง

เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วติดตั้ง dependencies:

```bash
npm install
```

ติดตั้ง browser ของ Playwright สำหรับโปรเจกต์นี้:

```bash
npx playwright install chromium
```

## วิธีรัน Test

รัน test ทั้งหมด:

```bash
npx playwright test
```

รัน test เฉพาะไฟล์:

```bash
npx playwright test tests/testcase_15.spec.js --headed --project=chromium --workers=1
```

รันเฉพาะ test ที่มีชื่อหรือรหัสตรงกับข้อความที่กำหนด:

```bash
npx playwright test -g "TC 1501"
```

รันโดยเปิดหน้าต่าง browser เพื่อดูการทำงาน:

```bash
npx playwright test --headed
```

รันด้วยโหมด debug ของ Playwright:

```bash
npx playwright test --debug
```

ดูรายการ test ที่ Playwright ตรวจพบโดยไม่รันจริง:

```bash
npx playwright test --list
```

## ดูผลการทดสอบ

โปรเจกต์ตั้งค่า reporter เป็น HTML หลังรัน test แล้วเปิด report ด้วยคำสั่ง:

```bash
npx playwright show-report
```

ไฟล์หลักที่เกี่ยวข้องกับผลลัพธ์:

- `playwright-report/` เก็บ HTML report
- `test-results/` เก็บ screenshot, video และไฟล์ประกอบของแต่ละ test

## โครงสร้างโปรเจกต์

```text
.
├── package.json              # dependencies ของโปรเจกต์
├── package-lock.json         # เวอร์ชัน dependencies ที่ติดตั้งจริง
├── playwright.config.js     # configuration กลางของ Playwright
├── tests/
│   ├── testcase_11.spec.js   # ทดสอบประวัติการแก้ไขคำผิด
│   ├── testcase_12.spec.js   # ทดสอบการแก้ไขโปรไฟล์
│   ├── testcase_13.spec.js   # ทดสอบการออกจากระบบ
│   ├── testcase_14.spec.js   # ทดสอบแดชบอร์ดสมาชิก
│   └── testcase_15.spec.js   # ทดสอบแดชบอร์ดผู้ดูแลระบบ
├── playwright-report/        # ผลลัพธ์ HTML ที่สร้างหลังรัน
└── test-results/             # artifacts จากการทดสอบ
```

## การตั้งค่า Playwright แบบย่อ

การตั้งค่าใน `playwright.config.js` มีรายละเอียดสำคัญดังนี้:

- `testDir: './tests'` ให้ค้นหา test ในโฟลเดอร์ `tests`
- `fullyParallel: true` อนุญาตให้ test ทำงานแบบขนาน
- `reporter: 'html'` สร้างรายงานรูปแบบ HTML
- `screenshot: 'on'` บันทึก screenshot ทุก test
- `video: 'on'` บันทึก video ทุก test
- `slowMo: 500` หน่วง action ละ 500 มิลลิวินาทีเพื่อให้ติดตามการทำงานได้ง่าย
- `trace: 'on-first-retry'` เก็บ trace เมื่อมีการ retry ครั้งแรก
- `projects` ใช้ browser `chromium` และขนาดหน้าจอแบบ Desktop Chrome

## ข้อควรระวัง

- Test ชุดนี้ใช้งานเว็บปลายทางจริง จึงต้องเข้าถึงอินเทอร์เน็ตและระบบต้องพร้อมใช้งาน
- บัญชีทดสอบและรหัสผ่านถูกระบุไว้ภายในไฟล์ test ปัจจุบัน ควรใช้เฉพาะข้อมูลสำหรับทดสอบ และไม่ควร commit ข้อมูลลับจริง
- Test บางรายการอาจเปลี่ยนข้อมูลบนระบบ เช่น แก้ไขโปรไฟล์หรือสร้างเอกสาร ควรตรวจสอบข้อมูลทดสอบก่อนรันซ้ำ
- หาก selector หรือข้อความบนเว็บเปลี่ยน test อาจล้มเหลว ต้องปรับ locator ในไฟล์ `.spec.js` ให้ตรงกับหน้าเว็บปัจจุบัน

หาก PowerShell แสดงข้อผิดพลาดเกี่ยวกับ execution policy เมื่อใช้ `npx` ให้ใช้รูปแบบนี้แทน:

```powershell
npm.cmd exec -- playwright test
```

## การเพิ่ม Test ใหม่

1. สร้างไฟล์ใหม่ในโฟลเดอร์ `tests` โดยใช้ชื่อรูปแบบ `testcase_xx.spec.js`
2. import `test` และ `expect` จาก `@playwright/test`
3. จัดกลุ่ม test ด้วย `test.describe()` และตั้งชื่อ test ให้สื่อความหมาย
4. ใช้ locator ที่อ้างอิง role หรือ label เช่น `getByRole()` และ `getByText()`
5. รัน `npx playwright test --list` เพื่อตรวจสอบว่า Playwright พบ test ใหม่
6. รัน test และตรวจสอบ HTML report
