document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleButton");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getState" }, (response) => {
            if (response) {
                toggleButton.checked = response.isActive;
                // Optionally set the radio based on the current mode if needed:
                document.querySelector(`input[name="mode"][value="${response.mode}"]`).checked = true;
            }
        });
    });

    toggleButton.addEventListener("change", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
        });
    });

    document.querySelectorAll('input[name="mode"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const mode = e.target.value;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "setMode", mode });
            });
        });
    });
});
