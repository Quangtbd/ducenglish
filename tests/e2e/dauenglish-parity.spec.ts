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
  test("compares navbar completeness (all 11 items), typography, palette, hero, and 4-column card grid against dauenglish.com", async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Optional live reference check against dauenglish.com to pull current live baseline metrics
    let referenceBaseline = {
      headerHeight: 65,
      bodyBg: "rgb(248, 250, 252)",
      fontIncludes: "Be Vietnam Pro",
      requiredNavLabels: EXPECTED_NAV_LABELS,
      minCardHeight: 170,
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
      // Offline / network-restricted fallback uses captured dauenglish.com baseline
    }

    await page.goto("/");

    // Audit local Duc English page
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
        '[data-testid="test-part-grid-crack-vol1-test1"]'
      );
      const cards = grid ? Array.from(grid.children) : [];

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
      };
    });

    // 1. Header & Navbar Parity (all 11 controls matching dauenglish.com)
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
    await expect(page.getByTestId("nav-community")).toBeVisible();
    await expect(page.getByTestId("nav-about")).toBeVisible();
    await expect(page.getByTestId("theme-toggle-button")).toBeVisible();
    expect(localAudit.allHaveSvg).toBe(true);
    expect(localAudit.allSingleLine).toBe(true);
    expect(localAudit.horizontalOverflow).toBe(false);

    // 2. Typography & Color Tokens Parity
    expect(localAudit.bodyFont).toContain(referenceBaseline.fontIncludes);
    expect(localAudit.bodyBg).toBe(referenceBaseline.bodyBg);

    // 3. Hero Banner Parity
    expect(localAudit.h1FontSize).toBeGreaterThanOrEqual(30);
    expect(localAudit.heroBadgeRect?.width).toBeGreaterThanOrEqual(80);
    expect(localAudit.heroBadgeRect?.height).toBeGreaterThanOrEqual(80);

    // 4. Test Cards 4-Column Horizontal Grid Parity
    expect(localAudit.gridCols).toBe(referenceBaseline.gridCols);
    expect(localAudit.minCardHeight).toBeGreaterThanOrEqual(
      referenceBaseline.minCardHeight
    );
  });

  test("verifies interactive Game, Café, Cộng đồng, About us, and Theme toggle from the upgraded navbar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Game section
    await page.getByTestId("nav-game").click();
    await expect(
      page.getByRole("heading", { name: /Game So tài TOEIC/i })
    ).toBeVisible();
    await page.getByTestId("game-start-button").click();
    await expect(page.getByText(/Combo x0/)).toBeVisible();

    // Café section
    await page.getByTestId("nav-cafe").click();
    await expect(
      page.getByRole("heading", { name: /Duc Café Focus Room/i })
    ).toBeVisible();
    await page.getByTestId("cafe-timer-toggle").click();
    await expect(page.getByTestId("cafe-timer-toggle")).toContainText(
      "Tạm dừng"
    );

    // Cộng đồng dropdown -> Tìm bạn học
    await page.getByTestId("nav-community").click();
    await page.getByTestId("menu-find-buddies").click();
    await expect(
      page.getByText("Cộng đồng · Tìm bạn học TOEIC")
    ).toBeVisible();
    await page.keyboard.press("Escape");

    // About us dropdown -> Giới thiệu Duc English
    await page.getByTestId("nav-about").click();
    await page.getByTestId("menu-about-founder").click();
    await expect(
      page.getByRole("heading", { name: "Giới thiệu Duc English" })
    ).toBeVisible();
    await page.keyboard.press("Escape");

    // Theme toggle switches html.dark
    await page.getByTestId("theme-toggle-button").click();
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDark).toBe(true);
    await page.getByTestId("theme-toggle-button").click();
  });
});
