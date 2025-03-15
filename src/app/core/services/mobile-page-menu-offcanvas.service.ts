import { Inject, Injectable, PLATFORM_ID, TemplateRef } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbOffcanvas, NgbOffcanvasRef } from "@ng-bootstrap/ng-bootstrap";
import { MobilePageMenuService } from "./mobile-page-menu.service";
import { filter, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MobilePageMenuOffcanvasService {
  private pageMenuOffcanvasRef: NgbOffcanvasRef = null;
  private pageMenuTemplate: TemplateRef<any> = null;

  // Flag to prevent circular dismissal calls
  private _isDismissingProgrammatically = false;

  // Flag to track if we're running in the browser
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly mobilePageMenuService: MobilePageMenuService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Only subscribe to menu open state in browser environment
    if (this.isBrowser) {
      // Subscribe to page menu open state changes
      this.mobilePageMenuService.getMenuOpenState()
        .pipe(
          // Only process changes when we're in a browser environment
          filter(() => this.isBrowser)
        )
        .subscribe(isOpen => {
          if (isOpen) {
            this.openPageMenuOffcanvas();
          } else if (this.pageMenuOffcanvasRef) {
            // Flag dismissal as programmatic to avoid circular references
            this._isDismissingProgrammatically = true;
            this.pageMenuOffcanvasRef.dismiss();
            this.pageMenuOffcanvasRef = null;

            // Reset flag after a tick to ensure all callbacks have executed
            setTimeout(() => {
              this._isDismissingProgrammatically = false;
            }, 0);
          }
        });
    }
  }

  /**
   * Register a template to use for the page menu offcanvas
   * @param template The template to use
   */
  registerPageMenuTemplate(template: TemplateRef<any>): void {
    // Only register the template if we're in a browser environment
    if (this.isBrowser) {
      this.pageMenuTemplate = template;
    }
  }

  /**
   * Open the page-specific menu offcanvas
   */
  private openPageMenuOffcanvas(): void {
    // Only proceed if we're in a browser environment
    if (!this.isBrowser) {
      return;
    }

    if (!this.pageMenuTemplate) {
      console.warn("Page menu template not registered");
      return;
    }

    // Add class to prevent body scrolling
    this.addScrollLock();

    this.mobilePageMenuService.getMenuConfig().pipe(take(1)).subscribe(config => {
      if (!config) {
        return;
      }

      const panelClass = "offcanvas-menu mobile-menu" + (config.offcanvasClass ? ` ${config.offcanvasClass}` : "");

      this.pageMenuOffcanvasRef = this.offcanvasService.open(this.pageMenuTemplate, {
        panelClass: panelClass,
        backdropClass: config.offcanvasBackdropClass,
        position: config.position || "end"
      });

      // Handle offcanvas dismissal
      this.pageMenuOffcanvasRef.dismissed.subscribe(() => {
        this.removeScrollLock();
        // Prevent circular call by checking if it's already being closed programmatically
        if (this.pageMenuOffcanvasRef) {
          // Use a flag to prevent recursive calls
          const wasDismissedByUser = !this._isDismissingProgrammatically;
          this.pageMenuOffcanvasRef = null;

          if (wasDismissedByUser) {
            // Only notify service if the dismissal wasn't triggered by the service
            this._isDismissingProgrammatically = true;
            this.mobilePageMenuService.closeMenu();
            setTimeout(() => {
              this._isDismissingProgrammatically = false;
            }, 0);
          }
        }
      });
    });
  }

  /**
   * Helper method to safely add scroll lock on body
   * Checks for browser environment to avoid SSR issues
   */
  private addScrollLock(): void {
    if (typeof document !== "undefined") {
      document.body.classList.add("offcanvas-open");
    }
  }

  /**
   * Helper method to safely remove scroll lock from body
   * Checks for browser environment to avoid SSR issues
   */
  private removeScrollLock(): void {
    if (typeof document !== "undefined") {
      document.body.classList.remove("offcanvas-open");
    }
  }
}
