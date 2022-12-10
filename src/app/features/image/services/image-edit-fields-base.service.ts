import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

@Injectable()
export abstract class ImageEditFieldsBaseService extends BaseService {
  protected constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  public abstract onFieldsInitialized(): void;
}
