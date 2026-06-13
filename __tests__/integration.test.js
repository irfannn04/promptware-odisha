const { loadDocument, loadScript } = require('./setup');

describe('End-to-End Integration Flows', () => {
  let originalMatchMedia;
  let originalIntersectionObserver;
  let originalClipboard;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    originalIntersectionObserver = window.IntersectionObserver;
    originalClipboard = navigator.clipboard;

    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    window.IntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
    });
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
    window.IntersectionObserver = originalIntersectionObserver;
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
    loadDocument();
    loadScript();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should load page and run JS successfully without throwing errors', () => {
    expect(document.title).toContain('Odisha Cultural Heritage');
    expect(document.getElementById('particles')).toBeTruthy();
  });

  test('navigation flow: links targeting correct sections', () => {
    const navLinks = document.querySelectorAll('#navbar .nav-links a');
    navLinks.forEach(link => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      expect(targetElement).toBeTruthy();
    });
  });

  test('lightbox integration flow: click to open, escape to close, check focus restoration', () => {
    const artworkFrame = document.querySelector('.artwork-frame');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    artworkFrame.focus();
    expect(document.activeElement).toBe(artworkFrame);

    artworkFrame.click();
    expect(lightbox.classList.contains('active')).toBe(true);
    expect(lightbox.getAttribute('aria-hidden')).toBe('false');

    expect(document.activeElement).toBe(lightboxClose);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.classList.contains('active')).toBe(false);
    expect(lightbox.getAttribute('aria-hidden')).toBe('true');

    expect(document.activeElement).toBe(artworkFrame);
  });

  test('mobile menu integration flow: click hamburger, click link, check menu closes', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const firstLink = mobileMenu.querySelector('nav a');

    expect(mobileMenu.classList.contains('open')).toBe(false);

    hamburger.click();
    expect(mobileMenu.classList.contains('open')).toBe(true);
    expect(document.activeElement).toBe(firstLink);

    firstLink.click();
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  test('copy button integration flow: click, copies text, status updates and reverts', async () => {
    const copyBtn = document.getElementById('copyBtn');
    const spanText = copyBtn.querySelector('span');

    expect(spanText.textContent).toBe('Copy');

    copyBtn.click();

    await Promise.resolve();
    expect(copyBtn.classList.contains('copied')).toBe(true);
    expect(spanText.textContent).toBe('Copied!');

    jest.advanceTimersByTime(2005);
    expect(copyBtn.classList.contains('copied')).toBe(false);
    expect(spanText.textContent).toBe('Copy');
  });
});
