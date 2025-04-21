// scenario.js (Final: Two-Step Prompt Strategy)

import { getPrompt } from "./prompts.js";

// Reuse existing UI bindings
const scenarioInput = document.getElementById("scenarioInput");
const scenarioOutputType = document.getElementById("scenarioOutputType");
const generateScenarioButton = document.getElementById("generateScenario");
const scenarioMessages = document.getElementById("scenarioMessages");
const scenarioToast = document.getElementById("scenarioToast");
const scenarioLoading = document.getElementById("scenarioLoading");

function appendMessage(role, content) {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-message ${role}`;
    msgEl.innerHTML = marked.parse(content);
    scenarioMessages.appendChild(msgEl);
}

function showToast() {
    scenarioToast.style.display = "block";
    setTimeout(() => (scenarioToast.style.display = "none"), 4000);
}

function showLoading(show = true) {
    scenarioLoading.style.display = show ? "flex" : "none";
}

// 🧠 New: Fuzzy Selector Matching
function getBestSelectorMatch(aiText, screenElementsMeta) {
    const lowerText = aiText.toLowerCase();
    for (const el of screenElementsMeta) {
        if (lowerText.includes(el.label.toLowerCase())) {
            return el.selector;
        }
    }
    return null;
}

async function generateScenarioCode() {
    const scenarioText = scenarioInput.value.trim();
    const outputType = scenarioOutputType.value;
    if (!scenarioText) return;

    scenarioMessages.innerHTML = "";
    appendMessage("user", scenarioText);
    showLoading(true);

    let screenElementsMeta = [];
    // Config from storage
    let selectedProvider, selectedModel, languageBinding, browserEngine;
    let groqApiKey, openaiApiKey, testleafApiKey;

    await new Promise((resolve) => {
        chrome.storage.sync.get(
            [
                "selectedProvider",
                "selectedModel",
                "languageBinding",
                "browserEngine",
                "groqApiKey",
                "openaiApiKey",
                "testleafApiKey",
                "screenElementsMeta",
            ],
            (config) => {
                selectedProvider = config.selectedProvider;
                selectedModel = config.selectedModel;
                languageBinding = config.languageBinding || "Java";
                browserEngine = config.browserEngine || "Selenium";
                groqApiKey = config.groqApiKey;
                openaiApiKey = config.openaiApiKey;
                testleafApiKey = config.testleafApiKey;
                screenElementsMeta = config.screenElementsMeta || [];
                resolve();
            }
        );
    });

    // Override live dropdowns
    languageBinding = document.getElementById("languageBinding")?.value || languageBinding;
    browserEngine = document.getElementById("browserEngine")?.value || browserEngine;
    selectedProvider = document.getElementById("providerSelect")?.value || selectedProvider;
    selectedModel = document.getElementById("modelSelect")?.value || selectedModel;
    groqApiKey = document.getElementById("groqApiKey")?.value || groqApiKey;
    openaiApiKey = document.getElementById("openaiApiKey")?.value || openaiApiKey;
    testleafApiKey = document.getElementById("testleafApiKey")?.value || testleafApiKey;

    // 🔌 LLM bindings
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

    // 1️⃣ Gherkin prompt
    let featureResponse;
    try {
        const elementHints =
            screenElementsMeta.length > 0
                ? `The following elements are visible:\n${screenElementsMeta.map((el) => `- ${el.tag} with label "${el.label}"`).join("\n")}`
                : "";

        const prompt1 = getPrompt("SCENARIO_FEATURE_ONLY", {
            scenario: `${scenarioText}\n\n${elementHints}\n\nOnly use elements that are visible on the screen.`,
        });

        featureResponse = await providerClient.sendMessage(prompt1, selectedModel);
        appendMessage("ai", featureResponse.content);
    } catch (err) {
        showLoading(false);
        appendMessage("ai", `❌ Error during feature generation: ${err.message}`);
        return;
    }

    // 2️⃣ Optional: Generate test method
    if (outputType === "gherkin") {
        showLoading(false);
        return;
    }

    try {
        const prompt2 = getPrompt("SCENARIO_TEST_ONLY", {
            featureText: featureResponse.content,
            language: languageBinding,
            engine: browserEngine,
        });

        const testResponse = await providerClient.sendMessage(prompt2, selectedModel);

        // 🧠 Hybrid Match: Try patching selector
        let patchedCode = testResponse.content;
        let matched = false;

        for (const el of screenElementsMeta) {
            const labelLower = el.label.toLowerCase();
            const aiOutputLower = testResponse.content.toLowerCase();

            if (aiOutputLower.includes(labelLower)) {
                const byIdRegex = /By\.id\(["'][^"']+["']\)/gi;
                const byNameRegex = /By\.name\(["'][^"']+["']\)/gi;
                const byXpathRegex = /By\.xpath\(["'][^"']+["']\)/gi;

                patchedCode = patchedCode
                    .replace(byIdRegex, `By.cssSelector("${el.selector}")`)
                    .replace(byNameRegex, `By.cssSelector("${el.selector}")`)
                    .replace(byXpathRegex, `By.cssSelector("${el.selector}")`);

                matched = true;
            }
        }

        console.log("🤖 Original Test Code:", testResponse.content);
        console.log("🧠 Final Patched Code:", patchedCode);
        console.log("📋 Matched:", matched);


        appendMessage("ai", patchedCode);
        if (!matched) showToast();
    } catch (err) {
        appendMessage("ai", `❌ Error during test code generation: ${err.message}`);
    }

    showLoading(false);
}

// Attach event
generateScenarioButton.addEventListener("click", generateScenarioCode);
