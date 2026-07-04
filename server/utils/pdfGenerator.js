const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a PDF from HTML content
 * @param {string} htmlContent - The HTML string to render
 * @param {string} filename - The desired filename (without extension)
 * @returns {string} The public download URL for the generated PDF
 */
const generatePDF = async (htmlContent, filenamePrefix = 'doc') => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Create uploads/certificates directory if it doesn't exist
    const dirPath = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filename = `${filenamePrefix}-${uuidv4()}.pdf`;
    const filepath = path.join(dirPath, filename);
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    // Return the relative URL to access the PDF
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/certificates/${filename}`;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
};

module.exports = { generatePDF };
