import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "" + "astrobin-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"]
})
export class AvatarComponent extends BaseComponentDirective {
  @Input()
  user: UserInterface;

  constructor(public readonly store$: Store<State>, public readonly classicRoutesService: ClassicRoutesService) {
    super(store$);
  }
}
