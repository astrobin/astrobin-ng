import { Component, OnInit } from "@angular/core";
import { selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { takeUntil } from "rxjs/operators";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Observable } from "rxjs";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";

@Component({
  selector: "astrobin-contributors-page",
  templateUrl: "./contributors-page.component.html",
  styleUrls: ["./contributors-page.component.scss"]
})
export class ContributorsPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly contributors$: Observable<ContributorInterface[]> = this.store$.select(selectEquipmentContributors).pipe(
    takeUntil(this.destroyed$)
  );

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new GetContributors());
  }
}
