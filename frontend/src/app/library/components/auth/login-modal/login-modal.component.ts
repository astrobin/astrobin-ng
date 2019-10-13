import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "@lib/services/auth.service";

@Component({
  selector: "astrobin-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"],
})
export class LoginModalComponent {
  public form: FormGroup;
  public loading = false;
  public error = false;

  constructor(
    public readonly activeModal: NgbActiveModal,
    public readonly formBuilder: FormBuilder,
    public readonly authService: AuthService) {

    this.form = this.formBuilder.group({
      handle: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  public login(): void {
    this.loading = true;

    this.authService.login(this.form.get("handle").value, this.form.get("password").value)
      .subscribe((loggedIn: boolean) => {
        if (loggedIn) {
          this.error = false;
          this.activeModal.close();
        } else {
          this.error = true;
        }
        this.loading = false;
      });
  }
}
