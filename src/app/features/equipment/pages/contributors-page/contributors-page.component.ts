import { Component, OnInit } from "@angular/core";
import { selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { takeUntil, tap } from "rxjs/operators";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";
import { selectUser } from "@features/account/store/auth.selectors";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";

@Component({
  selector: "astrobin-contributors-page",
  templateUrl: "./contributors-page.component.html",
  styleUrls: ["./contributors-page.component.scss"]
})
export class ContributorsPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly contributors$: Observable<ContributorInterface[]> = this.store$.select(selectEquipmentContributors).pipe(
    takeUntil(this.destroyed$),
    tap(contributors => {
      for (const contributor of contributors) {
        this.store$.dispatch(new LoadUser({ id: contributor[0] }));
        this.store$.dispatch(new LoadUserProfile({ id: contributor[0] }));
      }
    })
  );

  ngOnInit() {
    this.store$.dispatch(new GetContributors());
  }

  selectUser(id: number): Observable<UserInterface> {
    return this.store$.select(selectUser, id);
  }
}
