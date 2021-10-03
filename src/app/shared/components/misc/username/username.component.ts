import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponentDirective {
  @Input() user: UserInterface;

  constructor(public readonly store$: Store<State>, public readonly usernameService: UsernameService) {
    super(store$);
  }
}
