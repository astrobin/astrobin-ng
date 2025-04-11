import { OnInit, Component } from "@angular/core";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import { selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-contributors-page",
  templateUrl: "./contributors-page.component.html",
  styleUrls: ["./contributors-page.component.scss"]
})
export class ContributorsPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly contributors$: Observable<ContributorInterface[]> = this.store$
    .select(selectEquipmentContributors)
    .pipe(takeUntil(this.destroyed$));

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new GetContributors());
  }
}
