import { expect, test } from "@playwright/test";

test.describe("Duc English — Đậu TOEIC UI Parity & E2E Journeys", () => {
  test("verifies Be Vietnam Pro typography, #f8fafc/#2463eb tokens, 65px icon nav, Hero, and 4-col Part cards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. Verify brand wordmark and single-line 7-module nav with Phosphor SVG icons
    await expect(
      page.getByRole("button", { name: "Duc English", exact: true })
    ).toBeVisible();

    const headerAudit = await page.evaluate(() => {
      const header = document.querySelector("header");
      const navButtons = Array.from(
        document.querySelectorAll('nav[aria-label="Phân mục chính"] button')
      );
      const bodyStyles = getComputedStyle(document.body);
      return {
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        navCount: navButtons.length,
        allHaveSvg: navButtons.every((b) => b.querySelectorAll("svg").length > 0),
        allSingleLine: navButtons.every((b) => b.getBoundingClientRect().height <= 44),
        fontFamily: bodyStyles.fontFamily,
        backgroundColor: bodyStyles.backgroundColor,
        horizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
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

    // 2. Verify Hero Banner matching dauenglish.com/listen/nghe-chep
    await expect(
      page.getByRole("heading", {
        name: "Chinh phục TOEIC Listening từ dễ đến khó",
      })
    ).toBeVisible();

    // 3. Verify Test 1..10 render as <h3> headings with 4-column horizontal Part card grid (min-h >= 170px)
    const test1PartGrid = page.getByTestId("test-part-grid-crack-vol1-test1");
    await expect(test1PartGrid).toBeVisible();
    const gridAudit = await test1PartGrid.evaluate((el) => {
      const style = getComputedStyle(el);
      const cards = Array.from(el.children);
      return {
        colsCount: style.gridTemplateColumns.split(" ").length,
        cardCount: cards.length,
        minCardHeight: Math.min(
          ...cards.map((c) => c.getBoundingClientRect().height)
        ),
      };
    });

    expect(gridAudit.colsCount).toBe(4);
    expect(gridAudit.cardCount).toBe(4);
    expect(gridAudit.minCardHeight).toBeGreaterThanOrEqual(170);

    // 4. Open Vaul Mẹo drawer, verify content & close, then filter Crack Vol 1 / Level / Part / Matrix toggle
    await page.getByTestId("tips-trigger").click();
    await expect(page.getByText("1. Nghe nắm ý:")).toBeVisible();
    await page.getByRole("button", { name: "Đóng hướng dẫn" }).click();
    await expect(page.getByText("1. Nghe nắm ý:")).not.toBeVisible();

    await page.getByTestId("collection-crack-vol-1").click();
    await expect(page.getByText("Test 1 · Crack Vol 1")).toBeVisible();

    await page.getByTestId("level-chip-2").click();
    await expect(page.getByTestId("start-crack-vol1-test1-part1")).toBeVisible();

    // Bookmark button on Part 1 card updates count
    await page.getByTestId("bookmark-crack-vol1-test1-part1").click();
    await expect(page.getByTestId("bookmark-crack-vol1-test1-part1")).toContainText("1");
    await page.getByTestId("bookmark-crack-vol1-test1-part1").click();
    await expect(page.getByTestId("bookmark-crack-vol1-test1-part1")).toContainText("0");

    // Toggle to Table Matrix view & back
    await page.getByTestId("view-table-button").click();
    await page.getByTestId("filter-part-2").click();
    await expect(page.getByTestId("start-crack-vol1-test1-part2")).toBeVisible();

    // 5. Responsive check at 390px mobile width: zero horizontal overflow
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(mobileOverflow).toBe(false);
  });

  test("completes dictation check with hint, Lottie celebration, transcript popover save, and reload persistence", async ({
    page,
  }) => {
    await page.goto("/");

    // Enter Test 1 Part 1 Dictation Studio via Part Card CTA
    await page.getByTestId("start-crack-vol1-test1-part1").click();
    const input = page.getByTestId("dictation-input");
    await expect(input).toBeVisible();

    // Test "Gợi ý từ" helper
    await page.getByTestId("hint-next-word-button").click();
    await expect(input).toHaveValue("The ");

    // Type wrong answer -> expect feedback & auto-review
    await input.fill("wrong answer text");
    await page.getByTestId("check-dictation-button").click();
    await expect(page.getByTestId("dictation-feedback")).toBeVisible();

    // Type exact answer -> expect 100% mastered, Lottie celebration badge, and transcript visible
    await input.fill("The man is pointing at a chart on the conference table.");
    await page.getByTestId("check-dictation-button").click();
    await expect(page.getByTestId("dictation-feedback")).toContainText("Chính xác tuyệt đối");
    await expect(page.getByTestId("lottie-celebration")).toBeVisible();
    await expect(page.getByTestId("transcript-box")).toBeVisible();

    // Click a word inside transcript box to open Popover and save to Vocab basket
    await page
      .getByTestId("transcript-box")
      .getByRole("button", { name: "conference" })
      .click();
    await page.getByTestId("popover-save-vocab").click();

    // Exit studio and verify persistence across reload
    await page.getByTestId("exit-studio-button").click();
    await page.reload();
    await expect(page.getByTestId("review-queue-tab")).toContainText("(1)");
  });

  test("navigates across all 6 companion modules and Account dropdown modal", async ({ page }) => {
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
    await expect(page.getByText("Khóa Học Tự Luyện Theo Mục Tiêu Điểm")).toBeVisible();

    // Account dropdown -> open modal
    await page.getByTestId("account-button").click();
    await page.getByTestId("menu-open-account").click();
    await expect(page.getByText("Tài khoản & Thống kê Duc English")).toBeVisible();
  });
});
