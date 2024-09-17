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
    this.titleService.setTitle(title + " - AstroBin");
    this.meta.updateTag({ name: "og:title", content: title + " - AstroBin" });
  }

  public addMetaTag(tag: { name: string; content: string }) {
    this.meta.addTag(tag);
  }

  public setDescription(description: string) {
    this.meta.updateTag({ name: "description", content: description });
    this.meta.updateTag({ name: "og:description", content: description });
  }
}
