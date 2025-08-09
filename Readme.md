# 📖 AI Test Automation Code Generator - README

## Overview

This Chrome Extension provides an **AI-powered Test Automation Code Generator** with three main tabs:

1. **Configuration Tab** – Configure AI provider, model, programming language, and automation framework.
2. **Code Generator Tab** – Inspect elements on the current webpage and generate Selenium/Appium/Cypress-style Page Object Model (POM) or Cucumber Feature files.
3. **Natural Language Tests (NLP Tab)** – Convert plain English scenarios into Gherkin and test methods, with DOM element matching and selector patching.

---

## 🔽 Download & Setup

### 1. Download the Repository

bash
# Clone using git
git clone <your-repo-url>.git

# Or download ZIP from GitHub UI and extract


### 2. Open Chrome Extensions

1. Open Chrome browser.
2. Go to **chrome://extensions**.
3. Enable **Developer mode** (toggle in top-right corner).

### 3. Load the Extension

1. Click **Load unpacked**.
2. Select the extracted repo folder.
3. The extension will appear in your Chrome toolbar.

---

## ⚙️ Initial Configuration

1. Click the extension icon or open via **side panel**.
2. Navigate to **Configuration Tab**.
3. Select:

    * **AI Provider** (Groq, OpenAI, Testleaf, etc.)
    * **Model** (e.g., `o4-mini-high`, `llama-3-70b-8192`)
    * **Programming Language** (Java, Python, etc.)
    * **Automation Framework** (Selenium, Appium, Cypress)
4. Enter your **API Key** for the selected provider.
5. Save configuration.

---

## 🖱 Using the Extension

### Code Generator Tab

1. Navigate to the webpage where you want to generate automation code.
2. Use the extension to select elements (via Inspector).
3. Click **Generate** to produce code.
4. Copy or download the generated file.

### NLP Tab (Natural Language Tests)

1. Click **Refresh** to capture DOM elements from the current page.
2. Enter your test scenario in plain English.
3. Click **Generate**.
4. Select **Copy Gherkin** or **Copy Test** from the dropdown to copy the generated output.

⚠ **Note:** If your scenario includes elements not found on the current page, you will receive a toast warning:
`Please restrict yourself only to current screen shown.`

---

## 📁 Project Structure

```
project-root/
├── manifest.json               # Chrome extension manifest
├── panel.html                   # Main UI
├── src/
│   ├── content/                 # Content scripts for DOM capture
│   ├── background/              # Background scripts (service worker)
│   ├── js/                      # Core logic (prompts, API bindings)
│   └── scenario.js              # NLP Tab logic
├── assets/                      # Images & icons
└── README.md                    # This file
```

---

## 🚀 Development Tips

* **Hot Reload:** Chrome extensions require reloading via **chrome://extensions** after changes.
* **Content Scripts:** Only run on http(s) pages; won't run on `chrome://` or extension pages.
* **Quota Errors:** Free-tier APIs may have usage limits; upgrade if needed.

---

## 📌 Future Enhancements

* Test Data Generator Tab
* AI-Assisted Assertion Generator
* Download feature for NLP Tab outputs

---

## 🆘 Troubleshooting

* **No DOM elements captured:** Ensure you click **Refresh** in the NLP Tab after loading the target page.
* **API key issues:** Verify in Configuration Tab that your API key is correct.
* **429 Errors:** API quota exceeded; wait or upgrade your plan.

---

