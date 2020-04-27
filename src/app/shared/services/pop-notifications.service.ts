import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root"
})
export class PopNotificationsService {
  public constructor(
    public readonly toastr: ToastrService,
    public readonly translate: TranslateService
  ) {}

  public success(message: string, title?: string): void {
    this.toastr.success(
      message,
      title ? title : this.translate.instant("Success!")
    );
  }

  public info(message: string, title?: string): void {
    this.toastr.info(message, title ? title : this.translate.instant("Info"));
  }

  public warning(message: string, title?: string): void {
    this.toastr.warning(
      message,
      title ? title : this.translate.instant("Warning!")
    );
  }

  public error(message: string, title?: string): void {
    this.toastr.error(
      message,
      title ? title : this.translate.instant("Error!")
    );
  }
}
