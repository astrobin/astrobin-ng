import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { TitleServiceInterface } from "@shared/services/title/title.service-interface";

@Injectable({
  providedIn: "root"
})
export class TitleService extends BaseService implements TitleServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly titleService: Title,
    public readonly meta: Meta
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
    this.meta.updateTag({ name: "og:title", content: title + suffix });
  }

  public updateMetaTag(tag: { name: string; content: string }) {
    this.meta.updateTag(tag);
  }

  public addMetaTag(tag: { name: string; content: string }) {
    const existingTag = this.meta.getTag(`name="${tag.name}"`);
    if (existingTag) {
      this.meta.updateTag(tag);
    } else {
      this.meta.addTag(tag);
    }
  }

  public getDescription(): string {
    return this.meta.getTag("name='description'")?.content;
  }

  public setDescription(description: string) {
    this.meta.updateTag({ name: "description", content: description });
    this.meta.updateTag({ name: "og:description", content: description });
  }
}
