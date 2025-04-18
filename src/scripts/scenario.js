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

    // ✅ Get the live values from the dropdowns directly
    const languageBinding = document.getElementById("languageBinding")?.value || "Java";
    const browserEngine = document.getElementById("browserEngine")?.value || "Selenium";
    const selectedProvider = document.getElementById("providerSelect")?.value || "openai";
    const selectedModel = document.getElementById("modelSelect")?.value || "mixtral-8x7b";
    const groqApiKey = document.getElementById("groqApiKey")?.value || "";
    const openaiApiKey = document.getElementById("openaiApiKey")?.value || "";
    const testleafApiKey = document.getElementById("testleafApiKey")?.value || "";

    const currentScreenElements = []; // Optional: enhance later if needed

    console.log("🌐 From DOM:", { languageBinding, browserEngine, selectedProvider, selectedModel });

    let providerClient =
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
        console.log("🧠 Prompt for test method:\n", prompt2);
        testResponse = await providerClient.sendMessage(prompt2, selectedModel);
        appendMessage("ai", testResponse.content);
    } catch (err) {
        appendMessage("ai", `❌ Error during test code generation: ${err.message}`);
    }

    showLoading(false);

    const allText = `${scenarioText} ${featureResponse?.content || ""} ${testResponse?.content || ""}`.toLowerCase();
    const hasAnyDOMMatch = currentScreenElements.some(keyword => allText.includes(keyword.toLowerCase()));
    if (!hasAnyDOMMatch) {
        showToast();
    }
}

generateBtn.addEventListener("click", generateScenarioCode);
