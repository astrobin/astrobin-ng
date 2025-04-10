import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type { Meta, MetaDefinition, Title } from "@angular/platform-browser";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import type { TitleServiceInterface } from "@core/services/title/title.service-interface";

@Injectable({
  providedIn: "root"
})
export class TitleService extends BaseService implements TitleServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly titleService: Title,
    public readonly meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(loadingService);
  }

  public getTitle(): string {
    return this.titleService.getTitle();
  }

  public setTitle(title: string) {
    const suffix = " - AstroBin";
    if (title.endsWith(suffix)) {
      title = title.replace(suffix, "");
    }

    this.titleService.setTitle(title + suffix);
    this.updateMetaTag({ property: "og:title", content: title + suffix });
  }

  public updateMetaTag(tag: MetaDefinition) {
    this._addOrUpdateMetaTag(tag);
  }

  public addMetaTag(tag: MetaDefinition) {
    this._addOrUpdateMetaTag(tag);
  }

  public getDescription(): string {
    return this.meta.getTag("name='description'")?.content;
  }

  public setDescription(description: string) {
    this.updateMetaTag({ name: "description", content: description });
    this.updateMetaTag({ property: "og:description", content: description });
  }

  public disablePageZoom() {
    // Update viewport meta tag to prevent zooming
    this.updateMetaTag({
      name: "viewport",
      content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    });

    if (isPlatformBrowser(this.platformId)) {
      // Prevent multi-touch gestures (pinch to zoom)
      document.addEventListener("touchmove", this._preventDefault, { passive: false });

      // Add CSS to html element to disable pinch zoom (Safari and mobile browsers)
      const htmlElement = document.querySelector("html");
      if (htmlElement) {
        htmlElement.style.setProperty("touch-action", "none");
      }

      // Firefox touchpad pinch to zoom can also happen with ctrl+wheel events
      this._wheelHandler = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      };
      document.addEventListener("wheel", this._wheelHandler, { passive: false });
    }
  }

  // Store references to event handlers so we can properly remove them
  private _wheelHandler: ((e: WheelEvent) => void) | null = null;

  public enablePageZoom() {
    // Reset viewport meta tag to default
    this.updateMetaTag({
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    });

    if (isPlatformBrowser(this.platformId)) {
      // Remove touch event listener
      document.removeEventListener("touchmove", this._preventDefault);

      // Remove wheel event listener if it exists
      if (this._wheelHandler) {
        document.removeEventListener("wheel", this._wheelHandler);
        this._wheelHandler = null;
      }

      // Reset touch-action on html element
      const htmlElement = document.querySelector("html");
      if (htmlElement) {
        htmlElement.style.removeProperty("touch-action");
      }
    }
  }

  private _getExistingMetaTag(tag: MetaDefinition) {
    if (tag.name) {
      return this.meta.getTag(`name="${tag.name}"`);
    }

    if (tag.property) {
      return this.meta.getTag(`property="${tag.property}"`);
    }

    return null;
  }

  private _addOrUpdateMetaTag(tag: MetaDefinition) {
    const existingTag = this._getExistingMetaTag(tag);

    if (existingTag) {
      this.meta.updateTag(tag);
    } else {
      this.meta.addTag(tag);
    }
  }

  private _preventDefault(e: TouchEvent) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }
}
