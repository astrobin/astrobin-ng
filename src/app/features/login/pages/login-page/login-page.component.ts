import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LoginFormComponent } from "@lib/components/auth/login-form/login-form.component";
import { ClassicRoutesService } from "@lib/services/classic-routes.service";
import { WindowRefService } from "@lib/services/window-ref.service";

@Component({
  selector: "astrobin-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"]
})
export class LoginPageComponent {
  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService,
    public route: ActivatedRoute
  ) {}

  loginSuccessful(): void {
    const redirectUrl = this.route.snapshot.queryParamMap.get("redirectUrl");
    this.windowRef.nativeWindow.location.assign(redirectUrl ? redirectUrl : this.classicRoutesService.HOME);
  }
}
