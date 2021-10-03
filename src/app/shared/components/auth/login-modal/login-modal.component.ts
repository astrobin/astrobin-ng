import { Component, ViewChild } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"]
})
export class LoginModalComponent extends BaseComponentDirective {
  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(
    public readonly store$: Store<State>,
    public readonly activeModal: NgbActiveModal,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
