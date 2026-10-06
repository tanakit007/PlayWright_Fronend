import { test, expect } from "@playwright/test";

// แนะนำให้ตั้งชื่อเทสต์เคสให้สื่อถึงสิ่งที่จะทดสอบชัดเจน
test("Verify tone adjustment to Casual in T-Check", async ({ page }) => {
  // 1. เข้าสู่ระบบ (Login)
  await page.goto("https://t-check-two.vercel.app/");
  await page.getByRole("link", { name: "ลงชื่อเข้าใช้" }).click();
  await page
    .getByRole("textbox", { name: "ชื่อผู้ใช้ หรือ อีเมล" })
    .fill("realuser");
  await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill("123456789");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.getByRole("button", { name: "ตกลง" }).click();

  // 2. ไปที่จัดการเอกสาร (Document Management)
  await page.getByRole("link", { name: "จัดการเอกสาร" }).click();
  await page
    .getByRole("heading", { name: "ปรับโทน" })
    .or(page.getByText("ปรับโทน", { exact: false }))
    .first()
    .click();

  // 3. กรอกข้อมูลลงใน Editor
  // [!] แก้ไข Syntax Error: ใช้ Backtick (`) ครอบข้อความยาวๆ ที่มีเครื่องหมาย " อยู่ด้านใน
  const longText = `งานวิจัยฉบับนี้มีวัตถุประสงค์เพื่อศึกษาปัจจัยทางจิตวิทยาที่ส่งผลต่อปรากฏการณ์ "พฤติกรรมการผัดวันประกันพรุ่งในการนอนหลับเพื่อล้างแค้น" (Revenge Bedtime Procrastination - RBP) ซึ่งเป็นภาวะที่บุคคลจงใจชะลอเวลาการนอนหลับของตนเองออกไปเพื่อประกอบกิจกรรมนันทนาการ (เช่น การใช้สื่อสังคมออนไลน์) แม้จะตระหนักถึงผลกระทบเชิงลบต่อสุขภาพ การศึกษานี้ใช้วิธีการวิจัยแบบผสมผสาน (Mixed Methods) โดยเก็บรวบรวมข้อมูลผ่านแบบสอบถามและการสัมภาษณ์เชิงลึกจากกลุ่มตัวอย่างวัยทำงานและวัยรุ่นผลการศึกษาพบว่า พฤติกรรม RBP ไม่ได้มีความสัมพันธ์กับภาวะความผิดปกติของการนอนหลับ (Sleep Disorders) หรือโรคนอนไม่หลับ (Insomnia) แต่เป็นกลไกการชดเชยทางจิตวิทยา (Psychological Compensation) ที่มีนัยสำคัญทางสถิติกับระดับความเครียดและการขาดอิสระในการจัดการเวลาในช่วงกลางวัน กลุ่มตัวอย่างที่มีภาระงานสูงและขาดความสมดุลระหว่างชีวิตและการทำงาน (Work-Life Balance) จะมีแนวโน้มแสดงพฤติกรรม RBP สูงขึ้น เพื่อทวงคืนสิทธิในการควบคุมเวลาส่วนตัวในช่วงเวลากลางคืนข้อค้นพบจากการวิจัยนี้สรุปได้ว่า การสูญเสียอำนาจในการควบคุมตนเองในเวลากลางวันเป็นตัวแปรสำคัญที่กระตุ้นให้เกิดการเบียดบังเวลานอน ผู้วิจัยจึงมีข้อเสนอแนะให้องค์กรและบุคคลให้ความสำคัญกับการบริหารจัดการความเครียด และการจัดสรรเวลาพักผ่อนระยะสั้นระหว่างวันอย่างเหมาะสม เพื่อลดความเสี่ยงของการเกิดพฤติกรรมดังกล่าวและยกระดับสุขภาวะด้านการนอนหลับในระยะยาว`;

  // ลดความซ้ำซ้อนด้วยการชี้ไปที่ textbox และพิมพ์ข้อความได้เลย
  const editor = page.locator("#page-0").getByRole("textbox");
  await editor.fill(longText);

  // 4. เลือกปรับโทนภาษา
  // Note สำหรับธนกฤต: โลเคเตอร์ .nth(5) เปราะบางมาก หาก UI เปลี่ยนเทสต์นี้จะพัง แนะนำให้เพิ่ม data-testid ที่ปุ่มนี้
  await page.getByRole("button").filter({ hasText: /^$/ }).nth(5).click();

  await page.locator("label").filter({ hasText: "กันเอง (Casual" }).click();
  // ลบคำสั่ง await page.getByRole("radio").check() ออก เพราะการคลิกที่ label ด้านบนถือว่าเป็นการเลือก Radio แล้ว

  await page.getByRole("button", { name: "ปรับโทน" }).click();

  // 5. ตรวจสอบผลลัพธ์ (Assertion)
  await expect(
    page.getByText("เนื้อหาเหมาะสมกับโทนภาษาที่เลือกแล้ว"),
  ).toBeVisible();

  // ลบ page.locator("div").nth(3).click(); ออกเนื่องจากไม่มีความจำเป็นในการทดสอบและเป็นส่วนที่เปราะบาง
});
