import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";

@Injectable({
  providedIn: "root"
})
export abstract class ImageEditFieldsBaseService extends BaseService {
  protected constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  public abstract onFieldsInitialized(): void;
}
