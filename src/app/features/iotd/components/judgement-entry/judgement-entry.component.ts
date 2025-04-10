import { ElementRef, OnInit, Component, Inject, PLATFORM_ID } from "@angular/core";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { BasePromotionEntryComponent } from "@features/iotd/components/base-promotion-entry/base-promotion-entry.component";
import { DeleteIotd, PostIotd } from "@features/iotd/store/iotd.actions";
import { selectFutureIotdForImage, selectJudgementQueueEntry } from "@features/iotd/store/iotd.selectors";
import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-judgement-entry",
  templateUrl: "../base-promotion-entry/base-promotion-entry.component.html",
  styleUrls: ["../base-promotion-entry/base-promotion-entry.component.scss"]
})
export class JudgementEntryComponent extends BasePromotionEntryComponent implements OnInit {
  showDismissButton = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly elementRef: ElementRef,
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(
      store$,
      actions$,
      elementRef,
      modalService,
      cookieService,
      windowRefService,
      classicRoutesService,
      translateService,
      utilsService,
      platformId
    );
  }

  ngOnInit() {
    this.showViewButton = true;
    this.promoteButtonIcon = "trophy";
    this.promoteButtonLabel = this.translateService.instant("IOTD");
    this.retractPromotionButtonLabel = this.translateService.instant("Retract");
    this.imageAlias = ImageAlias.STORY;
    this.imageAutoHeight = false;
    this.showMetadata = false;
    this.anonymizedThumbnails = false;

    super.ngOnInit();
  }

  isPromoted$(imageId: ImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectFutureIotdForImage, imageId).pipe(
      map(iotd => iotd !== null),
      distinctUntilChanged()
    );
  }

  mayPromote$(imageId: ImageInterface["pk"]): Observable<boolean> {
    // We're going to let the backend return value determine the flow.
    return of(true);
  }

  promote(imageId: ImageInterface["pk"]): void {
    this.store$.dispatch(new PostIotd({ imageId }));
  }

  retractPromotion(imageId: ImageInterface["pk"]): void {
    this.store$
      .select(selectFutureIotdForImage, imageId)
      .pipe(
        take(1),
        tap(iotd => this.store$.dispatch(new DeleteIotd({ id: iotd.id })))
      )
      .subscribe();
  }

  setExpiration(pk: JudgementImageInterface["pk"]): void {
    this.store$
      .select(selectJudgementQueueEntry, pk)
      .pipe(
        filter(entry => !!entry),
        switchMap(entry =>
          this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ entry, backendConfig })))
        ),
        map(({ entry, backendConfig }) => {
          const date = new Date(entry.lastVoteTimestamp + "Z");
          date.setDate(date.getDate() + backendConfig.IOTD_JUDGEMENT_WINDOW_DAYS);
          return date.toUTCString();
        }),
        take(1)
      )
      .subscribe(date => {
        this.expirationDate = date;
      });
  }
}
