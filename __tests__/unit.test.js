const { loadDocument, loadScript } = require('./setup');

describe('JavaScript Functionality and State Tests', () => {
  let originalMatchMedia;
  let originalIntersectionObserver;
  let originalClipboard;
  let originalRequestAnimationFrame;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    originalIntersectionObserver = window.IntersectionObserver;
    originalClipboard = navigator.clipboard;
    originalRequestAnimationFrame = window.requestAnimationFrame;

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

    window.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 16));

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
    window.requestAnimationFrame = originalRequestAnimationFrame;
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

  test('should initialize and attach event listeners without error', () => {
    expect(document.getElementById('liveRegion')).toBeTruthy();
  });

  test('announce function should update live region text content', () => {
    expect(typeof window.announce).toBe('function');
    window.announce('Test announcement');
    
    jest.advanceTimersByTime(55);
    expect(document.getElementById('liveRegion').textContent).toBe('Test announcement');
  });

  test('openMobileMenu and closeMobileMenu should correctly toggle classes and attributes', () => {
    expect(typeof window.openMobileMenu).toBe('function');
    expect(typeof window.closeMobileMenu).toBe('function');

    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    window.openMobileMenu();
    expect(hamburger.classList.contains('active')).toBe(true);
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu.classList.contains('open')).toBe(true);
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('hidden');

    window.closeMobileMenu();
    expect(hamburger.classList.contains('active')).toBe(false);
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  test('openLightbox and closeLightbox should toggle lightbox state', () => {
    expect(typeof window.openLightbox).toBe('function');
    expect(typeof window.closeLightbox).toBe('function');

    const lightbox = document.getElementById('lightbox');

    window.openLightbox();
    expect(lightbox.classList.contains('active')).toBe(true);
    expect(lightbox.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('hidden');

    window.closeLightbox();
    expect(lightbox.classList.contains('active')).toBe(false);
    expect(lightbox.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  test('copyPrompt should copy prompt text and update button UI', async () => {
    expect(typeof window.copyPrompt).toBe('function');
    const copyBtn = document.getElementById('copyBtn');
    
    window.copyPrompt();
    
    await Promise.resolve();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Create a hyper-detailed')
    );
    
    expect(copyBtn.classList.contains('copied')).toBe(true);
    expect(copyBtn.querySelector('span').textContent).toBe('Copied!');

    jest.advanceTimersByTime(2005);
    expect(copyBtn.classList.contains('copied')).toBe(false);
    expect(copyBtn.querySelector('span').textContent).toBe('Copy');
  });

  test('hamburger click should toggle mobile menu', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    expect(mobileMenu.classList.contains('open')).toBe(false);
    hamburger.click();
    expect(mobileMenu.classList.contains('open')).toBe(true);
    hamburger.click();
    expect(mobileMenu.classList.contains('open')).toBe(false);
  });

  test('scrolling window should toggle scrolled class on navbar', () => {
    const navbar = document.getElementById('navbar');
    expect(navbar.classList.contains('scrolled')).toBe(false);

    window.scrollY = 100;
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('scrolled')).toBe(true);

    window.scrollY = 20;
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('scrolled')).toBe(false);
  });

  test('Escape key should close active lightbox and mobile menu', () => {
    const mobileMenu = document.getElementById('mobileMenu');
    const lightbox = document.getElementById('lightbox');

    window.openMobileMenu();
    expect(mobileMenu.classList.contains('open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(mobileMenu.classList.contains('open')).toBe(false);

    window.openLightbox();
    expect(lightbox.classList.contains('active')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.classList.contains('active')).toBe(false);
  });
});
