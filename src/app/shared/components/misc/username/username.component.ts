import { Component, Input } from "@angular/core";
import { BaseComponent } from "@shared/components/base.component";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponent {
  @Input() user: UserInterface;
  @Input() link = true;

  constructor(public usernameService: UsernameService, public classicRoutes: ClassicRoutesService) {
    super();
  }
}
