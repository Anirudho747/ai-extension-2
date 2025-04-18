// scenario.js (Final: Two-Step Prompt Strategy)

import { getPrompt } from "./prompts.js";

// No need to import Groq/OpenAI/Testleaf directly — using window globals

const scenarioInput = document.getElementById("scenarioInput");
const scenarioOutputType = document.getElementById("scenarioOutputType");
const generateBtn = document.getElementById("generateScenario");
const scenarioMessages = document.getElementById("scenarioMessages");
const scenarioLoading = document.getElementById("scenarioLoading");
const scenarioToast = document.getElementById("scenarioToast");

function appendMessage(role, content) {
    const message = document.createElement("div");
    message.className = role === "user" ? "user-message" : "ai-message";
    message.innerHTML = marked.parse(content);
    scenarioMessages.appendChild(message);
    scenarioMessages.scrollTop = scenarioMessages.scrollHeight;
}

function showToast() {
    scenarioToast.style.display = "block";
    setTimeout(() => {
        scenarioToast.style.display = "none";
    }, 5000);
}

function showLoading(show) {
    scenarioLoading.style.display = show ? "block" : "none";
}

async function generateScenarioCode() {
    const scenarioText = scenarioInput.value.trim();
    const outputType = scenarioOutputType.value;
    if (!scenarioText) return;

    scenarioMessages.innerHTML = "";
    appendMessage("user", scenarioText);
    showLoading(true);

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

            const providerClient =
                selectedProvider === "openai"
                    ? new window.OpenAIAPI(openaiApiKey)
                    : selectedProvider === "testleaf"
                        ? new window.TestleafAPI(testleafApiKey)
                        : selectedProvider === "groq"
                            ? new window.GroqAPI(groqApiKey)
                            : null;

            if (!providerClient) {
                showLoading(false);
                appendMessage("ai", "❌ Unsupported provider selected.");
                return;
            }

            let featureResponse;
            try {
                const prompt1 = getPrompt("SCENARIO_FEATURE_ONLY", {
                    scenario: scenarioText
                });
                featureResponse = await providerClient.sendMessage(prompt1, selectedModel);
                appendMessage("ai", featureResponse.content);
            } catch (err) {
                showLoading(false);
                appendMessage("ai", `❌ Error during feature generation: ${err.message}`);
                return;
            }

            // Stop if user selected only Gherkin
            if (outputType === "gherkin") {
                showLoading(false);
                return;
            }

            let testResponse;
            try {
                const prompt2 = getPrompt("SCENARIO_TEST_ONLY", {
                    featureText: featureResponse.content,
                    language: languageBinding,
                    engine: browserEngine
                });
                testResponse = await providerClient.sendMessage(prompt2, selectedModel);
                appendMessage("ai", testResponse.content);
            } catch (err) {
                appendMessage("ai", `❌ Error during test code generation: ${err.message}`);
            }

            showLoading(false);

            const allText = `${scenarioText} ${featureResponse?.content || ""} ${testResponse?.content || ""}`.toLowerCase();
            const domKeywords = currentScreenElements.map(el => el.toLowerCase());
            const hasAnyDOMMatch = domKeywords.some(keyword => allText.includes(keyword));
            if (!hasAnyDOMMatch) {
                showToast();
            }
        }
    );
}

generateBtn.addEventListener("click", generateScenarioCode);
