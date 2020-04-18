import { Component, ViewChild } from "@angular/core";
import { LoginFormComponent } from "@lib/components/auth/login-form/login-form.component";
import { ClassicRoutesService } from "@lib/services/classic-routes.service";
import { WindowRefService } from "@lib/services/window-ref.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"]
})
export class LoginModalComponent {
  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(
    public activeModal: NgbActiveModal,
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService
  ) {}

  loginSuccessful(): void {
    this.windowRef.nativeWindow.location.reload();
  }
}
