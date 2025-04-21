// Only declare DOMObserver if it hasn't been declared yet
if (!window.DOMObserver) {
    class DOMObserver {
        constructor() {
            this.idCounter = 0;
            this.changes = [];
            this.isValid = true;
            this.selectedElements = [];
            this.isInspecting = false;
            
            // Bind methods to preserve 'this' context
            this.handleMouseOver = this.handleMouseOver.bind(this);
            this.handleMouseOut = this.handleMouseOut.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }

        init() {
            try {
                this.injectMMIDs();
                this.setupObserver();
            } catch (error) {
                console.error('Error initializing DOMObserver:', error);
                this.isValid = false;
            }
        }

        cleanup() {
            // Remove all event listeners and reset state
            document.removeEventListener('mouseover', this.handleMouseOver);
            document.removeEventListener('mouseout', this.handleMouseOut);
            document.removeEventListener('click', this.handleClick);
            this.selectedElements = [];
            this.isInspecting = false;
            
            // Remove highlighting from any selected elements
            document.querySelectorAll('.inspector-highlight').forEach(el => {
                el.classList.remove('inspector-highlight');
            });
        }

        toggleInspector() {
            if (this.isInspecting) {
                this.stopInspecting();
                return { isActive: false, hasContent: this.selectedElements.length > 0 };
            } else {
                this.startInspecting();
                return { isActive: true, hasContent: this.selectedElements.length > 0 };
            }
        }

        startInspecting() {
            this.isInspecting = true;
            document.addEventListener('mouseover', this.handleMouseOver);
            document.addEventListener('mouseout', this.handleMouseOut);
            document.addEventListener('click', this.handleClick);
        }

        stopInspecting() {
            this.isInspecting = false;
            document.removeEventListener('mouseover', this.handleMouseOver);
            document.removeEventListener('mouseout', this.handleMouseOut);
            document.removeEventListener('click', this.handleClick);
            
            // Remove highlighting from any elements
            document.querySelectorAll('.inspector-highlight').forEach(el => {
                el.classList.remove('inspector-highlight');
            });
        }

        handleMouseOver(event) {
            if (!this.isInspecting) return;
            event.stopPropagation();
            event.target.classList.add('inspector-highlight');
        }

        handleMouseOut(event) {
            if (!this.isInspecting) return;
            event.stopPropagation();
            event.target.classList.remove('inspector-highlight');
        }

        handleClick(event) {
            if (!this.isInspecting) return;
            event.preventDefault();
            event.stopPropagation();
            
            const element = event.target;
            const elementHtml = element.outerHTML;
            
            // Add to selected elements if not already selected
            if (!this.selectedElements.includes(elementHtml)) {
                this.selectedElements.push(elementHtml);
                
                // Send selected DOM content to extension
                chrome.runtime.sendMessage({
                    type: 'SELECTED_DOM_CONTENT',
                    content: this.selectedElements
                });
            }
        }

        injectMMIDs() {
            const processElements = (elements) => {
                elements.forEach(element => {
                    if (!element.getAttribute('mmid')) {
                        element.setAttribute('mmid', `elem_${++this.idCounter}`);
                    }
                });
            };

            processElements(document.querySelectorAll('*'));
        }

        setupObserver() {
            // Add styles for highlighting
            if (!document.getElementById('inspector-styles')) {
                const style = document.createElement('style');
                style.id = 'inspector-styles';
                style.textContent = `
                    .inspector-highlight {
                        outline: 2px solid #ff6b2b !important;
                        outline-offset: -2px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    // Store the class in window object
    window.DOMObserver = DOMObserver;
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_INSPECTOR') {
        try {
            // Reset the inspector state if requested
            if (message.reset) {
                window.domObserver?.cleanup?.();
                window.domObserver = new window.DOMObserver();
                window.domObserver.init();
            }
            
            if (!window.domObserver) {
                window.domObserver = new window.DOMObserver();
                window.domObserver.init();
            }
            
            const isActive = window.domObserver.toggleInspector();
            sendResponse({ isActive });
        } catch (error) {
            console.error('Error in TOGGLE_INSPECTOR:', error);
            sendResponse({ error: error.message });
        }
        return true;
    }
    
    if (message.type === 'GET_SELECTED_DOM') {
        sendResponse({ dom: window.domObserver?.selectedElements || [] });
        return true;
    }
    
    if (message.type === 'CLEANUP') {
        window.domObserver?.cleanup?.();
        sendResponse({ success: true });
        return true;
    }
});

// Initialize observer only if it hasn't been initialized
if (!window.domObserver) {
    window.domObserver = new window.DOMObserver();
    window.domObserver.init();
}

(function autoCaptureVisibleDOM() {
    function isElementVisible(el) {
        const style = window.getComputedStyle(el);
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            el.offsetParent !== null
        );
    }

    function getReadableDescription(el) {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || "").trim();
        const placeholder = el.getAttribute("placeholder");
        const aria = el.getAttribute("aria-label");
        const nameAttr = el.getAttribute("name");
        let label = text || placeholder || aria || nameAttr || "";

        // Simplify long content
        if (label.length > 50) label = label.substring(0, 50) + "...";

        // Return natural sentence
        if (tag === "input" || tag === "textarea") {
            return `Input with label "${label}"`;
        } else if (tag === "button") {
            return `Button with text "${label}"`;
        } else if (["h1", "h2", "h3", "h4", "h5", "h6", "label", "span", "div", "a"].includes(tag)) {
            return `${tag.charAt(0).toUpperCase() + tag.slice(1)} with text "${label}"`;
        }

        return null;
    }

    function collectScreenElements() {
        const tagsToScan = ["input", "button", "textarea", "select", "label", "a", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6"];
        const result = [];

        tagsToScan.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => {
                if (!isElementVisible(el)) return;

                const readable = getReadableDescription(el);
                if (readable) {
                    result.push(readable);
                }
            });
        });

        chrome.storage.sync.set({ currentScreenElements: result });
        console.log("✅ Stored structured DOM elements:", result);
    }

    let debounceTimer;
    const debounce = (fn, delay) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, delay);
    };

    window.addEventListener("load", () => {
        debounce(collectScreenElements, 500);
    });

    const observer = new MutationObserver(() => {
        debounce(collectScreenElements, 1000);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
})();

(function autoCaptureVisibleDOM() {
    function isElementVisible(el) {
        const style = window.getComputedStyle(el);
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            el.offsetParent !== null
        );
    }

    function getMetadata(el) {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || "").trim();
        const placeholder = el.getAttribute("placeholder");
        const aria = el.getAttribute("aria-label");
        const nameAttr = el.getAttribute("name");

        const label = text || placeholder || aria || nameAttr || "";

        let selector = "";
        if (placeholder) {
            selector = `${tag}[placeholder="${placeholder}"]`;
        } else if (aria) {
            selector = `${tag}[aria-label="${aria}"]`;
        } else if (nameAttr) {
            selector = `${tag}[name="${nameAttr}"]`;
        } else if (text) {
            selector = `${tag}:contains("${text}")`; // fallback
        }

        return label && selector
            ? { label: label.toLowerCase(), tag, selector }
            : null;
    }

    function collectScreenElements() {
        const tagsToScan = ["input", "button", "textarea", "select", "label", "a", "span", "div", "h1", "h2", "h3"];
        const enrichedElements = [];

        tagsToScan.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => {
                if (!isElementVisible(el)) return;
                const meta = getMetadata(el);
                if (meta) enrichedElements.push(meta);
            });
        });

        chrome.storage.sync.set({ screenElementsMeta: enrichedElements });
        console.log("✅ Stored DOM metadata for AI Matching", enrichedElements);
    }

    let debounceTimer;
    const debounce = (fn, delay) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, delay);
    };

    window.addEventListener("load", () => {
        debounce(collectScreenElements, 500);
    });

    const observer = new MutationObserver(() => {
        debounce(collectScreenElements, 1000);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
})();

