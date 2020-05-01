import { Component, Input } from "@angular/core";
import { BaseComponent } from "@shared/components/base.component";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponent {
  @Input() user: UserInterface;

  constructor(public usernameService: UsernameService) {
    super();
  }
}
