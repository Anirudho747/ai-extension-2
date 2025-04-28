// ✅ Corrected content-script.js

console.log("✨ content-script.js injected. Starting DOM auto-capture...");

(function autoCaptureVisibleDOM() {
    console.log("🔍 DOM auto-capture script starting...");

    function getVisibleText(el) {
        const style = window.getComputedStyle(el);
        const isVisible = style && style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
        const text = (el.innerText || el.textContent || el.placeholder || el.getAttribute("aria-label") || "").trim();
        return isVisible && text.length > 0 ? text : null;
    }

    function collectScreenElements() {
        const tagsToScan = [
            "label", "button", "a", "input", "textarea", "select",
            "span", "div", "h1", "h2", "h3", "h4", "h5", "h6"
        ];

        const elements = new Set();

        tagsToScan.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => {
                const visibleText = getVisibleText(el);
                if (visibleText) {
                    elements.add(visibleText.toLowerCase());
                }
            });
        });

        const keywordArray = Array.from(elements);

        chrome.storage.sync.set({ currentScreenElements: keywordArray }, () => {
            console.log("📋 Captured and saved screen elements:", keywordArray);
        });
    }

    // Debounce function to avoid over-triggering
    let debounceTimer;
    function debounce(fn, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, delay);
    }

    // Run once when page loads
    window.addEventListener("load", () => {
        debounce(collectScreenElements, 1000);
    });

    // Also re-run when page structure changes
    const observer = new MutationObserver(() => {
        debounce(collectScreenElements, 1000);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
    });
})();


