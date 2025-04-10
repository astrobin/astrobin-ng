import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import type { Renderer2 } from "@angular/core";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type { AbstractControl } from "@angular/forms";
import { AuthService } from "@core/services/auth.service";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { environment } from "@env/environment";
import { of } from "rxjs";
import { catchError, map } from "rxjs/operators";

declare const CKEDITOR: any;

@Injectable({
  providedIn: "root"
})
export class CKEditorService extends BaseService {
  private _loaded = false;
  private readonly _isBrowser: boolean;
  private _retryCount = 0;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService,
    public readonly windowRefService: WindowRefService,
    public readonly http: HttpClient,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) private platformId: unknown
  ) {
    super(loadingService);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  setupBBCodeFilter(renderer: Renderer2) {
    // Safety check for SSR
    if (!this._isBrowser || typeof CKEDITOR === "undefined" || !CKEDITOR.htmlParser) {
      console.warn("CKEDITOR not available for setupBBCodeFilter");
      return {}; // Return an empty object that won't break things
    }

    const bbcodeFilter = new CKEDITOR.htmlParser.filter();

    bbcodeFilter.addRules({
      elements: {
        p: element => {
          element.replaceWithChildren();
          element.add(new CKEDITOR.htmlParser.text("\n\n"));
        },
        blockquote: element => {
          const quoted = new CKEDITOR.htmlParser.element("div");
          quoted.children = element.children;
          element.children = [quoted];
          const citeText = element.attributes.cite;
          if (citeText) {
            const cite = new CKEDITOR.htmlParser.element("cite");
            cite.add(new CKEDITOR.htmlParser.text(citeText.replace(/^"|"$/g, "")));
            delete element.attributes.cite;
            element.children.unshift(cite);
          }
        },
        span: element => {
          let bbcode;
          if ((bbcode = element.attributes.bbcode)) {
            if (bbcode === "img") {
              element.name = "img";
              element.attributes.src = element.children[0].value;
              element.children = [];
            } else if (bbcode === "email") {
              element.name = "a";
              element.attributes.href = "mailto:" + element.children[0].value;
            }
          } else if (element.attributes.style && element.attributes.style.includes("font-size:")) {
            // Handle percentage-based font size
            const sizeMatch = element.attributes.style.match(/font-size:(\d+)%/);
            if (sizeMatch) {
              const size = parseInt(sizeMatch[1], 10);
              let remSize;

              // Use the same three-tier system
              if (size <= 50) {
                remSize = ".5rem";
              } else if (size <= 75) {
                remSize = ".75rem";
              } else if (size <= 100) {
                remSize = "1rem";
              } else if (size <= 150) {
                remSize = "1.5rem";
              } else {
                remSize = "2rem";
              }

              // Replace the percentage-based style with rem-based
              element.attributes.style = `font-size: ${remSize}`;
            }
          }
        },
        ol: element => {
          if (element.attributes.listType) {
            if (element.attributes.listType !== "decimal") {
              element.attributes.style = "list-style-type:" + element.attributes.listType;
            }
          } else {
            element.name = "ul";
          }
          delete element.attributes.listType;
        },
        a: element => {
          if (!element.attributes.href) {
            element.attributes.href = element.children[0].value;
          }
        },
        smiley: element => {
          element.name = "img";
          const editorConfig = this.options(null);
          const description = element.attributes.desc;
          const image =
            editorConfig.smiley_images[CKEDITOR.tools.indexOf(editorConfig.smiley_descriptions, description)];
          const src = CKEDITOR.tools.htmlEncode(editorConfig.smiley_path + image);

          element.attributes = {
            src,
            "data-cke-saved-src": src,
            class: "smiley",
            title: description,
            alt: description
          };
        },
        img: element => {
          if (!renderer) {
            return;
          }

          const src: string = element.attributes.src;
          const placeholderSrc = "/assets/images/loading.gif";

          if (src && src.indexOf("/ckeditor-files/") > 0) {
            element.attributes.src = placeholderSrc;

            const fileName = "f" + src.split("/").pop().split(".")[0].replace(/-/gi, "");
            element.attributes.class = `loading ${fileName}`;

            this._fetchThumbnail(src, thumbnailSrc => {
              setTimeout(() => {
                const imgElement = this.windowRefService.nativeWindow.document.querySelector(`img.${fileName}`);
                if (imgElement) {
                  renderer.setAttribute(imgElement, "src", thumbnailSrc);
                  renderer.setAttribute(imgElement, "data-src", src);
                  renderer.removeClass(imgElement, "loading");
                  renderer.removeClass(imgElement, `${fileName}`);
                }
              });
            });
          }
        }
      }
    });

    return bbcodeFilter;
  }

  plugins(): string[] {
    return [
      "ajax",
      "autocomplete",
      "autogrow",
      "autolink",
      "basicstyles",
      "bbcode",
      "blockquote",
      "button",
      "clipboard",
      "codesnippet",
      "dialog",
      "dialogui",
      "divarea",
      "editorplaceholder",
      "enterkey",
      "entities",
      "fakeobjects",
      "filebrowser",
      "filetools",
      "floatpanel",
      "floatingspace",
      "font",
      "help",
      "indent",
      "indentlist",
      "lineutils",
      "link",
      "list",
      "magicline",
      "maximize",
      "mentions",
      "menu",
      "notification",
      "notificationaggregator",
      "panel",
      "pastefromgdocs",
      "pastetools",
      "popup",
      "SimpleLink",
      "simpleuploads",
      "smiley",
      "sourcedialog",
      "specialchar",
      "table",
      "textmatch",
      "textwatcher",
      "toolbar",
      "undo",
      "uploadwidget",
      "widget",
      "widgetselection",
      "xml"
    ];
  }

  toolbar(): any {
    return [
      {
        name: "help",
        items: ["HelpButton"]
      },
      {
        name: "document",
        items: ["Sourcedialog", "Maximize"]
      },
      {
        name: "clipboard",
        items: ["Cut", "Copy", "Paste", "Undo", "Redo"]
      },
      {
        name: "basicstyles",
        items: ["FontSize", "Bold", "Italic", "Underline", "Strike", "RemoveFormat"]
      },
      {
        name: "paragraph",
        items: ["NumberedList", "BulletedList", "Blockquote"]
      },
      {
        name: "links",
        items: ["SimpleLink", "Unlink"]
      },
      {
        name: "insert",
        items: ["addFile", "addImage", "CodeSnippet"]
      },
      {
        name: "special",
        items: ["SpecialChar", "Smiley"]
      }
    ];
  }

  mentions(): any {
    return [
      {
        feed: `${
          environment.classicBaseUrl
        }/autocomplete_usernames/?q={encodedQuery}&token=${this.authService.getClassicApiToken()}`,
        marker: "@",
        pattern: new RegExp("@[_a-zA-Z0-9À-ž ]{2,}"),
        itemTemplate: `<li data-id="{id}">
              <img class="avatar" width="40" height="40" src="${environment.cdnUrl}{avatar}" />
              <strong class="realname">{realName}</strong><span class="username">({username})</span>
             </li>`,
        outputTemplate: `<a href="${environment.classicBaseUrl}/users/{username}/">@{displayName}</a><span>&nbsp;</span>`
      },
      {
        feed: `${
          environment.classicBaseUrl
        }/autocomplete_images/?q={encodedQuery}&token=${this.authService.getClassicApiToken()}`,
        marker: "#",
        pattern: new RegExp("#[_a-zA-Z0-9À-ž ]{0,}"),
        itemTemplate: `<li data-id="{id}">
              <img class="image" width="40" height="40" src="{thumbnail}" />
              <span class="title">{title}</span>
            </li>`,
        outputTemplate: `<br/><a href="${environment.classicBaseUrl}{url}">
              <img src="{thumbnail}"/>
              <br/>
              {title}
            </a><br/>`
      }
    ];
  }

  smileyDescriptions(): string[] {
    return [
      "angel",
      "angry-1",
      "angry",
      "arrogant",
      "bored",
      "confused",
      "cool-1",
      "cool",
      "crying-1",
      "crying-2",
      "crying",
      "cute",
      "embarrassed",
      "emoji",
      "greed",
      "happy-1",
      "happy-2",
      "happy-3",
      "happy-4",
      "happy-5",
      "happy-6",
      "happy-7",
      "happy",
      "in-love",
      "kiss-1",
      "kiss",
      "laughing-1",
      "laughing-2",
      "laughing",
      "muted",
      "nerd",
      "sad-1",
      "sad-2",
      "sad",
      "scare",
      "serious",
      "shocked",
      "sick",
      "sleepy",
      "smart",
      "surprised-1",
      "surprised-2",
      "surprised-3",
      "surprised-4",
      "surprised",
      "suspicious",
      "tongue",
      "vain",
      "wink-1",
      "wink"
    ];
  }

  smileyImages(): string[] {
    return [
      "angel.png",
      "angry-1.png",
      "angry.png",
      "arrogant.png",
      "bored.png",
      "confused.png",
      "cool-1.png",
      "cool.png",
      "crying-1.png",
      "crying-2.png",
      "crying.png",
      "cute.png",
      "embarrassed.png",
      "emoji.png",
      "greed.png",
      "happy-1.png",
      "happy-2.png",
      "happy-3.png",
      "happy-4.png",
      "happy-5.png",
      "happy-6.png",
      "happy-7.png",
      "happy.png",
      "in-love.png",
      "kiss-1.png",
      "kiss.png",
      "laughing-1.png",
      "laughing-2.png",
      "laughing.png",
      "muted.png",
      "nerd.png",
      "sad-1.png",
      "sad-2.png",
      "sad.png",
      "scare.png",
      "serious.png",
      "shocked.png",
      "sick.png",
      "sleepy.png",
      "smart.png",
      "surprised-1.png",
      "surprised-2.png",
      "surprised-3.png",
      "surprised-4.png",
      "surprised.png",
      "suspicious.png",
      "tongue.png",
      "vain.png",
      "wink-1.png",
      "wink.png"
    ];
  }

  specialChars(): string[] {
    return [
      "!",
      "&quot;",
      "#",
      "$",
      "%",
      "&amp;",
      "'",
      "(",
      ")",
      "*",
      "+",
      "-",
      ".",
      "/",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ":",
      ";",
      "&lt;",
      "=",
      "&gt;",
      "?",
      "@",
      "[",
      "]",
      "^",
      "_",
      "`",
      "{",
      "|",
      "}",
      "~",
      "&euro;",
      "&lsquo;",
      "&rsquo;",
      "&ldquo;",
      "&rdquo;",
      "&ndash;",
      "&mdash;",
      "&iexcl;",
      "&cent;",
      "&pound;",
      "&curren;",
      "&yen;",
      "&brvbar;",
      "&sect;",
      "&uml;",
      "&copy;",
      "&ordf;",
      "&laquo;",
      "&not;",
      "&reg;",
      "&macr;",
      "&deg;",
      "&sup2;",
      "&sup3;",
      "&acute;",
      "&micro;",
      "&para;",
      "&middot;",
      "&cedil;",
      "&sup1;",
      "&ordm;",
      "&raquo;",
      "&frac14;",
      "&frac12;",
      "&frac34;",
      "&iquest;",
      "&Agrave;",
      "&Aacute;",
      "&Acirc;",
      "&Atilde;",
      "&Auml;",
      "&Aring;",
      "&AElig;",
      "&Ccedil;",
      "&Egrave;",
      "&Eacute;",
      "&Ecirc;",
      "&Euml;",
      "&Igrave;",
      "&Iacute;",
      "&Icirc;",
      "&Iuml;",
      "&ETH;",
      "&Ntilde;",
      "&Ograve;",
      "&Oacute;",
      "&Ocirc;",
      "&Otilde;",
      "&Ouml;",
      "&times;",
      "&Oslash;",
      "&Ugrave;",
      "&Uacute;",
      "&Ucirc;",
      "&Uuml;",
      "&Yacute;",
      "&THORN;",
      "&alpha;",
      "&szlig;",
      "&agrave;",
      "&aacute;",
      "&acirc;",
      "&atilde;",
      "&auml;",
      "&aring;",
      "&aelig;",
      "&ccedil;",
      "&egrave;",
      "&eacute;",
      "&ecirc;",
      "&euml;",
      "&igrave;",
      "&iacute;",
      "&icirc;",
      "&iuml;",
      "&eth;",
      "&ntilde;",
      "&ograve;",
      "&oacute;",
      "&ocirc;",
      "&otilde;",
      "&ouml;",
      "&divide;",
      "&oslash;",
      "&ugrave;",
      "&uacute;",
      "&ucirc;",
      "&uuml;",
      "&yacute;",
      "&thorn;",
      "&yuml;",
      "&OElig;",
      "&oelig;",
      "&#372;",
      "&#374",
      "&#373",
      "&#375;",
      "&sbquo;",
      "&#8219;",
      "&bdquo;",
      "&hellip;",
      "&trade;",
      "&#9658;",
      "&bull;",
      "&rarr;",
      "&rArr;",
      "&hArr;",
      "&diams;",
      "&asymp;"
    ];
  }

  options(formControl: AbstractControl): any {
    const onChange = editor => {
      editor.updateElement();

      if (formControl) {
        formControl.setValue(editor.getData());
        formControl.updateValueAndValidity();
        formControl.markAsTouched();
        formControl.markAsDirty();
      }
    };

    return {
      skin: "minimalist",
      language: "en",
      disableNativeSpellChecker: false,
      disableObjectResizing: true,
      extraPlugins: this.plugins().join(","),
      toolbar: this.toolbar(),
      filebrowserUploadUrl: `${environment.classicBaseUrl}/json-api/common/ckeditor-upload/`,
      mentions: this.mentions(),
      smiley_columns: 10,
      smiley_path: "https://cdn.astrobin.com/static/astrobin/emoticons/",
      smiley_descriptions: this.smileyDescriptions(),
      smiley_images: this.smileyImages(),
      specialChars: this.specialChars(),
      fontSize_sizes: "XS/50%;S/75%;M/100%;L/150%;XL/200%",
      autoGrow_minHeight: 300,
      autoGrow_maxHeight: 1200,
      autoGrow_onStartup: true,
      autoGrow_bottomSpace: 50,
      codeSnippet_languages: {
        bash: "Bash",
        coffeescript: "CoffeeScript",
        cpp: "C++",
        cs: "C#",
        css: "CSS",
        diff: "Diff",
        html: "HTML",
        java: "Java",
        javascript: "JavaScript",
        json: "JSON",
        objectivec: "Objective-C",
        perl: "Perl",
        php: "PHP",
        python: "Python",
        ruby: "Ruby",
        sql: "SQL",
        vbscript: "VBScript",
        xhtml: "XHTML",
        xml: "XML"
      },
      on: {
        change() {
          onChange(this);
        },
        "simpleuploads.startUpload": () => {
          this.loadingService.setLoading(true);
        },
        "simpleuploads.finishedUpload": function () {
          onChange(this);
          this.loadingService.setLoading(false);
        }.bind(this),
        beforeCommandExec(event) {
          // Show the paste dialog for the paste buttons and right-click paste
          if (event.data.name === "paste") {
            event.editor._.forcePasteDialog = true;
          }

          // Don't show the paste dialog for Ctrl+Shift+V
          if (event.data.name === "pastetext" && event.data.commandData.from === "keystrokeHandler") {
            event.cancel();
          }
        }
      }
    };
  }

  loadCKEditor(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Reset retry counter at the start of a new load attempt
      this._retryCount = 0;

      if (this._loaded) {
        resolve();
        return;
      }

      if (!this._isBrowser) {
        reject("CKEditor not available in server-side rendering");
        return;
      }

      const document = this.windowRefService.nativeWindow.document;
      const win = this.windowRefService.nativeWindow as any;
      const timestamp = environment.ckeditorTimestamp;
      const baseUrl = `${environment.cdnUrl}/static/astrobin/ckeditor`;

      // Check if CKEditor is already fully initialized and available
      if (this._isCKEditorReady(win)) {
        win.CKEDITOR.timestamp = timestamp;
        this._loaded = true;
        resolve();
        return;
      }

      // Set base path for CKEditor
      win.CKEDITOR_BASEPATH = `${baseUrl}/`;

      // Function to load CKEditor once document is ready
      const loadCKEditorScript = () => {
        // Load main CKEditor script first
        const mainScript = document.createElement("script");
        mainScript.src = `${baseUrl}/ckeditor.js?t=${timestamp}`;

        mainScript.onload = () => {
          // Start checking if CKEditor is initialized - the _waitForCKEditorCore method
          // will retry with backoff until it's ready or max retries are reached
          this._waitForCKEditorCore(win, baseUrl, timestamp, resolve, reject);
        };

        mainScript.onerror = error => {
          console.error("Error loading CKEditor main script:", error);
          reject("Failed to load CKEditor main script");
        };

        document.body.appendChild(mainScript);
      };

      // Wait for document to be in 'complete' state before loading CKEditor
      if (document.readyState === "complete") {
        loadCKEditorScript();
      } else {
        win.addEventListener("load", loadCKEditorScript);
      }
    });
  }

  private _isCKEditorReady(win: any): boolean {
    // Basic availability of core CKEditor functionality
    const coreAvailable =
      win.CKEDITOR && typeof win.CKEDITOR.replace === "function" && typeof win.CKEDITOR.getUrl === "function";

    // Check if dom elements are available
    const domAvailable = coreAvailable && win.CKEDITOR.dom && win.CKEDITOR.dom.element;

    return coreAvailable && domAvailable;
  }

  private _waitForCKEditorCore(
    win: any,
    baseUrl: string,
    timestamp: string,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    retryCount: number = 0
  ): void {
    // Check if CKEDITOR is fully ready with all necessary functionality
    const isCoreReady = this._isCKEditorReady(win);

    if (isCoreReady) {
      console.log("CKEditor core fully initialized");
      // Now that core is ready, we can safely load the BBCode plugin
      this._loadBBCodePlugin(baseUrl, timestamp, resolve, reject);
      return;
    }

    // If we've already retried many times, log more detailed info
    if (retryCount > 5) {
      console.warn(`Waiting for CKEditor initialization (attempt ${retryCount})`, {
        exists: !!win.CKEDITOR,
        hasReplace: win.CKEDITOR && typeof win.CKEDITOR.replace === "function",
        hasGetUrl: win.CKEDITOR && typeof win.CKEDITOR.getUrl === "function",
        hasDom: win.CKEDITOR && !!win.CKEDITOR.dom
      });
    }

    // Give up after too many retries
    if (retryCount >= 20) {
      console.warn("CKEditor not fully initialized after maximum retries");
      reject("CKEditor failed to initialize completely after multiple retries");
      return;
    }

    // Use our standardized retry policy
    this._retryWithBackoff(() => {
      this._waitForCKEditorCore(win, baseUrl, timestamp, resolve, reject, retryCount + 1);
    }, retryCount);
  }

  private _loadBBCodePlugin(
    baseUrl: string,
    timestamp: string,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void
  ): void {
    try {
      const document = this.windowRefService.nativeWindow.document;
      const bbcodeScript = document.createElement("script");
      bbcodeScript.src = `${baseUrl}/plugins/bbcode/plugin.js?t=${timestamp}`;

      bbcodeScript.onload = () => {
        // After plugin loads, verify the editor is fully ready
        this._finalizeCKEditorInitialization(resolve, reject);
      };

      bbcodeScript.onerror = () => {
        // Even if BBCode plugin fails, we can still try to use the editor
        console.warn("BBCode plugin failed to load, but continuing with CKEditor initialization");
        this._finalizeCKEditorInitialization(resolve, reject);
      };

      document.body.appendChild(bbcodeScript);
    } catch (e) {
      console.error("Error while loading BBCode plugin:", e);
      // Still try to verify if editor is usable
      this._finalizeCKEditorInitialization(resolve, reject);
    }
  }

  private _finalizeCKEditorInitialization(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void
  ): void {
    const win = this.windowRefService.nativeWindow as any;
    const timestamp = environment.ckeditorTimestamp;

    // Check for required functionality using our helper function
    if (this._isCKEditorReady(win)) {
      // Set the timestamp to ensure version consistency
      win.CKEDITOR.timestamp = timestamp;

      console.log("CKEditor is ready with required functionality");
      this._loaded = true;
      resolve();
      return;
    }

    // If not ready yet, use the verification method with retry policy
    this._verifyCKEditorReady(resolve, reject);
  }

  /**
   * Helper function to implement consistent retry with exponential backoff
   */
  private _retryWithBackoff(callback: () => void, retryCount: number): void {
    // Calculate delay with exponential backoff - start with 200ms
    const delay = Math.min(200 * Math.pow(1.5, retryCount), 2000);
    this.utilsService.delay(delay).subscribe(callback);
  }

  private _verifyCKEditorReady(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void
  ): void {
    const win = this.windowRefService.nativeWindow as any;
    const timestamp = environment.ckeditorTimestamp;

    // Check for required functionality using our helper function
    if (this._isCKEditorReady(win)) {
      // Set the timestamp to ensure version consistency
      win.CKEDITOR.timestamp = timestamp;

      console.log("CKEditor is ready with required functionality");
      this._loaded = true;
      resolve();
      return;
    }

    // Create an object of CKEDITOR properties for debugging
    const ckeditorState = {
      exists: !!win.CKEDITOR,
      hasReplace: win.CKEDITOR && typeof win.CKEDITOR.replace === "function",
      hasGetUrl: win.CKEDITOR && typeof win.CKEDITOR.getUrl === "function",
      hasDom: win.CKEDITOR && !!win.CKEDITOR.dom,
      hasDomElement: win.CKEDITOR && win.CKEDITOR.dom && !!win.CKEDITOR.dom.element
    };

    // If we're not making progress (nothing is changing), log more details
    if (this._retryCount > 5) {
      console.warn(`CKEditor not fully initialized on attempt ${this._retryCount}:`, ckeditorState);
    }

    // Maximum number of retries (20 with exponential backoff)
    if (this._retryCount < 20) {
      this._retryCount++;
      this._retryWithBackoff(() => {
        this._verifyCKEditorReady(resolve, reject);
      }, this._retryCount);
    } else {
      console.error("CKEditor initialization timed out after multiple retries");
      reject("CKEditor failed to initialize completely after multiple retries");
    }
  }

  private _fetchThumbnail(src: string, callback: (thumbnailSrc: string) => void) {
    const urlPath = new URL(src, this.windowRefService.nativeWindow.location.origin).pathname.slice(1);
    const url = `${environment.classicBaseUrl}/json-api/common/ckeditor-upload/?path=${encodeURIComponent(urlPath)}`;

    this.http
      .get<{ thumbnail: string }>(url)
      .pipe(
        map(response => response.thumbnail),
        catchError(error => {
          console.error("Error fetching thumbnail:", error);
          return of(src);
        })
      )
      .subscribe(thumbnail => {
        if (thumbnail) {
          callback(thumbnail);
        } else {
          callback(src);
        }
      });
  }
}
