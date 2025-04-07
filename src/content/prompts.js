/**
 * Collection of default prompts for different use cases
 */
export const DEFAULT_PROMPTS = {

  /**
   * Prompt for generating Playwright test code
   * Variables:
   * - ${domContent}: The DOM content to analyze
   * - ${userAction}: The user action to perform
   * - ${pageUrl}: The page URL to navigate to
   */
  PLAYWRIGHT_CODE_GENERATION: `
    Given the following DOM structure:
    \`\`\`html
    \${domContent}
    \`\`\`

    Generate Playwright test code in TypeScript to perform the following action:
    \${userAction}

    Here is the page URL:
    \${pageUrl}

    Requirements:
    1. Use only recommended Playwright locators in this priority order:
       - Always use the HTML ids or names if they exist.
       - Do not use id as locator when it has more than a single digit number as value
       - Role-based locators (getByRole)
       - Label-based locators (getByLabel)
       - Text-based locators (getByText)
       - Test ID-based locators (getByTestId)
       - Only use other locators if the above options are not applicable.

    2. Implementation guidelines:
       - Write code using TypeScript with proper type annotations
       - Include appropriate web-first assertions to validate the action
       - Use Playwright's built-in configurations and devices when applicable
       - Store frequently used locators in variables for reuse
       - Avoid hard-coded waits - rely on auto-waiting
       - Include error handling where appropriate
       - Increase the timeout to 90 seconds
       - If scenario involves navigation to a new page, do not assert on that new page's DOM

    3. Code structure:
       - Start with necessary imports
       - Include test description
       - Break down complex actions into smaller steps
       - Use meaningful variable names
       - Follow Playwright's best practices

    4. Performance and reliability:
       - Use built-in auto-waiting
       - Use assertion timeouts rather than arbitrary sleeps
       - Consider retry logic for flaky operations
       - Consider network conditions and page load states

    Respond with only the complete code block and no other text.

    Example:
    \`\`\`typescript
    import { test, expect } from '@playwright/test';
    test('descriptive test name', async ({ page }) => {
      // Implementation
    });
    \`\`\`
  `,

  /**
   * Prompt for generating Playwright Typescript Page class ONLY
   * (No test class).
   */
  PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Playwright TypeScript Page Object Class for that DOM:
  Action to perform: \${userAction}
  URL: \${pageUrl}


  Requirements:
  1. Use only recommended Playwright locators in this priority order:
     - Always use the HTML ids or names if they exist.
     - Do not use id as locator when it has more than a single digit number as value
     - Role-based locators (getByRole)
     - Label-based locators (getByLabel)
     - Text-based locators (getByText)
     - Test ID-based locators (getByTestId)
     - Only use other locators if the above options are not applicable.

  2. Implementation guidelines:
     - Write code using TypeScript with proper type annotations
     - Include appropriate web-first assertions to validate the action
     - Use Playwright's built-in configurations and devices when applicable
     - Store frequently used locators in variables for reuse
     - Avoid hard-coded waits - rely on auto-waiting
     - Include error handling where appropriate
     - Increase the timeout to 90 seconds
     - If scenario involves navigation to a new page, do not assert on that new page's DOM

  3. Code structure:
     - Single page class
     - A constructor that accepts WebDriver
     - Use PageFactory.initElements
     - Provide only the code block, no other text 
     - Follow Playwright's best practices

  Example:
  \`\`\`typescript
 import { Page, Locator } from '@playwright/test';

export class ComponentPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Page elements and methods
}
  \`\`\`
`,

  /**
   * Prompt for generating Cypress Typescript test code
   */
  CYPRESS_TYPESCRIPT_CODE_GENERATION: `
    Given the following DOM structure:
    \`\`\`html
    \${domContent}
    \`\`\`

    Generate Cypress test code in TypeScript to perform the following action:
    \${userAction}

    Here is the page URL:
    \${pageUrl}

    Requirements:
    1. Use only recommended Cypress locators in this priority order:
       - Always use the HTML ids or names if they exist.
       - Do not use id as locator when it has more than a single digit number as value

    2. Implementation guidelines:
       - Write code using TypeScript with proper type annotations
       - Include appropriate web-first assertions to validate the action
       - Use Cypress's built-in configurations and devices when applicable
       - Store frequently used locators in variables for reuse
       - Avoid hard-coded waits - rely on auto-waiting
       - Include error handling where appropriate
       - Increase the timeout to 90 seconds
       - If scenario involves navigation to a new page, do not assert on that new page's DOM

    3. Code structure:
       - Start with necessary imports
       - Include test description
       - Break down complex actions into smaller steps
       - Use meaningful variable names
       - Follow Cypress's best practices

    4. Performance and reliability:
       - Use built-in auto-waiting
       - Use assertion timeouts rather than arbitrary sleeps
       - Consider retry logic for flaky operations
       - Consider network conditions and page load states

    Respond with only the complete code block and no other text.

    Example:
    \`\`\`typescript
    import { cy } from 'cypress';

describe('Descriptive test name', () => {
  it('should perform actions', () => {
    cy.session('session-name', () => {
      // Implementation using Cypress commands, e.g.:
      // cy.visit('url')
      // cy.get('selector').click()
    });
  });
});
    \`\`\`
  `,

  /**
   * Prompt for generating Cypress Typescript Page class ONLY
   * (No test class).
   */
  CYPRESS_TYPESCRIPT_PAGE_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Cypress TypeScript Page Object Class for that DOM:
  Action to perform: \${userAction}
  URL: \${pageUrl}


  Requirements:
  1. Use only recommended Cypress locators in this priority order:
     - Always use the HTML ids or names if they exist.
     - Do not use id as locator when it has more than a single digit number as value
     
  2. Implementation guidelines:
     - Write code using TypeScript with proper type annotations
     - Include appropriate web-first assertions to validate the action
     - Use Cypress's built-in configurations and devices when applicable
     - Store frequently used locators in variables for reuse
     - Avoid hard-coded waits - rely on auto-waiting
     - Include error handling where appropriate
     - Increase the timeout to 90 seconds
     - If scenario involves navigation to a new page, do not assert on that new page's DOM

  3. Code structure:
     - Single page class
     - A constructor that accepts WebDriver
     - Use PageFactory.initElements
     - Provide only the code block, no other text 
     - Follow Cypress's best practices

  Example:
  \`\`\`typescript
 import { cy } from 'cypress';

export class ComponentPage {
  private readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

    // Page elements and methods
    
}
  \`\`\`
`,

  /**
   * Prompt for generating WebdriverIO Typescript test code
   */
  WEBDRIVERIO_TYPESCRIPT_CODE_GENERATION: `
    Given the following DOM structure:
    \`\`\`html
    \${domContent}
    \`\`\`

    Generate WebdriverIO test code in TypeScript to perform the following action:
    \${userAction}

    Here is the page URL:
    \${pageUrl}

    Requirements:
    1. Use only recommended WebdriverIO locators in this priority order:
       - Always use the HTML ids or names if they exist.
       - Do not use id as locator when it has more than a single digit number as value

    2. Implementation guidelines:
       - Write code using TypeScript with proper type annotations
       - Include appropriate web-first assertions to validate the action
       - Use Cypress's built-in configurations and devices when applicable
       - Store frequently used locators in variables for reuse
       - Avoid hard-coded waits - rely on auto-waiting
       - Include error handling where appropriate
       - Increase the timeout to 90 seconds
       - If scenario involves navigation to a new page, do not assert on that new page's DOM

    3. Code structure:
       - Start with necessary imports
       - Include test description
       - Break down complex actions into smaller steps
       - Use meaningful variable names
       - Follow WebdriverIO's best practices

    4. Performance and reliability:
       - Use built-in auto-waiting
       - Use assertion timeouts rather than arbitrary sleeps
       - Consider retry logic for flaky operations
       - Consider network conditions and page load states

    Respond with only the complete code block and no other text.

    Example:
    \`\`\`typescript
    import { browser } from 'webdriverio';

  describe('Descriptive test name', () => {
  it('should perform actions', async () => {
    await browser.newSession();
    await browser.url('https://example.com');
    const element = await browser.$('#myButton');
    await element.click();
    await browser.deleteSession();
  });
});
    \`\`\`
  `,

  /**
   * Prompt for generating WebdriverIO Typescript Page class ONLY
   * (No test class).
   */
  WEBDRIVERIO_TYPESCRIPT_PAGE_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a WebdriverIO TypeScript Page Object Class for that DOM:
  Action to perform: \${userAction}
  URL: \${pageUrl}


  Requirements:
  1. Use only recommended WebdriverIO locators in this priority order:
     - Always use the HTML ids or names if they exist.
     - Do not use id as locator when it has more than a single digit number as value
     
  2. Implementation guidelines:
     - Write code using TypeScript with proper type annotations
     - Include appropriate web-first assertions to validate the action
     - Use WebdriverIO's built-in configurations and devices when applicable
     - Store frequently used locators in variables for reuse
     - Avoid hard-coded waits - rely on auto-waiting
     - Include error handling where appropriate
     - Increase the timeout to 90 seconds
     - If scenario involves navigation to a new page, do not assert on that new page's DOM

  3. Code structure:
     - Single page class
     - A constructor that accepts WebDriver
     - Use PageFactory.initElements
     - Provide only the code block, no other text 
     - Follow WebdrivberIO's best practices

  Example:
  \`\`\`typescript
 import { remote } from 'webdriverio';

describe('Component page', () => {
  let componentPage: ComponentPage;

  before(async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    });
    componentPage = new ComponentPage('https://example.com', browser);
  });

  it('should navigate to page', async () => {
    await componentPage.navigateToPage();
  });

  it('should click element', async () => {
    await componentPage.clickElement('#myButton');
  });
});
  \`\`\`
`,

  /**
   * Prompt for generating Selenium Java test code ONLY
   * (No page object class at all).
   */
  SELENIUM_JAVA_TEST_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Selenium Java TEST CLASS using TestNG (no page object class).
  Action to perform: \${userAction}
  URL: \${pageUrl}

  Requirements:
  1. Use recommended Selenium locator strategies in priority:
     - The elements found using locators should be either one of these tags only : input, button, select, a, div
     - By.id (only if the id doesn’t contain multiple digits like "ext-gen623")
     - By.name
     - By.linkText or partialLinkText for links
     - By.cssSelector (avoid using any attribute containing "genai")
     - By.xpath only if others aren’t suitable
  2. Implementation guidelines:
     - Java 8+ features if appropriate
     - Use TestNG for assertions
     - Use explicit waits (ExpectedConditions)
     - Add JavaDoc for methods
     - Use Javafaker for generating test data
     - No new page object class is needed—pretend we already have it.
     - DO NOT show the PageFactory or any page class reference

  3. Code structure:
     - Show only a single test class
     - @BeforeMethod, @Test, and @AfterMethod
     - Use meaningful method names
     - Use properties file for config if you want
     - Provide only the test class code block, no other text

  Example:
  \`\`\`java
  package com.genai.tests;

  import org.openqa.selenium.WebDriver;
  import org.openqa.selenium.chrome.ChromeDriver;
  import org.openqa.selenium.support.ui.WebDriverWait;
  import org.testng.annotations.*;
  import com.github.javafaker.Faker;
  import java.time.Duration;

  public class ComponentTest {
      private WebDriver driver;
      private WebDriverWait wait;
      private Faker faker;

      @BeforeMethod
      public void setUp() {
          driver = new ChromeDriver();
          wait = new WebDriverWait(driver, Duration.ofSeconds(10));
          faker = new Faker();
          driver.manage().window().maximize();
          driver.get("\${pageUrl}");
      }

      @Test
      public void testComponentAction() {
          // Implementation
      }

      @AfterMethod
      public void tearDown() {
          if (driver != null) {
              driver.quit();
          }
      }
  }
  \`\`\`
`,

  /**
   * Prompt for generating Selenium Java Page class ONLY
   * (No test class).
   */
  SELENIUM_JAVA_PAGE_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Selenium Java PAGE OBJECT CLASS for that DOM.
  Action to perform: \${userAction}
  URL: \${pageUrl}

  Requirements:
  1. Use recommended Selenium locator strategies in priority:
     - By.id (avoid if the id has more than a single number)
     - By.name
     - By.linkText or partialLinkText for links
     - By.xpath (use relative or following or preceding based on best case)
     - By.cssSelector (avoid "genai" attributes) only if others aren’t suitable

  2. Implementation guidelines:
     - Java 8+ features if appropriate
     - Use explicit waits (ExpectedConditions)
     - Add JavaDoc for methods & class
     - Use Javafaker if needed
     - DO NOT provide any TestNG test class—only the page class
     - Use PageFactory & @FindBy to show how elements are found

  3. Code structure:
     - Single page class
     - A constructor that accepts WebDriver
     - Use PageFactory.initElements
     - Provide only the code block, no other text

  Example:
  \`\`\`java
  package com.genai.pages;

  import org.openqa.selenium.WebDriver;
  import org.openqa.selenium.support.FindBy;
  import org.openqa.selenium.support.PageFactory;
  import org.openqa.selenium.support.ui.WebDriverWait;
  import java.time.Duration;

  public class ComponentPage {
      private final WebDriver driver;
      private final WebDriverWait wait;

      public ComponentPage(WebDriver driver) {
          this.driver = driver;
          this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
          PageFactory.initElements(driver, this);
      }

      // Page elements and methods
  }
  \`\`\`
`,

  /**
   * Prompt for generating Selenium Python test code ONLY
   * (No page object class at all).
   */
  SELENIUM_PYTHON_TEST_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Selenium Python TEST CLASS using TestNG (no page object class).
  Action to perform: \${userAction}
  URL: \${pageUrl}

  Requirements:
  1. Use recommended Selenium locator strategies in priority:
     - The elements found using locators should be either one of these tags only : input, button, select, a, div
     - By.id (only if the id doesn’t contain multiple digits like "ext-gen623")
     - By.name
     - By.linkText or partialLinkText for links
     - By.cssSelector (avoid using any attribute containing "genai")
     - By.xpath only if others aren’t suitable
  2. Implementation guidelines:
     - Use most commonly used Python features
     - Use TestNG for assertions
     - Use explicit waits (ExpectedConditions)
     - Use Javafaker for generating test data
     - No new page object class is needed—pretend we already have it.
     - DO NOT show the PageFactory or any page class reference

  3. Code structure:
     - Show only a single test class
     - @BeforeMethod, @Test, and @AfterMethod
     - Use meaningful method names
     - Use properties file for config if you want
     - Provide only the test class code block, no other text

  Example:
  \`\`\`python
    import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from faker import Faker
from selenium.common.exceptions import WebDriverException

class BaseTest(unittest.TestCase):
    base_url = "https://example.com"
    driver = None

    def setUp(self):
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.wait = WebDriverWait(self.driver, 10)
        self.faker = Faker()
        self.driver.maximize_window()
        self.driver.get(self.base_url)

    def test_component_action(self):
        # Implementation
        pass

    def tearDown(self):
        if self.driver:
            self.driver.quit()

if __name__ == '__main__':
    unittest.main()
  \`\`\`
`,

  /**
   * Prompt for generating Selenium Python Page class ONLY
   * (No test class).
   */
  SELENIUM_PYTHON_PAGE_ONLY: `
  Given the following DOM structure:
  \`\`\`html
  \${domContent}
  \`\`\`

  We want ONLY a Selenium Python PAGE OBJECT CLASS for that DOM.
  Action to perform: \${userAction}
  URL: \${pageUrl}

  Requirements:
  1. Use recommended Selenium locator strategies in priority:
     - By.id (avoid if the id has more than a single number)
     - By.name
     - By.linkText or partialLinkText for links
     - By.xpath (use relative or following or preceding based on best case)
     - By.cssSelector (avoid "genai" attributes) only if others aren’t suitable

  2. Implementation guidelines:
     - Use most common Python features and methods
     - Use explicit waits (ExpectedConditions)
     - Use Javafaker if needed
     - DO NOT provide any TestNG test class—only the page class
     - Use PageFactory & @FindBy to show how elements are found

  3. Code structure:
     - Single page class
     - A constructor that accepts WebDriver
     - Use PageFactory.initElements
     - Provide only the code block, no other text

  Example:
  \`\`\`python
  from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

class ComponentPage:
    LOCATORS = {
        "element": (By.XPATH, "//xpath/to/element"),
        # Add more elements here
    }

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.init_elements()

    def init_elements(self):
        for attr_name, locator in self.LOCATORS.items():
            setattr(self, attr_name, self.driver.find_element(*locator))

    # Page elements and methods
  \`\`\`
`,

  /**
   * Prompt for generating Cucumber Feature file
   */
  CUCUMBER_ONLY: `
    Given the following DOM structure:
    \`\`\`html
    \${domContent}
    \`\`\`

    We want a **Cucumber (Gherkin) .feature file** referencing **every relevant field** in the DOM snippet.

    **Instructions**:
    1. **Do not** include any explanations or extra text beyond the .feature content.
    2. **Identify** each relevant element (input, textarea, select, button, etc.).
    3. For each element, **create one step** referencing a placeholder (e.g. \`<fieldName>\`):
      - e.g. "When I type <companyName> into the 'Company Name' field"
      - e.g. "And I choose <state> in the 'State' dropdown"
      - e.g. "And I click the 'Create Lead' button"
    4. Use a **Scenario Outline** + **Examples** to parametrize these placeholders.
    5. **Ensure one action per step**.
    6. Output **only** valid Gherkin in a single \`\`\`gherkin code block.

    Produce **only** the .feature content as below :
    \`\`\`gherkin
    Feature: Describe your feature
      As a user of the system
      I want to \${userAction}
      So that <some reason>

      Scenario Outline: A scenario describing \${userAction}
        Given I open "\${pageUrl}"
        # For each input, select, button in the snippet:
        #   - create a single step referencing it with a placeholder
        #   - e.g. "When I enter <companyName> in the 'Company Name' field"
        #   - e.g. "And I click the 'Create Lead' button"
        #   - etc.
        # ...
        Then I should see <some expected outcome>

      # Provide a minimal Examples table with columns for each placeholder:
      Examples:
        | companyName   | firstName   | lastName   | description   | generalCity   | state   |
        | "Acme Corp"   | "Alice"     | "Tester"   | "Some text"   | "Dallas"      | "TX"    |
        | "Mega Corp"   | "Bob"       | "Sample"   | "Other desc"  | "Miami"       | "FL"    |
    \`\`\`
    `,

};



/**
 * Helper function to escape code blocks in prompts
 */
function escapeCodeBlocks(text) {
  return text.replace(/```/g, '\\`\\`\\`');
}

/**
 * Function to fill template variables in a prompt
 */
export function getPrompt(promptKey, variables = {}) {
  let prompt = DEFAULT_PROMPTS[promptKey];
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptKey}`);
  }

  // Replace all variables in the prompt
  Object.entries(variables).forEach(([k, v]) => {
    const regex = new RegExp(`\\\${${k}}`, 'g');
    prompt = prompt.replace(regex, v);
  });

  return prompt.trim();
}

export const CODE_GENERATOR_TYPES = {
  PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY: 'Playwright-TS-Page-Generator',
  PLAYWRIGHT_CODE_GENERATION: 'Playwright-TS-Code-Generator',
  CYPRESS_TYPESCRIPT_CODE_GENERATION: 'Cypress-TS-Page-Generator',
  CYPRESS_TYPESCRIPT_PAGE_ONLY: 'Cypress-TS-Code-Generator',
  SELENIUM_JAVA_PAGE_ONLY: 'Selenium-Java-Page-Only',
  SELENIUM_JAVA_TEST_ONLY: 'Selenium-Java-Test-Only',
  SELENIUM_PYTHON_TEST_ONLY: 'Selenium-Python-Test-Only',
  SELENIUM_PYTHON_PAGE_ONLY: 'Selenium-Python-Page-Only',
  WEBDRIVERIO_TYPESCRIPT_CODE_GENERATION: 'WebdriverIO-TS-Page-Generator',
  WEBDRIVERIO_TYPESCRIPT_PAGE_ONLY: 'WebdriverIO-TS-Code-Generator',
  CUCUMBER_ONLY: 'Cucumber-Only'
};