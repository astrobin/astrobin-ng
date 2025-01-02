import { Inject, Injectable } from "@angular/core";
import { SwUpdate, VersionEvent } from "@angular/service-worker";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { DOCUMENT } from "@angular/common";


@Injectable({
  providedIn: "root"
})
export class VersionCheckService {
  constructor(
    public readonly swUpdate: SwUpdate,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    @Inject(DOCUMENT) public readonly document: any
  ) {
  }

  checkForUpdates() {
    this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
      if (event.type === "VERSION_READY") {
        this.notifyAboutUpdates();
      }
    });
  }

  notifyAboutUpdates() {
    const notification = this.popNotificationsService.info(
      this.translateService.instant(
    "AstroBin requires an update to continue working correctly. " +
        "If you're editing a form or making changes, please save your work before clicking here to update."
      ),
      this.translateService.instant("Update available"),
      {
        disableTimeOut: true,
        closeButton: false
      }
    );

    notification.onTap.subscribe(() => {
      this.swUpdate.activateUpdate().then(() => {
        this.document.location.reload();
      });
    });
  }
}
