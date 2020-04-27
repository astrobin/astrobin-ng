import { Component, ViewChild } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"]
})
export class LoginModalComponent {
  @ViewChild("loginForm") loginForm: LoginFormComponent;

  constructor(public activeModal: NgbActiveModal, public classicRoutesService: ClassicRoutesService) {}
}
