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

  public setTitle(title: string) {
    this.titleService.setTitle(title + " - AstroBin");
  }

  public setDescription(description: string) {
    this.meta.updateTag({ name: "description", content: description });
  }
}
