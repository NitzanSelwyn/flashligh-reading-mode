let overlay = null;
let isActive = false;
let currentMode = "flashlight";

const flashlightCursor = (`data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="handle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:%23666"/>
      <stop offset="100%" style="stop-color:%23999"/>
    </linearGradient>
    <radialGradient id="beam" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:white;stop-opacity:1" />
      <stop offset="70%" style="stop-color:white;stop-opacity:0.5" />
      <stop offset="100%" style="stop-color:white;stop-opacity:0" />
    </radialGradient>
  </defs>
  <g transform="rotate(-45, 16, 16)">
    <rect x="14" y="16" width="4" height="12" fill="url(%23handle)" rx="1"/>
    <path d="M12,16 L20,16 L20,12 A4,4 0 0,0 12,12 Z" fill="%23444"/>
    <circle cx="16" cy="12" r="8" fill="url(%23beam)"/>
  </g>
</svg>`).replace(/\n\s*/g, '');

const candleCursor = (`data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="8" fill="orange"/>
  <path d="M16 8c2 4 0 8 0 8s-2-4 0-8z" fill="red"/>
</svg>`).replace(/\n\s*/g, '');

function createOverlay() {
    overlay = document.createElement("div");
    overlay.className = "flashlight-overlay";
    document.body.appendChild(overlay);
}

function updateOverlay(e) {
    if (!overlay || !isActive) return;
    const x = e.clientX;
    const y = e.clientY;
    if (currentMode === "flashlight") {
        const radius = 200;
        overlay.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 0%, transparent 100%, black 100%)`;
    } else if (currentMode === "candle") {
        const radius = 150;
        overlay.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(255, 255, 200, 1) 0%, rgba(255, 200, 0, 0.5) 70%, black 100%)`;
    }
}

function injectGlobalCursorStyles(active) {
    let styleElement = document.getElementById('flashlight-cursor-styles');

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'flashlight-cursor-styles';
        document.head.appendChild(styleElement);
    }

    const cursorImage = currentMode === "candle" ? candleCursor : flashlightCursor;

    if (active) {
        styleElement.textContent = `
      * {
        cursor: url('${cursorImage}') 16 16, auto !important;
      }
      
      a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"] {
        cursor: url('${cursorImage}') 16 16, pointer !important;
      }
      
      input[type="text"], input[type="password"], textarea, [contenteditable="true"] {
        cursor: url('${cursorImage}') 16 16, text !important;
      }
    `;
    } else {
        styleElement.textContent = '';
    }
}

function toggleOverlay() {
    if (!overlay) {
        createOverlay();
    }
    isActive = !isActive;
    overlay.classList.toggle("active");
    injectGlobalCursorStyles(isActive);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        toggleOverlay();

    } else if (request.action === "getState") {
        sendResponse({ isActive, mode: currentMode });
    } else if (request.action === "setMode") {
        currentMode = request.mode;
        if (isActive) {
            injectGlobalCursorStyles(true);
        }
        sendResponse({ success: true, mode: currentMode });
    }
    return true;
});

document.addEventListener("mousemove", updateOverlay);

createOverlay();

const observer = new MutationObserver(() => {
    if (isActive) {
        injectGlobalCursorStyles(true);
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

document.addEventListener('load', function (e) {
    if (e.target.tagName === 'IFRAME' && isActive) {
        try {
            injectGlobalCursorStyles(true);
        } catch (err) {
            console.error('Error injecting cursor styles:', err);
        }
    }
}, true);
