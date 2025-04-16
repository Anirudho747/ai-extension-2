// scenario.js

import { getPrompt } from "./prompts.js";

// DOM Elements
const scenarioInput = document.getElementById("scenarioInput");
const scenarioOutputType = document.getElementById("scenarioOutputType");
const generateBtn = document.getElementById("generateScenario");
const scenarioMessages = document.getElementById("scenarioMessages");
const scenarioLoading = document.getElementById("scenarioLoading");
const scenarioToast = document.getElementById("scenarioToast");

// Render messages in chat style
function appendMessage(role, content) {
    const message = document.createElement("div");
    message.className = role === "user" ? "user-message" : "ai-message";
    message.innerHTML = marked.parse(content);
    scenarioMessages.appendChild(message);
    scenarioMessages.scrollTop = scenarioMessages.scrollHeight;
}

// Show/hide toast warning
function showToast() {
    scenarioToast.style.display = "block";
    setTimeout(() => {
        scenarioToast.style.display = "none";
    }, 5000);
}

// Show/hide loading spinner
function showLoading(show) {
    scenarioLoading.style.display = show ? "block" : "none";
}

// Main handler for scenario generation
async function generateScenarioCode() {
    const scenarioText = scenarioInput.value.trim();
    const outputType = scenarioOutputType.value;
    if (!scenarioText) return;

    scenarioMessages.innerHTML = "";
    appendMessage("user", scenarioText);
    showLoading(true);

    // Load config and keys
    chrome.storage.sync.get(
        [
            "selectedProvider",
            "selectedModel",
            "languageBinding",
            "browserEngine",
            "groqApiKey",
            "openaiApiKey",
            "testleafApiKey",
            "currentScreenElements"
        ],
        async (config) => {
            const {
                selectedProvider,
                selectedModel,
                languageBinding,
                browserEngine,
                groqApiKey,
                openaiApiKey,
                testleafApiKey,
                currentScreenElements = []
            } = config;

            const prompt = getPrompt("SCENARIO_TEST_BUILDER", {
                scenario: scenarioText,
                outputType,
                language: languageBinding,
                engine: browserEngine
            });

            let response = null;
            try {
                if (selectedProvider === "openai") {
                    const client1 = new window.OpenAIAPI(openaiApiKey);
                    response = await client1.sendMessage(prompt, selectedModel);
                } else if (selectedProvider === "testleaf") {
                    const client2 = new window.TestleafAPI(testleafApiKey);
                    response = await client2.sendMessage(prompt, selectedModel);
                } else if (selectedProvider === "groq") {
                    const client3 = new GroqAPI(groqApiKey); // ✅ now using default import
                    response = await client3.sendMessage(prompt, selectedModel);
                } else {
                    response = { content: "❌ Unsupported provider selected." };
                }
            } catch (err) {
                response = { content: `❌ Error: ${err.message}` };
            }

            showLoading(false);
            appendMessage("ai", response.content);

            // === Option 2: DOM-aware Validation (LLM Self-check + Current Screen Match) ===
            const allText = `${scenarioText} ${response.content}`.toLowerCase();
            const domKeywords = currentScreenElements.map(el => el.toLowerCase());
            const hasAnyDOMMatch = domKeywords.some(keyword => allText.includes(keyword));

            if (!hasAnyDOMMatch) {
                showToast();
            }
        }
    );
}

// Hook up event listener
generateBtn.addEventListener("click", generateScenarioCode);
