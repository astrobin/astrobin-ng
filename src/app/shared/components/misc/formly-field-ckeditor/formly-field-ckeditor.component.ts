import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, PLATFORM_ID } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { CKEditorService } from "@core/services/ckeditor.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { isPlatformServer } from "@angular/common";


@Component({
  selector: "astrobin-formly-field-ckeditor",
  templateUrl: "./formly-field-ckeditor.component.html",
  styleUrls: ["./formly-field-ckeditor.component.scss"]
})
export class FormlyFieldCKEditorComponent extends FieldType implements AfterViewInit, OnDestroy {
  editor;
  showEditor = false;

  constructor(
    public readonly translateService: TranslateService,
    public readonly ckeditorService: CKEditorService,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngAfterViewInit() {
    // Skip initialization on the server side
    if (!isPlatformServer(this.platformId)) {
      this._initialize();
    }
  }

  ngOnDestroy() {
    // Skip CKEDITOR cleanup on the server side
    if (isPlatformServer(this.platformId)) {
      return;
    }
    
    const win = this.windowRefService.nativeWindow as any;
    if (this.field?.id && win.CKEDITOR && typeof win.CKEDITOR.instances?.[this.field.id] !== "undefined") {
      win.CKEDITOR.instances[this.field.id].destroy();
    }
  }

  private _showEditor(): void {
    // Skip on server side
    if (isPlatformServer(this.platformId)) {
      return;
    }
    
    this.utilsService.delay(20).subscribe(() => {
      // Additional safety check in case the component is destroyed during the delay
      if (isPlatformServer(this.platformId)) {
        return;
      }
      
      if (this.editor?.instanceReady) {
        this.editor.resize(null, this.props.height || 300);
        this.showEditor = true;
        this.changeDetectorRef.detectChanges();
      } else {
        // Limit recursion depth for safety
        if (!this._showEditor['recursionCount']) {
          this._showEditor['recursionCount'] = 0;
        }
        
        if (this._showEditor['recursionCount'] < 30) {
          this._showEditor['recursionCount']++;
          this._showEditor();
        } else {
          console.warn('Maximum editor initialization attempts reached');
          // At least show something to the user rather than infinite loading
          this.showEditor = true;
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  /**
   * Retries the initialization with exponential backoff
   * @param baseWaitMultiplier - Factor to adjust the base wait time (0 = normal, 1 = longer, 2 = longest)
   *                             Higher values result in longer initial wait times for more serious errors
   */
  private _retryInitialization(baseWaitMultiplier: number = 0): void {
    // Track retry attempts in a static counter to avoid infinite loops
    if (!this._retryInitialization["attempts"]) {
      this._retryInitialization["attempts"] = 0;
    }

    const currentAttempt = ++this._retryInitialization["attempts"];

    if (currentAttempt >= 10) {
      console.error("Maximum retries reached for CKEditor initialization");
      return;
    }

    // Calculate exponential backoff delay with the multiplier
    // Base delay is 100ms, and increases based on both the multiplier and current attempt number
    const baseDelay = 100 * (baseWaitMultiplier + 1);
    const delay = Math.min(baseDelay * Math.pow(1.5, currentAttempt), 3000);

    console.log(`Retrying CKEditor initialization in ${delay}ms (attempt ${currentAttempt} of 10)`);

    this.utilsService.delay(delay).subscribe(() => {
      // Try initialization again
      this._initialize();
    });
  }

  private _initialize(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.editor) {
      // Already initialized.
      return;
    }

    this.ckeditorService.loadCKEditor()
      .then(() => {
        const document = this.windowRefService.nativeWindow.document;
        const editorBase = document.getElementById(this.field.id);
        const win = this.windowRefService.nativeWindow as any;

        if (!editorBase) {
          console.error("Editor base element not found");
          return;
        }

        // The CKEditor service should have already verified that CKEDITOR is initialized
        // but we perform a final check to be safe
        if (!win.CKEDITOR || typeof win.CKEDITOR.replace !== "function") {
          console.warn("CKEDITOR.replace not available - this indicates the service verification failed");

          // Instead of using a fixed delay, retry the initialization with exponential backoff
          this._retryInitialization(0); // First attempt
          return;
        }

        // Setup error handler for any CKEditor creation errors
        if (typeof win.CKEDITOR.on === "function" && !win.CKEDITOR._errorHandlerAdded) {
          win.CKEDITOR.on("instanceCreated", (event) => {
            event.editor.on("error", (errorEvent) => {
              console.warn("CKEditor instance error intercepted:", errorEvent.data);
              errorEvent.cancel(); // Prevent errors from stopping editor functionality
            });
          });
          win.CKEDITOR._errorHandlerAdded = true;
        }

        try {
          // Get options first
          const editorOptions = this.ckeditorService.options(this.formControl);

          // Create the editor - we'll do this directly, not in a delay
          try {
            // Try to create the editor
            this.editor = win.CKEDITOR.replace(this.field.id, editorOptions);

            // Wait for editor to be created before setting data
            if (this.editor) {
              // Set initial content if available
              if (this.formControl && this.formControl.value) {
                this.editor.setData(this.formControl.value);
              }

              // Show the editor when it's ready
              this._showEditor();
            } else {
              console.error("Failed to create editor instance");
              // Retry using exponential backoff
              this._retryInitialization(0); // Standard retry
            }
          } catch (e) {
            console.error("Error creating CKEditor instance:", e);

            // Special handling for BBCode plugin issues
            if (e.toString().includes("fragment") || e.toString().includes("htmlParser")) {
              console.warn("BBCode plugin error detected");
              try {
                // Try again with BBCode plugin disabled
                const basicOptions = {
                  ...editorOptions,
                  extraPlugins: editorOptions.extraPlugins.replace("bbcode,", "")
                };
                this.editor = win.CKEDITOR.replace(this.field.id, basicOptions);
                if (this.editor) {
                  if (this.formControl && this.formControl.value) {
                    this.editor.setData(this.formControl.value);
                  }
                  this._showEditor();
                }
              } catch (retryError) {
                console.error("Failed to create editor with BBCode disabled:", retryError);
                // Retry using exponential backoff
                this._retryInitialization(1); // Longer wait, BBCode plugin issue
              }
            } else {
              // For other errors, retry initialization using exponential backoff
              this._retryInitialization(0); // Standard retry
            }
          }
        } catch (e) {
          console.error("Error preparing CKEditor options:", e);
          // If there's an error, retry using exponential backoff
          this._retryInitialization(0); // Standard retry
        }
      })
      .catch(error => {
        console.error("Failed to load CKEditor:", error);
        // Retry loading using exponential backoff
        this._retryInitialization(2); // Longer wait, service failed completely
      });
  }
}
