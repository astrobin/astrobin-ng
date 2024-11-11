import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Meta, MetaDefinition, Title } from "@angular/platform-browser";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { TitleServiceInterface } from "@shared/services/title/title.service-interface";
import { isPlatformBrowser } from "@angular/common";

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
    this.updateMetaTag({
      name: "viewport",
      content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    });

    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('touchmove', this._preventDefault, { passive: false });
    }
  }

  public enablePageZoom() {
    this.updateMetaTag({
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    });

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('touchmove', this._preventDefault);
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
