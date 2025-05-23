const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new"
  });
  const page = await browser.newPage();
  await page.goto("https://fx.minkabu.jp/indicators", { waitUntil: "networkidle0" });

  const result = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map(row => {
      const cells = row.querySelectorAll("td");
      return {
        datetime: cells[0]?.innerText.trim(),
        name: cells[1]?.innerText.trim(),
        importance: cells[2]?.innerText.trim(),
        result: cells[5]?.innerText.trim()
      };
    });
  });

  await browser.close();
  res.json(result);
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
