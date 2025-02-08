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
  <defs>
    <animate id="flicker1" attributeName="opacity" values="0.5;0.8;0.5;0.7;0.5" dur="0.5s" repeatCount="indefinite"/>
    <animate id="flicker2" attributeName="opacity" values="0.7;0.5;0.8;0.6;0.7" dur="0.7s" repeatCount="indefinite"/>
  </defs>
  <rect x="14" y="16" width="4" height="12" fill="%23F4F4F4" rx="1"/>
  <line x1="16" y1="8" x2="16" y2="16" stroke="%23333333" stroke-width="1"/>
  <path d="M16,8 Q18,10 16,14 Q14,10 16,8" fill="%23FF6B00">
    <animate attributeName="d" 
      values="M16,8 Q18,10 16,14 Q14,10 16,8;
              M16,8 Q17,10 16,14 Q15,10 16,8;
              M16,8 Q18,10 16,14 Q14,10 16,8" 
      dur="0.5s" repeatCount="indefinite"/>
  </path>
  <path d="M16,7 Q19,10 16,15 Q13,10 16,7" fill="%23FFB800" opacity="0.7">
    <animate attributeName="d" 
      values="M16,7 Q19,10 16,15 Q13,10 16,7;
              M16,7 Q18,10 16,15 Q14,10 16,7;
              M16,7 Q19,10 16,15 Q13,10 16,7" 
      dur="0.7s" repeatCount="indefinite"/>
  </path>
  <path d="M16,6 Q20,10 16,16 Q12,10 16,6" fill="%23FFE2B7" opacity="0.5">
    <animate attributeName="d" 
      values="M16,6 Q20,10 16,16 Q12,10 16,6;
              M16,6 Q19,10 16,16 Q13,10 16,6;
              M16,6 Q20,10 16,16 Q12,10 16,6" 
      dur="0.6s" repeatCount="indefinite"/>
  </path>
  <rect x="14" y="16" width="1" height="12" fill="%23E0E0E0"/>
  <rect x="17" y="16" width="1" height="12" fill="%23D0D0D0"/>
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
        overlay.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, 
            rgba(0,0,0,0) 20%, 
            rgba(0,0,0,0.2) 40%, 
            rgba(0,0,0,0.6) 70%, 
            rgba(0,0,0,0.95) 100%)`;
    } else if (currentMode === "candle") {
        const radius = 150;
        const time = Date.now() / 1000;
        const flickerAmount = Math.sin(time * 2) * 3 + (Math.random() * 2 - 1);
        const adjustedRadius = radius + flickerAmount;
        const brightness = 0.95 + Math.sin(time * 1.5) * 0.02 + (Math.random() * 0.02 - 0.01);

        overlay.style.background = `radial-gradient(circle ${adjustedRadius}px at ${x}px ${y}px, 
            rgba(255, 240, 150, ${brightness}) 0%, 
            rgba(255, 220, 130, ${brightness * 0.9}) 20%, 
            rgba(255, 200, 100, ${brightness * 0.7}) 40%,
            rgba(255, 170, 70, ${brightness * 0.4}) 60%,
            rgba(0, 0, 0, 0.95) 100%)`;
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

// Add animation frame loop for smooth candle flicker
let animationFrameId = null;

function startFlickerAnimation() {
    if (isActive && currentMode === "candle") {
        updateOverlay({ clientX: lastX, clientY: lastY });
        // Reduce animation frequency to roughly 30fps
        setTimeout(() => {
            animationFrameId = requestAnimationFrame(startFlickerAnimation);
        }, 33); // ~30fps instead of 60fps
    }
}

function stopFlickerAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Add variables to track mouse position
let lastX = 0;
let lastY = 0;

// Update the mousemove event listener
document.addEventListener("mousemove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    updateOverlay(e);
});

// Update the toggle function to handle animation
function toggleOverlay() {
    if (!overlay) {
        createOverlay();
    }
    isActive = !isActive;
    overlay.classList.toggle("active");
    injectGlobalCursorStyles(isActive);
    
    if (isActive && currentMode === "candle") {
        startFlickerAnimation();
    } else {
        stopFlickerAnimation();
    }
}

// Update mode setting to handle animation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        toggleOverlay();
    } else if (request.action === "getState") {
        sendResponse({ isActive, mode: currentMode });
    } else if (request.action === "setMode") {
        const oldMode = currentMode;
        currentMode = request.mode;
        
        if (oldMode === "candle") {
            stopFlickerAnimation();
        }
        
        if (currentMode === "candle" && isActive) {
            startFlickerAnimation();
        }
        
        if (isActive) {
            injectGlobalCursorStyles(true);
        }
        sendResponse({ success: true, mode: currentMode });
    }
    return true;
});

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
