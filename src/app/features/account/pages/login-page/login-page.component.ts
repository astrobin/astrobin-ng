import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"]
})
export class LoginPageComponent implements OnInit {
  redirectUrl: string;

  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.redirectUrl = this.route.snapshot.queryParamMap.get("redirectUrl");
  }
}
