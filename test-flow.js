import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Collect console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  // Collect errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  // Collect failed requests
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.url(), request.failure().errorText);
  });

  try {
    console.log('Navigating to flow.html...');
    await page.goto('http://localhost:3000/tools/oversight/flow.html?domain=emigrationbrewing.com&view=month&domainkey=open', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('\nPage loaded successfully');

    // Check if there's any error on the page
    const hasError = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('Error') || body.includes('error');
    });

    if (hasError) {
      console.log('\nPage contains error text');
    }

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('Error loading page:', error.message);
  }

  await browser.close();
})();
