import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { ActiveToast, IndividualConfig, ToastrService } from "ngx-toastr";
import { isPlatformServer } from "@angular/common";

export interface ToastButtonInterface {
  id: string;
  title: string;
  classList: string;
}

export interface ExtendedIndividualConfig extends IndividualConfig {
  buttons: ToastButtonInterface[];
}

@Injectable({
  providedIn: "root"
})
export class PopNotificationsService extends BaseService {
  public constructor(
    public loadingService: LoadingService,
    public toastrService: ToastrService,
    public translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(loadingService);
  }

  public success(message: string, title?: string, options?: Partial<ExtendedIndividualConfig>): ActiveToast<any> {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    return this.toastrService.success(message, title ? title : this.translateService.instant("Success!"), options);
  }

  public info(message: string, title?: string, options?: Partial<ExtendedIndividualConfig>): ActiveToast<any> {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    return this.toastrService.info(message, title ? title : this.translateService.instant("Info"), options);
  }

  public warning(message: string, title?: string, options?: Partial<ExtendedIndividualConfig>): ActiveToast<any> {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    return this.toastrService.warning(message, title ? title : this.translateService.instant("Warning!"), options);
  }

  public error(message: string, title?: string, options?: Partial<ExtendedIndividualConfig>): ActiveToast<any> {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    return this.toastrService.error(message, title ? title : this.translateService.instant("Error!"), options);
  }

  public genericError(errorMessage: string): ActiveToast<any> {
    const prefix = this.translateService.instant(
      "There was an error performing this operation. Please try again later or contact support if the issue " +
      "persists. The error message is: ");
    return this.error(`${prefix} ${errorMessage}`);
  }

  public remove(toastId?: number) {
    this.toastrService.remove(toastId);
  }

  public clear(toastId?: number) {
    this.toastrService.clear(toastId);
  }
}
