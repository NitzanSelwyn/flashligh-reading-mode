let overlay = null;
let isActive = false;

function createOverlay() {
    overlay = document.createElement("div");
    overlay.className = "flashlight-overlay";
    document.body.appendChild(overlay);
}

function updateOverlay(e) {
    if (!overlay || !isActive) return;

    const radius = 200;
    const x = e.clientX;
    const y = e.clientY;

    overlay.style.background = `radial-gradient(
    circle ${radius}px at ${x}px ${y}px,
    transparent 0%,
    transparent 100%,
    black 100%
  )`;
}

function toggleOverlay() {
    if (!overlay) {
        createOverlay();
    }
    isActive = !isActive;
    overlay.classList.toggle("active");
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        toggleOverlay();
    } else if (request.action === "getState") {
        sendResponse({ isActive });
    }
    return true;
});

// Add mousemove event listener
document.addEventListener("mousemove", updateOverlay);

// Create initial overlay
createOverlay();
