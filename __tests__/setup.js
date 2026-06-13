const fs = require('fs');
const path = require('path');

// Mock missing browser features in JSDOM environment
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

function loadDocument() {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Parse the full HTML document
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Copy attributes of the html element (like lang="en")
  Array.from(document.documentElement.attributes).forEach(attr => {
    document.documentElement.removeAttribute(attr.name);
  });
  Array.from(doc.documentElement.attributes).forEach(attr => {
    document.documentElement.setAttribute(attr.name, attr.value);
  });
  
  // Copy the inner content
  document.documentElement.innerHTML = doc.documentElement.innerHTML;
}

function loadScript() {
  const scriptPath = path.resolve(__dirname, '../script.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  
  // Wrap in an IIFE to prevent "const/let already declared" SyntaxErrors when loaded multiple times in tests,
  // while exposing key global functions on the window object so they can be verified.
  const wrappedContent = `
    (function(window, document) {
      ${scriptContent}
      
      // Expose global functions to window for unit tests
      window.announce = typeof announce !== 'undefined' ? announce : null;
      window.openMobileMenu = typeof openMobileMenu !== 'undefined' ? openMobileMenu : null;
      window.closeMobileMenu = typeof closeMobileMenu !== 'undefined' ? closeMobileMenu : null;
      window.openLightbox = typeof openLightbox !== 'undefined' ? openLightbox : null;
      window.closeLightbox = typeof closeLightbox !== 'undefined' ? closeLightbox : null;
      window.copyPrompt = typeof copyPrompt !== 'undefined' ? copyPrompt : null;
    })(window, document);
  `;
  
  const script = document.createElement('script');
  script.textContent = wrappedContent;
  document.body.appendChild(script);
}

module.exports = {
  loadDocument,
  loadScript
};
