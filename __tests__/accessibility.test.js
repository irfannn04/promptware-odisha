const fs = require('fs');
const path = require('path');
const { loadDocument } = require('./setup');

describe('Accessibility Feature Tests', () => {
  beforeEach(() => {
    loadDocument();
  });

  test('skip link must target main-content', () => {
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
    
    const target = document.getElementById('main-content');
    expect(target).toBeTruthy();
  });

  test('all interactive elements must be keyboard focusable', () => {
    const interactiveElements = document.querySelectorAll('a, button, [tabindex="0"]');
    interactiveElements.forEach(el => {
      const isHiddenMenuLink = el.closest('#mobileMenu') && el.getAttribute('tabindex') === '-1';
      if (!isHiddenMenuLink) {
        expect(el.hasAttribute('tabindex') && el.getAttribute('tabindex') === '-1').toBe(false);
      }
    });
  });

  test('ARIA landmarks must be present and correctly labelled', () => {
    const nav = document.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');

    const main = document.querySelector('main');
    expect(main).toBeTruthy();

    const footer = document.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer.getAttribute('role')).toBe('contentinfo');
  });

  test('screen reader live region must exist with aria-live polite', () => {
    const liveRegion = document.getElementById('liveRegion');
    expect(liveRegion).toBeTruthy();
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
  });

  test('decorative elements should have aria-hidden', () => {
    const canvas = document.getElementById('particles');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');

    const icons = document.querySelectorAll('.nav-icon, .technique-icon, .element-icon');
    icons.forEach(icon => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  test('SVGs must have aria-hidden and focusable false', () => {
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
    });
  });

  test('CSS should contain prefers-reduced-motion media query', () => {
    const cssPath = path.resolve(__dirname, '../style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('prefers-reduced-motion');
  });

  test('CSS should contain forced-colors media query for high contrast mode', () => {
    const cssPath = path.resolve(__dirname, '../style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('forced-colors');
  });
});
