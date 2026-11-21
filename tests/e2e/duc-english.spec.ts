import { expect, test } from "@playwright/test";

test.describe("Duc English — A1–C2 Hub & Đậu English Practice Studio E2E", () => {
  test("verifies Be Vietnam Pro typography, 65px icon nav, A1-C2 hub without Crack Vol / Thêm MP3, and 4-col grid", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Duc English", exact: true })
    ).toBeVisible();

    const headerAudit = await page.evaluate(() => {
      const header = document.querySelector("header");
      const navButtons = Array.from(
        document.querySelectorAll('nav[aria-label="Phân mục chính"] button')
      );
      const bodyStyles = getComputedStyle(document.body);
      const visibleText = document.body.innerText || "";
      return {
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        navCount: navButtons.length,
        allHaveSvg: navButtons.every((b) => b.querySelectorAll("svg").length > 0),
        allSingleLine: navButtons.every((b) => b.getBoundingClientRect().height <= 44),
        fontFamily: bodyStyles.fontFamily,
        backgroundColor: bodyStyles.backgroundColor,
        horizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
        hasCrackVol: /crack vol/i.test(visibleText),
        hasAddMp3: /thêm mp3/i.test(visibleText),
      };
    });

    expect(headerAudit.headerHeight).toBeGreaterThanOrEqual(64);
    expect(headerAudit.headerHeight).toBeLessThanOrEqual(68);
    expect(headerAudit.navCount).toBe(11);
    expect(headerAudit.allHaveSvg).toBe(true);
    expect(headerAudit.allSingleLine).toBe(true);
    expect(headerAudit.fontFamily).toContain("Be Vietnam Pro");
    expect(headerAudit.backgroundColor).toBe("rgb(248, 250, 252)");
    expect(headerAudit.horizontalOverflow).toBe(false);
    expect(headerAudit.hasCrackVol).toBe(false);
    expect(headerAudit.hasAddMp3).toBe(false);

    // Hero Banner & direct A1-C2 Thematic Curriculum
    await expect(
      page.getByRole("heading", {
        name: "Chinh phục TOEIC Listening từ dễ đến khó",
      })
    ).toBeVisible();
    await expect(page.getByTestId("thematic-card-grid")).toBeVisible();

    // Open Vaul Mẹo drawer & close
    await page.getByTestId("tips-trigger").click();
    await expect(page.getByText("1. Nghe nắm ý:")).toBeVisible();
    await page.getByRole("button", { name: "Đóng hướng dẫn" }).click();
    await expect(page.getByText("1. Nghe nắm ý:")).not.toBeVisible();

    // Filter A1 and verify 4-column card grid
    await page.getByTestId("cefr-filter-A1").click();
    await expect(
      page.getByTestId("thematic-card-theme-a1-office-arrival")
    ).toBeVisible();

    // Responsive check at 390px mobile width
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(mobileOverflow).toBe(false);
  });

  test("launches directly into Nghe check mode: fills blanks, unlocks Từ vựng nên học, opens Word Detail Drawer & 3D flip card", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Click A1 Morning Office Arrival card -> opens straight into Nghe check
    await page.getByTestId("cefr-filter-A1").click();
    await page.getByTestId("thematic-card-theme-a1-office-arrival").click();

    await expect(page.getByTestId("dau-waveform-player")).toBeVisible();
    await expect(page.getByTestId("check-sentence-box")).toBeVisible();
    await expect(page.getByTestId("vocab-locked-state")).toBeVisible();
    await expect(page.getByTestId("studio-timer-xp")).toBeVisible();

    // Test density toggle 30% -> 50%
    await page.getByTestId("density-30").click();
    await page.getByTestId("density-50").click();

    // Reveal all blanks via LẬT TỪ "Tất cả" -> unlocks Từ vựng nên học + Translation + +5 XP
    await page.getByTestId("reveal-all").click();
    await expect(page.getByTestId("translation-box")).toBeVisible();
    await expect(page.getByTestId("vocab-unlocked-state")).toBeVisible();
    await expect(page.getByTestId("studio-timer-xp")).toContainText("+5 XP");

    // Click "Chi tiết" to open right-side Word Detail Drawer with US/UK + 3D flip card
    await page.getByTestId("vocab-details-button").click();
    await expect(page.getByTestId("word-detail-drawer")).toBeVisible();
    await expect(page.getByTestId("pronounce-us-button")).toBeVisible();
    await expect(page.getByTestId("pronounce-uk-button")).toBeVisible();

    // Flip flashcard & add card to basket
    await page.getByTestId("drawer-flip-card").click();
    await page.getByTestId("drawer-add-vocab-button").click();
    await page.keyboard.press("Escape");

    // Open Giỏ từ basket to verify saved vocab entry
    await page.getByTestId("vocab-basket-button").click();
    await expect(page.getByTestId("vocab-basket-drawer")).toBeVisible();
    await page.keyboard.press("Escape");

    // Switch to Nghe chép tab & test full dictation check + Lottie celebration
    await page.getByTestId("studio-mode-dictation").click();
    const input = page.getByTestId("dictation-input");
    await expect(input).toBeVisible();
    await input.fill("A man is opening the front door of the office.");
    await page.getByTestId("check-dictation-button").click();
    await expect(page.getByTestId("dictation-feedback")).toContainText(
      "Chính xác tuyệt đối"
    );
    await expect(page.getByTestId("lottie-celebration")).toBeVisible();

    // Exit studio and reload persistence
    await page.getByTestId("exit-studio-button").click();
    await expect(page.getByTestId("thematic-card-grid")).toBeVisible();
  });

  test("navigates across all companion modules and Account dropdown modal", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("nav-read").click();
    await expect(page.getByText("Ngữ Pháp Trọng Tâm")).toBeVisible();

    await page.getByTestId("nav-speak").click();
    await expect(page.getByText("Shadowing Theo Giọng Chuẩn")).toBeVisible();

    await page.getByTestId("nav-write").click();
    await expect(page.getByText("Thực Hành Viết Câu")).toBeVisible();

    await page.getByTestId("nav-vocab").click();
    await expect(page.getByTestId("vocab-flashcard")).toBeVisible();

    await page.getByTestId("nav-test").click();
    await expect(page.getByText("Phiếu trả lời (Answer Sheet)")).toBeVisible();

    await page.getByTestId("nav-course").click();
    await expect(
      page.getByText("Khóa Học Tự Luyện Theo Mục Tiêu Điểm")
    ).toBeVisible();

    await page.getByTestId("account-button").click();
    await page.getByTestId("menu-open-account").click();
    await expect(
      page.getByText("Tài khoản & Thống kê Duc English")
    ).toBeVisible();
  });
});
