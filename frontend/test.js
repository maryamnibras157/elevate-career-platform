const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`[Browser Error] ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    
    console.log("Page loaded. Pressing Ctrl+K...");
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
    
    // Wait for any dialogs
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking search bar...");
    // We need to click the search bar, which has the text "Search documentation..."
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const searchBtn = btns.find(b => b.textContent.includes('Search'));
      if (searchBtn) searchBtn.click();
      else console.log('Search button not found');
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking notification bell...");
    // Find the bell icon or a button with .h-4.w-4 bell
    await page.evaluate(() => {
      // Find the notification button by looking at its structure
      // It has size="icon-sm" and a bell svg
      const svgs = Array.from(document.querySelectorAll('svg'));
      const bellSvg = svgs.find(s => s.classList.contains('lucide-bell'));
      if (bellSvg) {
        const btn = bellSvg.closest('button');
        if (btn) btn.click();
        else console.log('Bell button not found');
      } else {
        console.log('Bell SVG not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 1000));

  } catch (err) {
    console.error("Test script failed:", err);
  } finally {
    await browser.close();
  }
})();
