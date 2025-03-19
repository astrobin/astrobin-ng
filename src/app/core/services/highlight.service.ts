import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { WindowRefService } from "@core/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@core/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class HighlightService {
  private readonly _isBrowser: boolean;
  private _scriptsLoaded = false;
  private _cssLoaded = false;
  private _loadingPromise: Promise<void> | null = null;

  // List of language scripts to load
  private readonly _languages = [
    "bash",
    "coffeescript",
    "cpp",
    "csharp",
    "css",
    "diff",
    "java",
    "javascript",
    "json",
    "objectivec",
    "perl",
    "php",
    "python",
    "ruby",
    "sql",
    "vbscript",
    "xml"
  ];

  constructor(
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Checks if highlight.js needs to be loaded for a given HTML content
   * @param html The HTML content to check
   * @returns true if the content contains code blocks that need syntax highlighting
   */
  needsHighlighting(html: string): boolean {
    if (!html || typeof html !== "string") {
      return false;
    }

    // Quick check for code blocks in the HTML
    return html.includes("<pre><code") ||
      html.includes("<pre code") ||
      html.includes("<pre><code>") ||
      html.includes("<code class=") ||
      html.includes("<code>");
  }

  /**
   * Loads highlight.js and its dependencies
   * @returns A Promise that resolves when highlight.js is loaded
   */
  loadHighlightJs(): Promise<void> {
    // Return existing promise if already loading
    if (this._loadingPromise) {
      return this._loadingPromise;
    }

    // Return immediately if already loaded or not in browser
    if (this._scriptsLoaded) {
      return Promise.resolve();
    }

    if (!this._isBrowser) {
      // For SSR, just return a resolved promise to avoid errors
      // This is preferrable to rejecting which might cause issues in SSR flows
      return Promise.resolve();
    }

    // Create a new loading promise
    this._loadingPromise = new Promise<void>((resolve, reject) => {
      try {
        const win = this.windowRefService.nativeWindow as any;
        const document = this.windowRefService.nativeWindow.document;

      // Check if highlight.js is already available
      if (win.hljs && typeof win.hljs === "object") {
        this._scriptsLoaded = true;
        resolve();
        return;
      }

      // First load the CSS stylesheet
      this._loadStylesheet().then(() => {
        // Then load main highlight.js script
        const mainScript = document.createElement("script");
        mainScript.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js";
        mainScript.crossOrigin = "anonymous";
        mainScript.integrity = "sha512-EBLzUL8XLl+va/zAsmXwS7Z2B1F9HUHkZwyS/VKwh3S7T/U0nF4BaU29EP/ZSf6zgiIxYAnKLu6bJ8dqpmX5uw==";
        mainScript.referrerPolicy = "no-referrer";

        mainScript.onload = () => {
          // Load the line numbers plugin
          this._loadLineNumbersPlugin().then(() => {
            // Resolve the promise once everything is loaded
            this._scriptsLoaded = true;
            resolve();
          }).catch(error => {
            // Still resolve if line numbers plugin fails
            console.warn("Failed to load line numbers plugin:", error);
            this._scriptsLoaded = true;
            resolve();
          });
        };

        mainScript.onerror = (error) => {
          this._loadingPromise = null;
          reject("Failed to load highlight.js main script");
        };

        document.body.appendChild(mainScript);
      }).catch(error => {
        this._loadingPromise = null;
        reject("Failed to load highlight.js stylesheet");
      });
      } catch (error) {
        // Handle any unexpected errors, particularly related to DOM access during SSR
        this._loadingPromise = null;
        reject(`Error loading highlight.js: ${error}`);
      }
    });

    return this._loadingPromise;
  }

  /**
   * Highlights all code blocks in the provided element
   * @param element Element containing code blocks to highlight
   */
  highlightCodeBlocks(element: HTMLElement): void {
    if (!this._isBrowser || !this._scriptsLoaded) {
      return;
    }

    const win = this.windowRefService.nativeWindow as any;

    // Find all code blocks in the element
    const codeBlocks = element.querySelectorAll("pre code");
    if (codeBlocks.length === 0) {
      return;
    }

    // Add the BR plugin for proper line breaks handling
    const brPlugin = {
      "before:highlightBlock": ({ block }) => {
        block.innerHTML = block.innerHTML.replace(/<br[ /]*>/g, "\n");
      },
      "after:highlightBlock": ({ result }) => {
        result.value = result.value.replace(/\n/g, "<br>");
      }
    };

    // Add the plugin and highlight each code block
    win.hljs.addPlugin(brPlugin);

    // Convert NodeList to Array to avoid iterator issues in some TypeScript configurations
    Array.from(codeBlocks).forEach(codeBlock => {
      win.hljs.highlightElement(codeBlock);
    });

    // Initialize line numbers if available
    if (typeof win.hljs.initLineNumbersOnLoad === "function") {
      win.hljs.initLineNumbersOnLoad();
    }
  }

  /**
   * Loads the highlight.js CSS stylesheet
   * @returns Promise that resolves when stylesheet is loaded
   */
  private _loadStylesheet(): Promise<void> {
    // For SSR, just return a resolved promise
    if (!this._isBrowser) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        // Return immediately if CSS already loaded
        if (this._cssLoaded) {
          resolve();
          return;
        }

        const document = this.windowRefService.nativeWindow.document;

      // Check if the stylesheet is already loaded
      const existingStylesheet = document.querySelector("link[href*=\"highlight.js\"]");
      if (existingStylesheet) {
        this._cssLoaded = true;
        resolve();
        return;
      }

      // Create and append the stylesheet link
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github-dark.min.css";

      // Use media print for initial loading, then switch to all (for performance)
      link.media = "print";

      // Use load event for stylesheets
      link.onload = () => {
        // Switch to all media once loaded
        link.media = "all";
        this._cssLoaded = true;
        resolve();
      };

      link.onerror = () => reject("Failed to load highlight.js stylesheet");

      document.head.appendChild(link);
      } catch (error) {
        reject(`Error loading highlight.js stylesheet: ${error}`);
      }
    });
  }

  /**
   * Loads the line numbers plugin for highlight.js
   */
  private _loadLineNumbersPlugin(): Promise<void> {
    // For SSR, just return a resolved promise
    if (!this._isBrowser) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        const document = this.windowRefService.nativeWindow.document;
        const script = document.createElement("script");

      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.8.0/highlightjs-line-numbers.min.js";
      script.crossOrigin = "anonymous";
      script.integrity = "sha512-axd5V66bnXpNVQzm1c7u1M614TVRXXtouyWCE+eMYl8ALK8ePJEs96Xtx7VVrPBc0UraCn63U1+ARFI3ofW+aA==";
      script.referrerPolicy = "no-referrer";

      script.onload = () => resolve();
      script.onerror = (error) => reject("Failed to load line numbers plugin");

      document.body.appendChild(script);
      } catch (error) {
        reject(`Error loading line numbers plugin: ${error}`);
      }
    });
  }
}
