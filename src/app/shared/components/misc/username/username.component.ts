import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  user: UserInterface;

  @Input()
  link = true;

  @Input()
  linkTarget = "_self";

  username$: Observable<string>;

  constructor(
    public readonly store$: Store<State>,
    public readonly usernameService: UsernameService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges() {
    this.username$ = this.usernameService.getDisplayName$(this.user);
  }
}
