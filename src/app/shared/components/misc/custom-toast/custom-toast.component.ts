import { Component } from "@angular/core";
import { ExtendedIndividualConfig, ToastButtonInterface } from "@core/services/pop-notifications.service";
import { ToastPackage, ToastrService, Toast } from "ngx-toastr";

@Component({
  selector: "astrobin-custom-toast-component",
  styleUrls: [`./custom-toast.component.scss`],
  templateUrl: `./custom-toast.component.html`,
  preserveWhitespaces: false
})
export class CustomToastComponent extends Toast {
  constructor(
    public readonly toastrService: ToastrService,
    public readonly toastPackage: ToastPackage
  ) {
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
