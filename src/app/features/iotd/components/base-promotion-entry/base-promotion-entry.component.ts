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
import { map, switchMap, take, tap } from "rxjs/operators";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PromotionImageInterface } from "@features/iotd/types/promotion-image.interface";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "astrobin-base-promotion-entry",
  template: ""
})
export abstract class BasePromotionEntryComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;
  solution$: Observable<SolutionInterface>;

  @Input()
  entry: PromotionImageInterface;

  @ViewChild("image", { read: ImageComponent })
  image: ImageComponent;

  @HostBinding("class.card") card = true;

  @HostBinding("class.hidden") hidden = false;

  protected constructor(
    public readonly store$: Store<State>,
    public readonly elementRef: ElementRef,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService
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

  isHidden$(imageId: ImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectHiddenImageByImageId, imageId).pipe(
      map(hiddenImage => !!hiddenImage),
      tap(isHidden => (this.hidden = isHidden))
    );
  }

  hide(imageId: ImageInterface["pk"]): void {
    this.store$.dispatch(new HideImage({ id: imageId }));
  }

  isDismissed$(imageId: ImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectDismissedImageByImageId, imageId).pipe(map(dismissedImage => !!dismissedImage));
  }

  dismiss(imageId: ImageInterface["pk"]): void {
    const _confirmDismiss = () => {
      this.store$.dispatch(new DismissImage({ id: imageId }));
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

  show(imageId: ImageInterface["pk"]): void {
    this.store$
      .select(selectHiddenImageByImageId, imageId)
      .pipe(take(1))
      .subscribe(hiddenImage => this.store$.dispatch(new ShowImage({ hiddenImage })));
  }

  abstract isPromoted$(imageId: ImageInterface["pk"]): Observable<boolean>;

  abstract mayPromote$(imageId: ImageInterface["pk"]): Observable<boolean>;

  abstract promote(imageId: ImageInterface["pk"]): void;

  abstract retractPromotion(imageId: ImageInterface["pk"]): void;

  viewFullscreen(imageId: ImageInterface["pk"]): void {
    if (!this.image.loading) {
      this.store$.dispatch(new ShowFullscreenImage(imageId));
    }
  }

  loadImage(): void {
    this.image.alwaysLoad = true;
    this.image.load();
  }
}
