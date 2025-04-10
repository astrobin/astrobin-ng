import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import type { VersionEvent } from "@angular/service-worker";
import { SwUpdate } from "@angular/service-worker";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import type { Subscription } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class VersionCheckService {
  private _subscription: Subscription;

  constructor(
    public readonly swUpdate: SwUpdate,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    @Inject(DOCUMENT) public readonly document: any
  ) {}

  checkForUpdates() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    if (!!this._subscription) {
      return;
    }

    this.swUpdate.checkForUpdate();

    this._subscription = this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
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
