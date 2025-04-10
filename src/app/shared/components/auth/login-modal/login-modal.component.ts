import { Component, ViewChild } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { LoadingService } from "@core/services/loading.service";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"]
})
export class LoginModalComponent extends BaseComponentDirective {
  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly activeModal: NgbActiveModal,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
