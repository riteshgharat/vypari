const puppeteer = require('puppeteer');

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };