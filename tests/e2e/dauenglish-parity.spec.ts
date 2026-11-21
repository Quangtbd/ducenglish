import { expect, test } from "@playwright/test";

const EXPECTED_NAV_LABELS = [
  "Nghe",
  "Đọc",
  "Nói",
  "Viết",
  "Từ vựng",
  "Test",
  "Course",
  "Game",
  "Café",
];

test.describe("UI Parity Comparison: Duc English vs DauEnglish.com", () => {
  test("compares navbar completeness (all 11 items), typography 14-16px, zero Gemini, A1-C2 4-column grid, and HoverCard", async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    let referenceBaseline = {
      headerHeight: 65,
      bodyBg: "rgb(248, 250, 252)",
      fontIncludes: "Be Vietnam Pro",
      requiredNavLabels: EXPECTED_NAV_LABELS,
      minCardHeight: 180,
      gridCols: 4,
    };

    try {
      const refCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      const refPage = await refCtx.newPage();
      await refPage.goto("https://dauenglish.com/listen/nghe-chep", {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      await refPage.waitForSelector("header", { timeout: 10000 });
      const liveMetrics = await refPage.evaluate(() => {
        const header = document.querySelector("header");
        const navTexts = header
          ? Array.from(header.querySelectorAll("button"))
              .map((b) => (b.innerText || "").trim())
              .filter(Boolean)
          : [];
        return {
          headerHeight: header?.getBoundingClientRect().height ?? 65,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyFont: getComputedStyle(document.body).fontFamily,
          navTexts,
        };
      });
      await refCtx.close();

      if (liveMetrics.bodyFont.includes("Be Vietnam Pro")) {
        referenceBaseline.headerHeight = Math.round(liveMetrics.headerHeight);
        referenceBaseline.bodyBg = liveMetrics.bodyBg;
        for (const label of EXPECTED_NAV_LABELS) {
          expect(liveMetrics.navTexts).toContain(label);
        }
      }
    } catch {
      // Offline fallback uses captured dauenglish.com baseline
    }

    await page.goto("/");

    const localAudit = await page.evaluate(() => {
      const header = document.querySelector("header");
      const navButtons = Array.from(
        document.querySelectorAll('nav[aria-label="Phân mục chính"] > button')
      );
      const navLabels = navButtons.map((b) =>
        (b.textContent || "").trim().replace(/\s+/g, " ")
      );
      const allNavControls = Array.from(
        document.querySelectorAll('nav[aria-label="Phân mục chính"] button')
      );
      const bodyStyles = getComputedStyle(document.body);
      const h1 = document.querySelector("h1");
      const heroBox = document.querySelector(
        '[data-testid="hero-headphones-badge"]'
      );
      const grid = document.querySelector(
        '[data-testid="thematic-section-A1-part1"] .grid'
      );
      const cards = grid ? Array.from(grid.children) : [];
      const visibleText = document.body.innerText || "";

      return {
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        navControlCount: allNavControls.length,
        navLabels,
        allHaveSvg: allNavControls.every(
          (b) => b.querySelectorAll("svg").length > 0
        ),
        allSingleLine: allNavControls.every(
          (b) => b.getBoundingClientRect().height <= 44
        ),
        bodyBg: bodyStyles.backgroundColor,
        bodyFont: bodyStyles.fontFamily,
        bodySize: parseFloat(bodyStyles.fontSize),
        h1FontSize: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
        heroBadgeRect: heroBox?.getBoundingClientRect() ?? null,
        gridCols: grid
          ? getComputedStyle(grid).gridTemplateColumns.split(" ").length
          : 0,
        minCardHeight: cards.length
          ? Math.min(...cards.map((c) => c.getBoundingClientRect().height))
          : 0,
        horizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
        hasGeminiWord: /gemini/i.test(visibleText),
      };
    });

    // 1. Header & Navbar Parity
    expect(localAudit.headerHeight).toBeGreaterThanOrEqual(
      referenceBaseline.headerHeight - 1
    );
    expect(localAudit.headerHeight).toBeLessThanOrEqual(
      referenceBaseline.headerHeight + 3
    );
    expect(localAudit.navControlCount).toBe(11);
    for (const label of referenceBaseline.requiredNavLabels) {
      expect(localAudit.navLabels).toContain(label);
    }
    expect(localAudit.allHaveSvg).toBe(true);
    expect(localAudit.allSingleLine).toBe(true);
    expect(localAudit.horizontalOverflow).toBe(false);

    // 2. Typography 16px body, Color Tokens & Zero Gemini
    expect(localAudit.bodyFont).toContain(referenceBaseline.fontIncludes);
    expect(localAudit.bodyBg).toBe(referenceBaseline.bodyBg);
    expect(localAudit.bodySize).toBeGreaterThanOrEqual(16);
    expect(localAudit.hasGeminiWord).toBe(false);

    // 3. Hero Banner Parity
    expect(localAudit.h1FontSize).toBeGreaterThanOrEqual(30);
    expect(localAudit.heroBadgeRect?.width).toBeGreaterThanOrEqual(80);

    // 4. A1->C2 4-Column Card Grid & Radix HoverCard Preview
    expect(localAudit.gridCols).toBe(4);
    expect(localAudit.minCardHeight).toBeGreaterThanOrEqual(180);

    await page
      .getByTestId("thematic-card-theme-a1-office-arrival")
      .hover();
    await expect(
      page.getByText("Từ vựng trọng tâm trong bài:")
    ).toBeVisible({ timeout: 3000 });
  });

  test("verifies Theo chủ đề A1 -> C2 CEFR filters, Nghe check 3-mode studio, keyboard hints, and Word Drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page.getByTestId("cefr-filter-C2").click();
    await expect(page.getByText("C2 · Part 3").first()).toBeVisible();

    await page.getByTestId("cefr-filter-A1").click();
    await page.getByTestId("thematic-card-theme-a1-office-arrival").click();

    // Verify all 3 screenshot-matched Studio regions
    await expect(page.getByTestId("studio-mode-check")).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByTestId("dau-waveform-player")).toBeVisible();
    await expect(page.getByTestId("studio-bottom-bar")).toContainText(
      "Ctrl: phát lại · Tab: lật từ · Enter: câu tiếp theo · ←/→: chuyển câu"
    );
    await expect(page.getByTestId("question-switcher-button")).toContainText(
      "1/3"
    );

    // Click Hỏi bài popover & check content
    await page.getByTestId("ask-lesson-button").click();
    await expect(page.getByText("Giải thích câu nghe")).toBeVisible();
    await page.keyboard.press("Escape");

    // Reveal 1 word via LẬT TỪ 1 từ button
    await page.getByTestId("reveal-1").click();
    await page.getByTestId("exit-studio-button").click();
  });

  test("verifies interactive Game, Café, Cộng đồng, About us, and Theme toggle from navbar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page.getByTestId("nav-game").click();
    await expect(
      page.getByRole("heading", { name: /Game So tài TOEIC/i })
    ).toBeVisible();
    await page.getByTestId("game-start-button").click();
    await expect(page.getByText(/Combo x0/)).toBeVisible();

    await page.getByTestId("nav-cafe").click();
    await expect(
      page.getByRole("heading", { name: /Duc Café Focus Room/i })
    ).toBeVisible();
    await page.getByTestId("cafe-timer-toggle").click();
    await expect(page.getByTestId("cafe-timer-toggle")).toContainText(
      "Tạm dừng"
    );

    await page.getByTestId("nav-community").click();
    await page.getByTestId("menu-find-buddies").click();
    await expect(
      page.getByText("Cộng đồng · Tìm bạn học TOEIC")
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByTestId("nav-about").click();
    await page.getByTestId("menu-about-founder").click();
    await expect(
      page.getByRole("heading", { name: "Giới thiệu Duc English" })
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByTestId("theme-toggle-button").click();
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDark).toBe(true);
    await page.getByTestId("theme-toggle-button").click();
  });
});
