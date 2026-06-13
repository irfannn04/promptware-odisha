const { loadDocument } = require('./setup');

describe('DOM and HTML Structure Tests', () => {
  beforeEach(() => {
    loadDocument();
  });

  test('should have lang="en" on the html element', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  test('should have essential meta tags in head', () => {
    const charset = document.querySelector('meta[charset]');
    const viewport = document.querySelector('meta[name="viewport"]');
    const description = document.querySelector('meta[name="description"]');
    const keywords = document.querySelector('meta[name="keywords"]');
    
    expect(charset).toBeTruthy();
    expect(charset.getAttribute('charset')).toBe('UTF-8');
    expect(viewport).toBeTruthy();
    expect(description).toBeTruthy();
    expect(keywords).toBeTruthy();
  });

  test('should have Open Graph meta tags', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogType = document.querySelector('meta[property="og:type"]');

    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogImage).toBeTruthy();
    expect(ogType).toBeTruthy();
  });

  test('should have a single h1 element', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Odisha');
  });

  test('should have correct skip-to-content link', () => {
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  test('should have main landmark with id matching skip link target', () => {
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.getAttribute('id')).toBe('main-content');
  });

  test('should have header landmark and main navigation', () => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    expect(header).toBeTruthy();
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  test('should have footer landmark with role contentinfo', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer.getAttribute('role')).toBe('contentinfo');
  });

  test('should contain five core sections with aria-labelledby', () => {
    const sections = ['hero', 'artwork', 'prompt', 'elements', 'about'];
    sections.forEach(id => {
      const section = document.getElementById(id);
      expect(section).toBeTruthy();
      expect(section.tagName.toLowerCase()).toBe('section');
      expect(section.getAttribute('aria-labelledby')).toBeTruthy();
      
      const labelId = section.getAttribute('aria-labelledby');
      const heading = document.getElementById(labelId);
      expect(heading).toBeTruthy();
    });
  });

  test('should have descriptive alt text on all images', () => {
    const images = document.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt.trim().length).toBeGreaterThan(5);
    });
  });

  test('should have proper role and aria attributes on dialog elements', () => {
    const lightbox = document.getElementById('lightbox');
    const mobileMenu = document.getElementById('mobileMenu');

    expect(lightbox.getAttribute('role')).toBe('dialog');
    expect(lightbox.getAttribute('aria-hidden')).toBe('true');
    
    expect(mobileMenu.getAttribute('role')).toBe('dialog');
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('true');
  });

  test('should have aria-hidden on decorative canvas', () => {
    const canvas = document.getElementById('particles');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  test('should have unique element IDs', () => {
    const elementsWithId = document.querySelectorAll('[id]');
    const ids = [];
    elementsWithId.forEach(el => {
      ids.push(el.id);
    });
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  test('should have proper rel for external links', () => {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  });

  test('should have type attribute on all buttons', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.getAttribute('type')).toBeTruthy();
    });
  });
});
