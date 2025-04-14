// content.js
// Only initialize if not already initialized
if (!window.elementInspector) {
    class ElementInspector {
        constructor() {
            this.isActive = false;
            this.selectedElements = new Set();
            this.highlightedElement = null;
            this.currentPort = null;
        }

        init() {
            // Add styles for highlighting if you haven't already
            const style = document.createElement('style');
            style.textContent = `
                            .genai-highlight {
                outline: 2px solid #ff6b2b !important;
                outline-offset: 1px !important;
                cursor: grab !important;
                box-shadow: 0 0 3px rgba(255, 107, 43, 0.3);
            }
                            .genai-selected {
                outline: 2px dashed #ff6b2b !important;
                outline-offset: 1px !important;
                background-color: rgba(255, 107, 43, 0.1) !important;
            }
            /* Specific styling for images */
            .genai-highlight img {
                cursor: grab !important;
                outline: 2px solid #ff6b2b !important;
            }
            
            .genai-selected img {
                outline: 2px dashed #ff6b2b !important;
                background-color: rgba(255, 107, 43, 0.1) !important;
            }
            `;
            document.head.appendChild(style);

            // Bind event handlers
            this.handleMouseOver = this.handleMouseOver.bind(this);
            this.handleMouseOut = this.handleMouseOut.bind(this);
            this.handleClick = this.handleClick.bind(this);

            // Setup connection listener
            chrome.runtime.onConnect.addListener(this.handleConnection.bind(this));

            // Listen for one-off messages
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                try {
                    switch (message.type) {
                        case 'CLEAR_SELECTION':
                            // Remove highlight from all selected elements
                            this.selectedElements.forEach(element => {
                                element.classList.remove('genai-selected');
                                element.classList.remove('genai-highlight');
                            });
                            this.selectedElements.clear();
                            this.highlightedElement = null;
                            sendResponse({ success: true });
                            break;

                        case 'CLEANUP':
                            this.cleanup();
                            sendResponse({ success: true });
                            break;

                        default:
                            // no-op
                            break;
                    }
                    return true; // Indicate async
                } catch (error) {
                    console.error('Error handling message:', error);
                    sendResponse({ error: error.message });
                    return true;
                }
            });
        }

        handleConnection(port) {
            this.currentPort = port;
            
            port.onMessage.addListener((message) => {
                if (message.type === 'TOGGLE_INSPECTOR') {
                    if (!this.isActive) {
                        this.startInspecting();
                    } else {
                        this.stopInspecting();
                    }
                    port.postMessage({ 
                        type: 'INSPECTOR_STATE', 
                        isActive: this.isActive,
                        hasContent: this.selectedElements.size > 0 
                    });
                } else if (message.type === 'CLEANUP') {
                    this.cleanup();
                }
            });

            port.onDisconnect.addListener(() => {
                this.cleanup();
                this.currentPort = null;
            });
        }

        startInspecting() {
            this.isActive = true;
            document.addEventListener('mouseover', this.handleMouseOver);
            document.addEventListener('mouseout', this.handleMouseOut);
            document.addEventListener('click', this.handleClick, true);
            document.body.style.cursor = 'grab';
        }

        stopInspecting() {
            this.isActive = false;
            document.removeEventListener('mouseover', this.handleMouseOver);
            document.removeEventListener('mouseout', this.handleMouseOut);
            document.removeEventListener('click', this.handleClick, true);
            document.body.style.cursor = '';

            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('genai-highlight');
                this.highlightedElement = null;
            }
        }

        handleMouseOver(event) {
            if (!this.isActive) return;

            event.preventDefault();
            event.stopPropagation();

            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('genai-highlight');
            }

            this.highlightedElement = event.target;
            this.highlightedElement.classList.add('genai-highlight');
            console.log('Mouse over element:', this.highlightedElement);
        }

        handleMouseOut(event) {
            if (!this.isActive) return;

            event.preventDefault();
            event.stopPropagation();

            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('genai-highlight');
                this.highlightedElement = null;
                console.log('Mouse out, cleared highlight');
            }
        }

        handleClick(event) {
            if (!this.isActive) return;

            event.preventDefault();
            event.stopPropagation();

            // Get the closest element that is an image or other selectable elements
            const element = event.target.closest('img, div, p, span, a'); // Add more selectors as needed

            if (!element) return;

            // Toggle selection
            if (this.selectedElements.has(element)) {
                this.selectedElements.delete(element);
                element.classList.remove('genai-selected');
            } else {
                this.selectedElements.add(element);
                element.classList.add('genai-selected');
            }

            // Build aggregated DOM content
            const domContent = Array.from(this.selectedElements)
                .map(el => el.outerHTML)
                .join('\n');

            console.log('[content.js] Built snippet:', domContent);
            console.log('[content.js] Type:', typeof domContent);

            // Send message to extension
            chrome.runtime.sendMessage({
                type: 'SELECTED_DOM_CONTENT',
                content: domContent
            });
        }

        cleanup() {
            this.stopInspecting();
            this.selectedElements.forEach(element => {
                element.classList.remove('genai-selected');
            });
            this.selectedElements.clear();
        }
    }

    // Initialize and store in window object
    window.elementInspector = new ElementInspector();
    window.elementInspector.init();
}
