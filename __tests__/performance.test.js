const fs = require('fs');
const path = require('path');
const { loadDocument } = require('./setup');

describe('Performance and Efficiency Checks', () => {
  let htmlContent;
  let cssContent;
  let jsContent;
  let htmlPath;
  let cssPath;
  let jsPath;

  beforeAll(() => {
    htmlPath = path.resolve(__dirname, '../index.html');
    cssPath = path.resolve(__dirname, '../style.css');
    jsPath = path.resolve(__dirname, '../script.js');

    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    cssContent = fs.readFileSync(cssPath, 'utf8');
    jsContent = fs.readFileSync(jsPath, 'utf8');
  });

  beforeEach(() => {
    loadDocument();
  });

  test('CSS file size should be within reasonable limits', () => {
    const stats = fs.statSync(cssPath);
    expect(stats.size).toBeLessThan(50 * 1024);
  });

  test('JS file size should be within reasonable limits', () => {
    const stats = fs.statSync(jsPath);
    expect(stats.size).toBeLessThan(20 * 1024);
  });

  test('No duplicate IDs in the document', () => {
    const elementsWithId = document.querySelectorAll('[id]');
    const ids = [];
    elementsWithId.forEach(el => {
      ids.push(el.id);
    });
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  test('Images should use proper loading optimization', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const loading = img.getAttribute('loading');
      expect(['lazy', 'eager']).toContain(loading);
    });
  });

  test('Scripts should be defer or placed at the bottom of the body to prevent blocking render', () => {
    const scriptTags = document.querySelectorAll('script[src]');
    scriptTags.forEach(script => {
      const parent = script.parentNode;
      const isAtBodyEnd = parent.tagName.toLowerCase() === 'body';
      const hasDefer = script.hasAttribute('defer');
      const hasAsync = script.hasAttribute('async');
      
      expect(isAtBodyEnd || hasDefer || hasAsync).toBe(true);
    });
  });

  test('CSS should utilize custom properties for efficiency', () => {
    expect(cssContent).toContain(':root');
    expect(cssContent).toContain('--bg-primary');
    expect(cssContent).toContain('var(');
  });

  test('Fonts should use display swap for better UX and performance', () => {
    expect(htmlContent).toContain('display=swap');
  });
});
