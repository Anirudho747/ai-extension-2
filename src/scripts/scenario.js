import { getPrompt } from "./prompts.js";

// Reuse existing UI bindings
const scenarioInput = document.getElementById("scenarioInput");
const scenarioOutputType = document.getElementById("scenarioOutputType");
const generateScenarioButton = document.getElementById("generateScenario");
const refreshDomButton = document.getElementById("refreshDomButton");
const copyOutputButton = document.getElementById("copyOutput");
const copyMenu = document.getElementById("copyMenu");
const copyGherkinButton = document.getElementById("copyGherkin");
const copyTestButton = document.getElementById("copyTest");
const scenarioMessages = document.getElementById("scenarioMessages");
const scenarioToast = document.getElementById("scenarioToast");
const scenarioLoading = document.getElementById("scenarioLoading");

let lastGherkinContent = "";
let lastTestContent = "";

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

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log("✅ Copied to clipboard");
    }).catch(err => console.error("❌ Copy failed", err));
}

// 🧠 Fuzzy Selector Matching (Hybrid)
function getBestSelectorMatch(aiText, screenElementsMeta) {
    const lowerText = aiText.toLowerCase();
    for (const el of screenElementsMeta) {
        if (lowerText.includes(el.label.toLowerCase())) {
            return el.selector;
        }
    }
    return null;
}

async function refreshScreenElements() {
    chrome.runtime.sendMessage({ type: "REFRESH_SCREEN_ELEMENTS" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error refreshing screen elements:", chrome.runtime.lastError.message);
            return;
        }
        console.log("🔄 DOM refreshed:", response);
    });
}

async function generateScenarioCode() {
    const scenarioText = scenarioInput.value.trim();
    const outputType = scenarioOutputType.value;
    if (!scenarioText) return;

    scenarioMessages.innerHTML = "";
    appendMessage("user", scenarioText);
    showLoading(true);

    let screenElementsMeta = [];
    let selectedProvider, selectedModel, languageBinding, browserEngine;
    let groqApiKey, openaiApiKey, testleafApiKey;

    await new Promise((resolve) => {
        chrome.storage.sync.get([
            "selectedProvider", "selectedModel", "languageBinding", "browserEngine",
            "groqApiKey", "openaiApiKey", "testleafApiKey", "screenElementsMeta"
        ], (config) => {
            selectedProvider = config.selectedProvider;
            selectedModel = config.selectedModel;
            languageBinding = config.languageBinding || "Java";
            browserEngine = config.browserEngine || "Selenium";
            groqApiKey = config.groqApiKey;
            openaiApiKey = config.openaiApiKey;
            testleafApiKey = config.testleafApiKey;
            screenElementsMeta = config.screenElementsMeta || [];
            resolve();
        });
    });

    if (!screenElementsMeta.length) {
        console.warn("⚠️ No screen elements captured. Allowing generation.");
    }

    // Override live dropdowns if any
    languageBinding = document.getElementById("languageBinding")?.value || languageBinding;
    browserEngine = document.getElementById("browserEngine")?.value || browserEngine;

    let providerClient =
        selectedProvider === "openai" ? new window.OpenAIAPI(openaiApiKey) :
            selectedProvider === "testleaf" ? new window.TestleafAPI(testleafApiKey) :
                selectedProvider === "groq" ? new window.GroqAPI(groqApiKey) :
                    null;

    if (!providerClient) {
        showLoading(false);
        appendMessage("ai", "❌ Unsupported provider selected.");
        return;
    }

    // 1️⃣ Gherkin feature prompt
    let featureResponse;
    try {
        const elementHints = screenElementsMeta.length > 0
            ? `The following elements are visible:\n${screenElementsMeta.map((el) => `- ${el.tag} with label \"${el.label}\"`).join("\n")}`
            : "";

        const prompt1 = getPrompt("SCENARIO_FEATURE_ONLY", {
            scenario: `${scenarioText}\n\n${elementHints}\n\nOnly use elements visible on current screen.`,
        });

        featureResponse = await providerClient.sendMessage(prompt1, selectedModel);
        appendMessage("ai", featureResponse.content);
        lastGherkinContent = featureResponse.content;
    } catch (err) {
        showLoading(false);
        appendMessage("ai", `❌ Error during feature generation: ${err.message}`);
        return;
    }

    if (outputType === "gherkin") {
        copyOutputButton.disabled = false;
        showLoading(false);
        return;
    }

    // 2️⃣ Optional Test Method
    try {
        const prompt2 = getPrompt("SCENARIO_TEST_ONLY", {
            featureText: featureResponse.content,
            language: languageBinding,
            engine: browserEngine,
        });

        const testResponse = await providerClient.sendMessage(prompt2, selectedModel);
        appendMessage("ai", testResponse.content);
        lastTestContent = testResponse.content;
    } catch (err) {
        appendMessage("ai", `❌ Error during test code generation: ${err.message}`);
    }

    copyOutputButton.disabled = false;
    showLoading(false);
}

// Attach events
generateScenarioButton.addEventListener("click", generateScenarioCode);
refreshDomButton.addEventListener("click", refreshScreenElements);

copyOutputButton.addEventListener("click", () => {
    copyMenu.style.display = copyMenu.style.display === "none" ? "flex" : "none";
});

copyGherkinButton.addEventListener("click", () => {
    copyTextToClipboard(lastGherkinContent);
    copyMenu.style.display = "none";
});

copyTestButton.addEventListener("click", () => {
    copyTextToClipboard(lastTestContent);
    copyMenu.style.display = "none";
});