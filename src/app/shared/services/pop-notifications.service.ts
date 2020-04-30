import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root"
})
export class PopNotificationsService extends BaseService {
  public constructor(
    public loadingService: LoadingService,
    public toastr: ToastrService,
    public translate: TranslateService
  ) {
    super(loadingService);
  }

  public success(message: string, title?: string): void {
    this.toastr.success(message, title ? title : this.translate.instant("Success!"));
  }

  public info(message: string, title?: string): void {
    this.toastr.info(message, title ? title : this.translate.instant("Info"));
  }

  public warning(message: string, title?: string): void {
    this.toastr.warning(message, title ? title : this.translate.instant("Warning!"));
  }

  public error(message: string, title?: string): void {
    this.toastr.error(message, title ? title : this.translate.instant("Error!"));
  }
}
