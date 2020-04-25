import { Component, Input } from "@angular/core";
import { UsernameService } from "@lib/components/misc/username/username.service";
import { UserInterface } from "@lib/interfaces/user.interface";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent {
  @Input() user: UserInterface;

  constructor(public usernameService: UsernameService) {}
}
