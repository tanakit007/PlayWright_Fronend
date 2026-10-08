import { test, expect } from "@playwright/test";

const baseURL = "https://t-check-two.vercel.app";
const username = "realuser";
const password = "123456789";

test.describe("UC-07: ปรับโทนภาษา", () => {
  test.describe.configure({ mode: "serial" });
  let originalText;

  async function openToneEditor(page) {
    await page.goto(`${baseURL}/sign-in`);
    await page
      .getByRole("textbox", { name: "ชื่อผู้ใช้ หรือ อีเมล" })
      .fill(username);
    await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill(password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await expect(page.getByText("เข้าสู่ระบบสำเร็จ")).toBeVisible();
    await page.getByRole("button", { name: "ตกลง", exact: true }).click();

    await page.getByRole("link", { name: "จัดการเอกสาร" }).click();
    await page.getByRole("heading", { name: "ปรับโทน" }).click();
    const editor = page.locator("#page-0").getByRole("textbox");
    await editor.waitFor();
    await expect(editor).not.toBeEmpty();
    originalText = await editor.innerText();
    return editor;
  }

  async function openToneOptions(page) {
    // The tone-options toolbar button currently has no accessible name.
    await page.locator('button:has(svg line[x1="3"][y1="5"])').first().click();
  }

  async function mockToneResponse(page, issues) {
    let requestBody;
    await page.route("**/api/grammar/check", async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ issues }),
      });
    });
    return { getRequestBody: () => requestBody };
  }

  test.afterEach(async ({ page }) => {
    if (!page.url().includes("/docs/editor/")) {
      return;
    }

    const editor = page.locator("#page-0").getByRole("textbox");
    await editor.fill(originalText);
    const saveButton = page.getByRole("button", { name: "บันทึก", exact: true });
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("TC 0701 - ปรับข้อความเป็นโทนทางการสำหรับสมาชิกพิเศษ", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const editor = await openToneEditor(page);
    await editor.fill("หวัดดีครับวันนี้มาคุยเรื่องงานกัน");

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="strict"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByRole("button", { name: /คำแนะนำ\s*[1-9]\d*/ }),
    ).toBeVisible({ timeout: 60_000 });
  });

  test("TC 0702 - แจ้งเตือนเมื่อไม่มีข้อความใน Editor", async ({ page }) => {
    const editor = await openToneEditor(page);
    await editor.fill("");

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="strict"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByText("กรุณาพิมพ์ข้อความก่อนปรับโทนภาษา"),
    ).toBeVisible();
  });

  test("TC 0703 - แจ้งว่าเนื้อหาเหมาะสมกับโทนทางการอยู่แล้ว", async ({
    page,
  }) => {
    const editor = await openToneEditor(page);
    await editor.fill("เรียน ท่านประธานและคณะกรรมการ");

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="strict"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByText("เนื้อหาเหมาะสมกับโทนภาษาที่เลือกแล้ว"),
    ).toBeVisible();
  });

  test("TC 0704 - ปรับข้อความเป็นโทนกันเอง (Casual)", async ({ page }) => {
    const request = await mockToneResponse(page, [
      { span: "หวัดดี", replacement: "สวัสดี" },
    ]);
    const editor = await openToneEditor(page);
    const input = "หวัดดี วันนี้มาคุยเรื่องงานกัน";
    await editor.fill(input);

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="casual"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByRole("button", { name: /คำแนะนำ\s*1/ }),
    ).toBeVisible();
    expect(request.getRequestBody()).toMatchObject({
      text: input,
      mode: "casual",
    });
  });

  test("TC 0705 - ใช้โทนที่เลือกครั้งสุดท้าย", async ({ page }) => {
    const request = await mockToneResponse(page, [
      { span: "ดีจ้า", replacement: "สวัสดี" },
    ]);
    const editor = await openToneEditor(page);
    const input = "ดีจ้า ขอคุยเรื่องนี้กันนะ";
    await editor.fill(input);

    await openToneOptions(page);
    const strictTone = page.locator('input[name="tone"][value="strict"]');
    const casualTone = page.locator('input[name="tone"][value="casual"]');
    await strictTone.check({ force: true });
    await casualTone.check({ force: true });
    await expect(casualTone).toBeChecked();
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByRole("button", { name: /คำแนะนำ\s*1/ }),
    ).toBeVisible();
    expect(request.getRequestBody()).toMatchObject({
      text: input,
      mode: "casual",
    });
  });

  test("TC 0706 - ยอมรับคำแนะนำแล้วแก้ไขข้อความใน Editor", async ({
    page,
  }) => {
    await mockToneResponse(page, [
      { span: "หวัดดีครับ", replacement: "สวัสดีครับ" },
    ]);
    const editor = await openToneEditor(page);
    await editor.fill("หวัดดีครับ วันนี้มาคุยเรื่องงานกัน");

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="strict"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();
    await page.getByRole("button", { name: "แก้ไข", exact: true }).first().click();

    await expect(editor).toContainText("สวัสดีครับ");
    await expect(editor).not.toContainText("หวัดดีครับ");
  });

  test("TC 0707 - แสดงคำแนะนำสำหรับข้อความหลายประโยค", async ({ page }) => {
    const input = "เฮ้ย วันนี้พักก่อน\nพรุ่งนี้คุยต่อ โอเคปะ";
    const request = await mockToneResponse(page, [
      { span: "เฮ้ย", replacement: "สวัสดี" },
      { span: "โอเคปะ", replacement: "สะดวกหรือไม่" },
    ]);
    const editor = await openToneEditor(page);
    await editor.fill(input);

    await openToneOptions(page);
    await page.locator('input[name="tone"][value="casual"]').check({
      force: true,
    });
    await page.getByRole("button", { name: "ปรับโทน", exact: true }).click();

    await expect(
      page.getByRole("button", { name: /คำแนะนำ\s*2/ }),
    ).toBeVisible();
    await expect(editor).toContainText("เฮ้ย");
    await expect(editor).toContainText("โอเคปะ");
    expect(request.getRequestBody().text).toContain("พรุ่งนี้คุยต่อ");
    expect(request.getRequestBody().mode).toBe("casual");
  });
});
