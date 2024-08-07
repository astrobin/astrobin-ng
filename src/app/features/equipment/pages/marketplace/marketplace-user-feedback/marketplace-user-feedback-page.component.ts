import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ActivatedRoute, Router } from "@angular/router";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { catchError } from "rxjs/operators";
import { EMPTY } from "rxjs";

@Component({
  selector: "astrobin-marketplace-user-feedback-page",
  templateUrl: "./marketplace-user-feedback-page.component.html",
  styleUrls: ["./marketplace-user-feedback-page.component.scss"]
})
export class MarketplaceUserFeedbackPageComponent extends BaseComponentDirective implements OnInit {
  feedback: MarketplaceFeedbackInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly route: ActivatedRoute,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const feedbackId = this.route.snapshot.params.id;
    this.equipmentApiService.getMarketplaceFeedbackById(feedbackId).pipe(
      catchError(() => {
          this.router.navigate(["/404"]);
          return EMPTY;
        }
      )
    ).subscribe(response => {
      this.feedback = response;

      this._setTitle();
      this._setBreadCrumb();
    });
  }

  private _setTitle() {
    this.title = this.translateService.instant(
      `${this.feedback.recipientDisplayName}'s marketplace feedback`
    );
  }

  private _setBreadCrumb() {
    this.store$.dispatch(new SetBreadcrumb({
      breadcrumb: [
        {
          label: this.translateService.instant("Equipment"),
          link: "/equipment/explorer"
        },
        {
          label: this.translateService.instant("Marketplace"),
          link: "/equipment/marketplace"
        },
        {
          label: this.feedback.recipientDisplayName
        },
        {
          label: this.translateService.instant("Feedback")
        }
      ]
    }));
  }
}
