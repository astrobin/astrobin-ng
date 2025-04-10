import { ElementRef, OnInit, Component, HostBinding, Input, ViewChild } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { ForceCheckImageAutoLoad } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import {
  ConfirmDismissModalComponent,
  DISMISSAL_NOTICE_COOKIE
} from "@features/iotd/components/confirm-dismiss-modal/confirm-dismiss-modal.component";
import {
  DismissImageSuccess,
  HideImageSuccess,
  DismissImage,
  HideImage,
  IotdActionTypes,
  ShowImage
} from "@features/iotd/store/iotd.actions";
import { selectDismissedImageByImageId, selectHiddenImageByImageId } from "@features/iotd/store/iotd.selectors";
import { PromotionImageInterface } from "@features/iotd/types/promotion-image.interface";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { CookieService } from "ngx-cookie";
import { Observable, Subscription } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-base-promotion-entry",
  template: ""
})
export abstract class BasePromotionEntryComponent extends BaseComponentDirective implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly ImageAlias = ImageAlias;

  @Input()
  entry: PromotionImageInterface;

  @Input()
  showViewButton = false;

  @Input()
  promoteButtonLabel = this.translateService.instant("Promote");

  @Input()
  promoteButtonIcon: IconProp = "star";

  @Input()
  retractPromotionButtonLabel = this.translateService.instant("Retract promotion");

  @Input()
  imageAlias = ImageAlias.HD_ANONYMIZED;

  @Input()
  imageAutoHeight = true;

  @Input()
  showMetadata = true;

  @Input()
  countdownUpdateRate = 1;

  @Input()
  anonymizedThumbnails = true;

  @ViewChild("image", { read: ImageComponent })
  image: ImageComponent;

  @HostBinding("class.card") card = true;

  @HostBinding("class.hidden") hidden = false;

  @HostBinding("class.dismissed") dismissed = false;

  expirationDate: string;
  isPromoted: boolean;
  mayPromote: boolean;
  autoLoadSubscription: Subscription;
  showDismissButton = true;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly elementRef: ElementRef,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly platformId: Object
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.setExpiration(this.entry.pk);

    this.isHidden$(this.entry.pk)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(hidden => (this.hidden = hidden));

    this.isDismissed$(this.entry.pk)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(dismissed => (this.dismissed = dismissed));

    this.isPromoted$(this.entry.pk)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isPromoted => (this.isPromoted = isPromoted));

    this.mayPromote$(this.entry.pk)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mayPromote => (this.mayPromote = mayPromote));
  }

  isHidden$(pk: PromotionImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectHiddenImageByImageId, pk).pipe(map(hiddenImage => !!hiddenImage));
  }

  isDismissed$(pk: PromotionImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectDismissedImageByImageId, pk).pipe(map(dismissedImage => !!dismissedImage));
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
    this.actions$
      .pipe(
        ofType(IotdActionTypes.HIDE_IMAGE_SUCCESS),
        filter((action: HideImageSuccess) => action.payload.hiddenImage.id === pk),
        take(1)
      )
      .subscribe(() => {
        this.store$.dispatch(new ForceCheckImageAutoLoad({ imageId: pk }));
      });
    this.store$.dispatch(new HideImage({ id: pk }));
  }

  dismiss(pk: PromotionImageInterface["pk"]): void {
    const _confirmDismiss = () => {
      this.actions$
        .pipe(
          ofType(IotdActionTypes.DISMISS_IMAGE_SUCCESS),
          filter((action: DismissImageSuccess) => action.payload.dismissedImage.id === pk),
          take(1)
        )
        .subscribe(() => {
          this.store$.dispatch(new ForceCheckImageAutoLoad({ imageId: pk }));
        });
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

  selectItem(type: EquipmentItemType, id: EquipmentItem["id"]): Observable<EquipmentItem> {
    return this.store$.select(selectEquipmentItem, { type, id });
  }

  abstract isPromoted$(pk: PromotionImageInterface["pk"]): Observable<boolean>;

  abstract mayPromote$(pk: PromotionImageInterface["pk"]): Observable<boolean>;

  abstract promote(pk: PromotionImageInterface["pk"]): void;

  abstract retractPromotion(pk: PromotionImageInterface["pk"]): void;

  abstract setExpiration(pk: PromotionImageInterface["pk"]): void;

  viewFullscreen(event: MouseEvent | TouchEvent, pk: PromotionImageInterface["pk"]): void {
    if (event) {
      event.preventDefault();
    }

    if (!this.image.loading && !!this.image.image && !this.image.image.videoFile) {
      this.store$.dispatch(
        new ShowFullscreenImage({
          imageId: pk,
          event
        })
      );
    }
  }
}
