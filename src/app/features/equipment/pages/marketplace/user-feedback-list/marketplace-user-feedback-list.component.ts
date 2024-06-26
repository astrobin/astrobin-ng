import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUserByUsername } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import {
  MarketplaceFeedbackInterface,
  MarketplaceFeedbackTargetType
} from "@features/equipment/types/marketplace-feedback.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";

@Component({
  selector: "astrobin-marketplace-user-feedback-list",
  templateUrl: "./marketplace-user-feedback-list.component.html",
  styleUrls: ["./marketplace-user-feedback-list.component.scss"]
})
export class MarketplaceUserFeedbackListComponent extends BaseComponentDirective implements OnInit {
  readonly TargetType = MarketplaceFeedbackTargetType;

  page = 1;
  user: UserInterface;
  title: string;
  feedback: PaginatedApiResultInterface<MarketplaceFeedbackInterface>;
  contentType: ContentTypeInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    const username = this.activatedRoute.snapshot.paramMap.get("username");
    const contentTypePayload = {
      appLabel: "astrobin_apps_equipment",
      model: "equipmentitemmarketplacefeedback"
    };

    this.store$.dispatch(new LoadUser({ username }));
    this.store$.dispatch(new LoadContentType(contentTypePayload));

    this.store$.select(selectUserByUsername, username).pipe(
      filter(user => !!user),
      take(1),
      tap(user => this.user = user),
      tap(() => this._setTitle()),
      tap(() => this._setBreadCrumb()),
      switchMap(() => this.store$.select(selectContentType, contentTypePayload)),
      tap(contentType => this.contentType = contentType),
      tap(() => this.loadFeedback(this.page))
    ).subscribe();
  }

  loadFeedback(page: number) {
    this.page = page;

    this.equipmentApiService.loadUserMarketplaceFeedback(this.user.id, this.page).subscribe(response => {
      this.feedback = response;
    });
  }

  openCommentsModal(feedback: MarketplaceFeedbackInterface) {
    const modalRef: NgbModalRef = this.modalService.open(NestedCommentsModalComponent, {
      size: "lg",
      centered: true
    });
    const modalComponent: NestedCommentsModalComponent = modalRef.componentInstance;

    modalComponent.contentType = this.contentType;
    modalComponent.objectId = feedback.id;
    modalComponent.showReplyButton = false;
    modalComponent.showTopLevelButton = false;
    modalComponent.autoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy.ALWAYS;
    modalComponent.topLevelFormPlacement = "BOTTOM";
    modalComponent.topLevelFormHeight = 150;
  }

  private _setTitle() {
    this.title = this.translateService.instant(
      `${this.user.displayName}'s marketplace feedback`
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
          label: this.user.displayName
        },
        {
          label: this.translateService.instant("Feedback")
        }
      ]
    }));
  }
}
