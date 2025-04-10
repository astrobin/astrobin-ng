import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MainState } from "@app/store/state";
import { AuthActionTypes, Login } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.scss"]
})
export class LoginFormComponent extends BaseComponentDirective {
  form: FormGroup;
  error = false;

  @Input() redirectUrl: string;
  @Output() loginSuccessful = new EventEmitter();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly formBuilder: FormBuilder,
    public readonly actions$: Actions
  ) {
    super(store$);

    this.form = this.formBuilder.group({
      handle: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  @HostListener("document:keydown.enter", ["$event"]) login(): void {
    this.store$.dispatch(
      new Login({
        handle: this.form.get("handle").value,
        password: this.form.get("password").value,
        redirectUrl: this.redirectUrl
      })
    );

    this.actions$.pipe(ofType(AuthActionTypes.LOGIN_SUCCESS)).subscribe(() => {
      this.error = false;
      this.loginSuccessful.emit();
    });

    this.actions$.pipe(ofType(AuthActionTypes.LOGIN_FAILURE)).subscribe(() => {
      this.error = true;
    });
  }
}
