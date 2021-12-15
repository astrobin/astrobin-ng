import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSolution } from "@app/store/actions/solution.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectSolution } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import {
  ConfirmDismissModalComponent,
  DISMISSAL_NOTICE_COOKIE
} from "@features/iotd/components/confirm-dismiss-modal/confirm-dismiss-modal.component";
import { DismissImage, HideImage, ShowImage } from "@features/iotd/store/iotd.actions";
import { selectDismissedImageByImageId, selectHiddenImageByImageId } from "@features/iotd/store/iotd.selectors";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { Observable } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { PromotionImageInterface } from "@features/iotd/types/promotion-image.interface";
import { CookieService } from "ngx-cookie-service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-base-promotion-entry",
  template: ""
})
export abstract class BasePromotionEntryComponent extends BaseComponentDirective implements OnInit {
  solution$: Observable<SolutionInterface>;

  @Input()
  entry: PromotionImageInterface;

  @Input()
  showLinkButton = false;

  @Input()
  promoteButtonLabel = this.translateService.instant("Promote");

  @Input()
  promoteButtonIcon = "star";

  @Input()
  retractPromotionButtonLabel = this.translateService.instant("Retract promotion");

  @Input()
  imageAlias = ImageAlias.HD_ANONYMIZED;

  @ViewChild("image", { read: ImageComponent })
  image: ImageComponent;

  @HostBinding("class.card") card = true;

  @HostBinding("class.hidden") hidden = false;

  protected constructor(
    public readonly store$: Store<State>,
    public readonly elementRef: ElementRef,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    this.solution$ = this.store$.select(selectApp).pipe(
      take(1),
      map(state => state.backendConfig.IMAGE_CONTENT_TYPE_ID),
      tap(contentTypeId =>
        this.store$.dispatch(new LoadSolution({ contentType: contentTypeId, objectId: "" + this.entry.pk }))
      ),
      switchMap(contentTypeId =>
        this.store$.select(selectSolution, { contentType: contentTypeId, objectId: "" + this.entry.pk })
      )
    );
  }

  isHidden$(pk: PromotionImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectHiddenImageByImageId, pk).pipe(
      map(hiddenImage => !!hiddenImage),
      tap(isHidden => (this.hidden = isHidden))
    );
  }

  viewPage(pk: PromotionImageInterface["pk"]): void {
    this.store$
      .select(selectImage, pk)
      .pipe(
        filter(image => !!image),
        take(1)
      )
      .subscribe(image => {
        this.windowRefService.nativeWindow.open(this.classicRoutesService.IMAGE(image.hash || `${image.pk}`), "_blank");
      });
  }

  hide(pk: PromotionImageInterface["pk"]): void {
    this.store$.dispatch(new HideImage({ id: pk }));
  }

  dismiss(pk: PromotionImageInterface["pk"]): void {
    const _confirmDismiss = () => {
      this.store$.dispatch(new DismissImage({ id: pk }));
    };

    const cookieValue = this.cookieService.get(DISMISSAL_NOTICE_COOKIE);

    if (cookieValue !== "1") {
      const modalRef = this.modalService.open(ConfirmDismissModalComponent);
      modalRef.closed.pipe(take(1)).subscribe(() => {
        _confirmDismiss();
      });
    } else {
      _confirmDismiss();
    }
  }

  show(pk: PromotionImageInterface["pk"]): void {
    this.store$
      .select(selectHiddenImageByImageId, pk)
      .pipe(take(1))
      .subscribe(hiddenImage => this.store$.dispatch(new ShowImage({ hiddenImage })));
  }

  abstract isPromoted$(pk: PromotionImageInterface["pk"]): Observable<boolean>;

  abstract mayPromote$(pk: PromotionImageInterface["pk"]): Observable<boolean>;

  abstract promote(pk: PromotionImageInterface["pk"]): void;

  abstract retractPromotion(pk: PromotionImageInterface["pk"]): void;

  viewFullscreen(pk: PromotionImageInterface["pk"]): void {
    if (!this.image.loading) {
      this.store$.dispatch(new ShowFullscreenImage(pk));
    }
  }

  loadImage(): void {
    this.image.alwaysLoad = true;
    this.image.load();
  }
}
