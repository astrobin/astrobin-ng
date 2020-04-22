import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "@lib/services/auth.service";

@Component({
  selector: "astrobin-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.scss"]
})
export class LoginFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = false;

  @Input() redirectUrl: string;
  @Output() loginSuccessful = new EventEmitter();

  constructor(public readonly formBuilder: FormBuilder, public readonly authService: AuthService) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      handle: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  @HostListener("document:keydown.enter", ["$event"]) login(): void {
    this.loading = true;

    const onError = () => {
      this.error = true;
    };

    this.authService
      .login(this.form.get("handle").value, this.form.get("password").value, this.redirectUrl)
      .subscribe((loggedIn: boolean) => {
        if (loggedIn) {
          this.error = false;
          this.loginSuccessful.emit();
        } else {
          onError();
        }
        this.loading = false;
      });
  }
}
