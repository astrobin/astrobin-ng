import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  username$: Observable<string>;

  constructor(public readonly store$: Store<State>, public readonly usernameService: UsernameService) {
    super(store$);
  }

  ngOnInit() {
    this.username$ = this.usernameService.getDisplayName$(this.user);
  }
}
