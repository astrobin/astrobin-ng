import { Component, EventEmitter, HostBinding, Input, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { State } from "@app/store/state";
import { IotdInterface, SubmissionInterface, VoteInterface } from "@features/iotd/services/iotd-api.service";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { Observable } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { PromotionImageInterface } from "@features/iotd/types/promotion-image.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { selectApp } from "@app/store/selectors/app/app.selectors";

interface Slot {
  id: number;
  promotion: SubmissionInterface | VoteInterface | IotdInterface | null;
}

export enum SlotType {
  SUBMISSION,
  REVIEW,
  JUDGEMENT
}

const contentTypeDescription: Omit<ContentTypeInterface, "id"> = { appLabel: "astrobin_apps_iotd", model: "iotd" };

@Component({
  selector: "astrobin-base-promotion-slots",
  template: ""
})
export abstract class BasePromotionSlotsComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;
  SlotType = SlotType;

  abstract promotions$: Observable<SubmissionInterface[] | VoteInterface[] | IotdInterface[]>;
  abstract slotsCount$: Observable<number>;
  slots: Slot[] = [];

  @Input()
  availableEntries: PromotionImageInterface[] = [];

  @Output()
  slotClick = new EventEmitter();

  @ViewChildren("image")
  _images = new QueryList<ImageComponent>();

  @HostBinding("class.d-none") hasFullScreenImage = false;

  slotType: SlotType;
  iotdContentType$: Observable<ContentTypeInterface>;

  protected constructor(
    public readonly store$: Store<State>,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  @HostBinding("class.is-empty")
  public get isEmpty(): boolean {
    return this.slots.filter(slot => !!slot.promotion).length === 0;
  }

  ngOnInit() {
    if (this.slotType === undefined) {
      throw new Error("slotType cannot be undefined");
    }

    this.store$
      .select(selectApp)
      .pipe(
        takeUntil(this.destroyed$),
        map(app => !!app.currentFullscreenImage)
      )
      .subscribe(hasFullScreenImage => (this.hasFullScreenImage = hasFullScreenImage));

    if (this.slotType === SlotType.JUDGEMENT) {
      this.store$.dispatch(new LoadContentType(contentTypeDescription));
      this.iotdContentType$ = this.store$.select(selectContentType, contentTypeDescription).pipe(
        filter(contentType => !!contentType),
        take(1)
      );
    }

    this.slotsCount$.pipe(take(1)).subscribe(count => {
      for (let i = 0; i < count; ++i) {
        this.slots.push({
          id: i,
          promotion: null
        });
      }
    });

    this.promotions$.pipe(takeUntil(this.destroyed$)).subscribe(submissions => {
      this.slots.forEach(slot => (slot.promotion = null));
      submissions.forEach((promotion, i) => {
        this.slots[i].promotion = promotion;
        this._checkAndOpenComments(this.slots[i]);
      });

      this._images.forEach(image => image.load());
    });

    this._checkIfCommentedIotdIsFound();
  }

  slotClicked(imageId: number): void {
    if (this.clickableSlot(imageId)) {
      this.slotClick.emit(imageId);
    }
  }

  clickableSlot(imageId: number): boolean {
    return this.availableEntries.map(submission => submission.pk).indexOf(imageId) !== -1;
  }

  futureDate(slotNumber: number) {
    const d = new Date();
    d.setDate(d.getDate() + slotNumber + 1);
    return d;
  }

  openComments(iotd: IotdInterface, highlightId: NestedCommentInterface["id"] = null) {
    this.iotdContentType$.pipe(take(1)).subscribe(contentType => {
      const modalRef = this.modalService.open(NestedCommentsModalComponent, {
        size: "xl",
        centered: true,
        scrollable: false
      });
      const componentInstance: NestedCommentsModalComponent = modalRef.componentInstance;
      componentInstance.contentType = contentType;
      componentInstance.objectId = iotd.id;
      componentInstance.highlightId = highlightId;
      componentInstance.info = this.translateService.instant(
        "The judge who selected this image will be notified of top-level comments."
      );
    });
  }

  private _checkAndOpenComments(slot: Slot) {
    if (this.slotType !== SlotType.JUDGEMENT) {
      return;
    }

    this._getCommentFragment().subscribe((fragment: { iotdId: number; commentId: number } | null) => {
      if (fragment) {
        if (slot.promotion && slot.promotion.id === fragment.iotdId) {
          this.openComments(slot.promotion as IotdInterface, fragment.commentId);
        }
      }
    });
  }

  private _checkIfCommentedIotdIsFound() {
    if (this.slotType !== SlotType.JUDGEMENT) {
      return;
    }

    this._getCommentFragment().subscribe((fragment: { iotdId: number; commentId: number } | null) => {
      if (fragment) {
        if (!this.slots.find(slot => slot.promotion && slot.promotion.id === fragment.iotdId)) {
          this.popNotificationsService.warning(
            this.translateService.instant(
              "You requested a comment for a scheduled IOTD that is not scheduled anymore: " +
                "either it became IOTD because the scheduled date has been reached, or it was retracted."
            )
          );
        }
      }
    });
  }

  private _getCommentFragment(): Observable<{ iotdId: number; commentId: number } | null> {
    return this.activatedRoute.fragment.pipe(
      map(fragment => {
        if (fragment && fragment.indexOf("comments") > -1) {
          const parts = fragment.split("-");
          const iotdId: number = +parts[1];
          const commentId: number = +parts[2];

          return { iotdId, commentId };
        }

        return null;
      })
    );
  }
}
