import { Component } from "@angular/core";

import { Toast, ToastPackage, ToastrService } from "ngx-toastr";
import { ExtendedIndividualConfig, ToastButtonInterface } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-custom-toast-component",
  styleUrls: [`./custom-toast.component.scss`],
  templateUrl: `./custom-toast.component.html`,
  preserveWhitespaces: false
})
export class CustomToastComponent extends Toast {
  constructor(public readonly toastrService: ToastrService, public readonly toastPackage: ToastPackage) {
    super(toastrService, toastPackage);
  }

  get buttons(): ToastButtonInterface[] {
    return (this.options as ExtendedIndividualConfig).buttons;
  }

  action(event: Event, button: ToastButtonInterface) {
    event.stopPropagation();
    this.toastPackage.triggerAction(button);
    this.toastrService.clear();
    return false;
  }
}
