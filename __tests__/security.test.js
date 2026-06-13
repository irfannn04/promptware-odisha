const fs = require('fs');
const path = require('path');
const { loadDocument } = require('./setup');

describe('Security Assessment Tests', () => {
  let htmlContent;
  let jsContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const jsPath = path.resolve(__dirname, '../script.js');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    jsContent = fs.readFileSync(jsPath, 'utf8');
  });

  beforeEach(() => {
    loadDocument();
  });

  test('should not contain inline event handlers in HTML', () => {
    const inlineHandlers = ['onclick', 'onload', 'onchange', 'onsubmit', 'onmouseover', 'onkeydown'];
    inlineHandlers.forEach(handler => {
      const regex = new RegExp(`\\s${handler}\\s*=`, 'i');
      expect(htmlContent).not.toMatch(regex);
    });
  });

  test('should have Content Security Policy meta tag', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(csp).toBeTruthy();
  });

  test('all external links must use rel="noopener noreferrer"', () => {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
      const rel = link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  test('should not use dangerous functions in JS', () => {
    expect(jsContent).not.toContain('eval(');
    expect(jsContent).not.toContain('document.write(');
    // Note: outerHTML/innerHTML checks to prevent XSS
    expect(jsContent).not.toContain('innerHTML');
  });

  test('should use modern clipboard API instead of legacy execCommand', () => {
    expect(jsContent).toContain('navigator.clipboard.writeText');
    expect(jsContent).not.toContain('execCommand');
  });

  test('should not contain any hardcoded API keys or credentials', () => {
    const apiPatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i
    ];
    apiPatterns.forEach(pattern => {
      const matches = jsContent.match(pattern);
      if (matches) {
        const lines = jsContent.split('\n');
        lines.forEach(line => {
          if (pattern.test(line)) {
            expect(line).not.toMatch(/=\s*['"`][A-Za-z0-9+/=]{20,}['"`]/);
          }
        });
      }
    });
  });
});
