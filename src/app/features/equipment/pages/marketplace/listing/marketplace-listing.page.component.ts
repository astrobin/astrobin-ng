import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  MarketplaceListingInterface,
  MarketplaceListingType
} from "@features/equipment/types/marketplace-listing.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { LoadContentType, LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { merge, Observable, of, Subscription } from "rxjs";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Actions, ofType } from "@ngrx/effects";
import {
  ApproveMarketplaceListing,
  ApproveMarketplaceListingSuccess,
  CreateMarketplacePrivateConversation,
  CreateMarketplacePrivateConversationSuccess,
  DeleteMarketplaceListing,
  DeleteMarketplaceListingSuccess,
  DeleteMarketplacePrivateConversation,
  DeleteMarketplacePrivateConversationSuccess,
  EquipmentActionTypes,
  LoadMarketplacePrivateConversations,
  RenewMarketplaceListing,
  UpdateMarketplacePrivateConversation
} from "@features/equipment/store/equipment.actions";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import {
  LoadNestedComment,
  LoadNestedComments,
  LoadNestedCommentsSuccess
} from "@app/store/actions/nested-comments.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import {
  selectMarketplaceListing,
  selectMarketplaceOffersByUser,
  selectMarketplacePrivateConversation,
  selectMarketplacePrivateConversations
} from "@features/equipment/store/equipment.selectors";
import { selectNestedCommentById } from "@app/store/selectors/app/nested-comments.selectors";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { MarketplaceOfferModalComponent } from "@features/equipment/components/marketplace-offer-modal/marketplace-offer-modal.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { RouterService } from "@shared/services/router.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { MarketplaceMarkLineItemsAsSoldModalComponent } from "@features/equipment/components/marketplace-mark-line-items-as-sold-modal/marketplace-mark-line-items-as-sold-modal.component";
import { isPlatformBrowser, Location } from "@angular/common";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";

@Component({
  selector: "astrobin-marketplace-listing-page",
  templateUrl: "./marketplace-listing.page.component.html",
  styleUrls: ["./marketplace-listing.page.component.scss"]
})
export class MarketplaceListingPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  readonly MarketplaceListingType = MarketplaceListingType;

  readonly breadcrumb = new SetBreadcrumb({
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
        label: this.translateService.instant("Listing")
      }
    ]
  });

  title = this.translateService.instant("Marketplace listing");
  listing: MarketplaceListingInterface;
  listingContentType$: Observable<ContentTypeInterface>;
  listingUser$: Observable<UserInterface>;
  privateConversations$: Observable<MarketplacePrivateConversationInterface[]>;
  hasOffered$: Observable<boolean>;

  private _contentTypePayload = { appLabel: "astrobin_apps_equipment", model: "equipmentitemmarketplacelisting" };
  private _listingUpdatedSubscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal,
    public readonly router: Router,
    public readonly http: HttpClient,
    public readonly windowRefService: WindowRefService,
    public readonly routerService: RouterService,
    public readonly utilsService: UtilsService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this.setListing(this.activatedRoute.snapshot.data.listing);
    this._subscribeToListingChanges();
    this.windowRefService.scroll({ top: 0 });

    // If we're navigating to a different listing, update the page.
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.setListing(this.activatedRoute.snapshot.data.listing);
        this._subscribeToListingChanges();
        this.windowRefService.scroll({ top: 0 });
      });
  }

  setListing(listing: MarketplaceListingInterface) {
    this.listing = { ...listing };

    this.appendSlugToUrl();
    this.loadContentType();
    this.loadPrivateConversations();
    this.loadUser();
    this.loadHasOffered();

    if (!!this.listing.title) {
      this.title = this.listing.title;
      this.titleService.setTitle(this.title);
    }
  }

  loadHasOffered() {
    this.hasOffered$ = this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing),
      switchMap(() => this.currentUser$),
      switchMap(user => {
        if (!!user) {
          return this.store$.select(selectMarketplaceOffersByUser(user.id, this.listing.id));
        }

        return of([]);
      }),
      map(offers => offers.length > 0),
      takeUntil(this.destroyed$)
    );
  }

  loadUser() {
    this.listingUser$ = this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing),
      switchMap(() => this.equipmentMarketplaceService.getListingUser$(this.listing)),
      filter(user => !!user),
      take(1)
    );
  }

  loadContentType() {
    this.listingContentType$ = this.store$.select(selectContentType, this._contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1)
    );

    this.store$.dispatch(new LoadContentType(this._contentTypePayload));
  }

  appendSlugToUrl() {
    const currentUrl = this.router.url;
    const baseUrl = `/equipment/marketplace/listing/${this.listing.hash}`;
    const slugUrl = `${baseUrl}/${this.listing.slug}`;

    // Extracting the query params and fragment
    const queryParamsIndex = currentUrl.indexOf("?");
    const fragmentIndex = currentUrl.indexOf("#");
    let queryParams = "";
    let fragment = "";

    if (queryParamsIndex !== -1) {
      queryParams = currentUrl.substring(queryParamsIndex, fragmentIndex !== -1 ? fragmentIndex : undefined);
    }

    if (fragmentIndex !== -1) {
      fragment = currentUrl.substring(fragmentIndex);
    }

    // Append query params and fragment if they exist
    const finalUrl = `${slugUrl}${queryParams}${fragment}`;

    if (currentUrl !== finalUrl) {
      this.location.replaceState(finalUrl);
    }
  }

  ngAfterViewInit(): void {
    const fragment = this.activatedRoute.snapshot.fragment;
    if (fragment && fragment[0] === "c") {
      const commentId = +fragment.substring(1);

      this.store$
        .select(selectNestedCommentById, commentId)
        .pipe(
          takeUntil(this.destroyed$),
          filter(comment => !!comment),
          take(1)
        )
        .subscribe((comment: NestedCommentInterface) => {
          const contentTypeId = comment.contentType;

          this.store$
            .select(selectContentTypeById, { id: contentTypeId })
            .pipe(
              filter(
                contentType => !!contentType && contentType.model === "equipmentitemmarketplaceprivateconversation"
              ),
              switchMap(() => this.store$.select(selectMarketplacePrivateConversation(comment.objectId))),
              take(1)
            )
            .subscribe(privateConversation => {
              this.startPrivateConversation(privateConversation);
            });

          this.store$.dispatch(new LoadContentTypeById({ id: contentTypeId }));
        });

      this.store$.dispatch(new LoadNestedComment({ id: commentId }));
    } else if (fragment && fragment === "offers") {
      this.windowRefService.scrollToElement("#offers");

      const message = this.translateService.instant("Your listing has some offers");

      if (this.windowRefService.nativeWindow.innerWidth < 768) {
        this.popNotificationsService.info(
          message + " " + this.translateService.instant("Scroll down to see them.")
        );
      } else {
        this.popNotificationsService.info(
          message + " " + this.translateService.instant("Find them on the right side of the page")
        );
      }
    } else if (fragment && fragment === "mark-as-sold") {
      this.markAsSold();
    }

    if (isPlatformBrowser(this.platformId)) {
      this._recordHit();
    }
  }

  shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    this.windowRefService.nativeWindow.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  }

  shareOnX() {
    const text = this.title;
    const url = encodeURIComponent(window.location.href);
    this.windowRefService.nativeWindow.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  }

  shareOnWhatsApp() {
    const text = `${this.title}: ` + encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    this.windowRefService.nativeWindow.open(whatsappUrl, "_blank");
  }

  approve() {
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_SUCCESS),
        filter((action: ApproveMarketplaceListingSuccess) => action.payload.listing.id === this.listing.id),
        map(action => action.payload.listing),
        take(1)
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
      });

    this.loadingService.setLoading(true);
    this.store$.dispatch(new ApproveMarketplaceListing({ listing: this.listing }));
  }

  markAsSold() {
    if (this.listing.listingType === MarketplaceListingType.WANTED) {
      return;
    }

    if (this.equipmentMarketplaceService.listingHasPendingOffers(this.listing)) {
      this.popNotificationsService.error(
        "You cannot mark a listing as sold if it has pending offers. " +
        "Please accept or reject all offers before marking this listing as sold."
      );
      return;
    }

    const modal: NgbModalRef = this.modalService.open(MarketplaceMarkLineItemsAsSoldModalComponent, { size: "lg" });
    const componentInstance: MarketplaceMarkLineItemsAsSoldModalComponent = modal.componentInstance;

    componentInstance.listing = this.listing;
  }

  delete() {
    const confirmationModal = this.modalService.open(ConfirmationDialogComponent);
    confirmationModal.closed
      .pipe(
        tap(() => this.loadingService.setLoading(true)),
        tap(() => this.store$.dispatch(new DeleteMarketplaceListing({ listing: this.listing }))),
        switchMap(() => this.actions$.pipe(ofType(EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_SUCCESS))),
        filter((action: DeleteMarketplaceListingSuccess) => action.payload.id === this.listing.id),
        take(1)
      )
      .subscribe(() => {
        this.router.navigateByUrl("/equipment/marketplace").then(() => {
          this.loadingService.setLoading(false);
        });
      });
  }

  renew() {
    this.store$.dispatch(new RenewMarketplaceListing({ listing: this.listing }));
  }

  onMakeAnOfferClicked(event: Event) {
    event.preventDefault();

    if (this.listing.listingType === MarketplaceListingType.WANTED) {
      return;
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }

      const modalRef: NgbModalRef = this.modalService.open(MarketplaceOfferModalComponent, { size: "xl" });
      const component = modalRef.componentInstance;

      component.listing = this.listing;
    });
  }

  loadPrivateConversations() {
    this.privateConversations$ = this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing),
      switchMap(() => this.store$.select(selectMarketplacePrivateConversations(this.listing.id))),
      takeUntil(this.destroyed$)
    );

    this.store$.dispatch(new LoadMarketplacePrivateConversations({ listingId: this.listing.id }));
  }

  deletePrivateConversation(privateConversation: MarketplacePrivateConversationInterface) {
    this.loadingService.setLoading(true);

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS),
        filter((action: DeleteMarketplacePrivateConversationSuccess) => action.payload.listingId === this.listing.id),
        take(1)
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
      });

    this.store$.dispatch(new DeleteMarketplacePrivateConversation({ privateConversation }));
  }

  startPrivateConversation(privateConversation: MarketplacePrivateConversationInterface, event: Event = null) {
    if (event) {
      event.preventDefault();
    }

    const contentTypePayload = {
      appLabel: "astrobin_apps_equipment",
      model: "equipmentitemmarketplaceprivateconversation"
    };

    this.store$
      .select(selectContentType, contentTypePayload)
      .pipe(
        filter(contentType => !!contentType),
        take(1),
        withLatestFrom(this.currentUser$)
      )
      .subscribe(([contentType, currentUser]) => {
        this.loadingService.setLoading(false);

        const modalRef: NgbModalRef = this.modalService.open(NestedCommentsModalComponent, {
          size: "lg",
          centered: true
        });
        const componentInstance: NestedCommentsModalComponent = modalRef.componentInstance;

        componentInstance.contentType = contentType;
        componentInstance.objectId = privateConversation.id;

        componentInstance.title =
          currentUser.id === this.listing.user
            ? this.translateService.instant("Private conversation with {{0}}", {
              0: privateConversation.userDisplayName
            })
            : this.translateService.instant("Private conversation with {{0}}", {
              0: this.listing.userDisplayName
            });

        componentInstance.noCommentsLabel = this.translateService.instant("No messages yet.");
        componentInstance.showReplyButton = false;
        componentInstance.showTopLevelButton = false;
        componentInstance.autoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy.ALWAYS;
        componentInstance.topLevelFormPlacement = "BOTTOM";
        componentInstance.topLevelFormHeight = 150;

        modalRef.shown
          .pipe(
            tap(() => this.loadingService.setLoading(true)),
            tap(() =>
              this.store$.dispatch(
                new LoadNestedComments({
                  contentTypeId: contentType.id,
                  objectId: privateConversation.id
                })
              )
            ),
            switchMap(() => this.actions$.pipe(ofType(AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS))),
            map((action: LoadNestedCommentsSuccess) => action.payload.nestedComments),
            take(1)
          )
          .subscribe(nestedComments => {
            const currentTime = new Date().toISOString();
            const updatedPrivateConversation = {
              ...privateConversation,
              userLastAccessed:
                currentUser.id !== this.listing.user ? currentTime : privateConversation.userLastAccessed,
              listingUserLastAccessed:
                currentUser.id === this.listing.user ? currentTime : privateConversation.listingUserLastAccessed
            };

            this.store$.dispatch(
              new UpdateMarketplacePrivateConversation({ privateConversation: updatedPrivateConversation })
            );

            this.loadingService.setLoading(false);
          });

        merge(modalRef.closed, modalRef.dismissed)
          .pipe(
            tap(() => this.loadingService.setLoading(true)),
            tap(() =>
              this.store$.dispatch(
                new LoadNestedComments({
                  contentTypeId: contentType.id,
                  objectId: privateConversation.id
                })
              )
            ),
            switchMap(() => this.actions$.pipe(ofType(AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS))),
            map((action: LoadNestedCommentsSuccess) => action.payload.nestedComments),
            take(1)
          )
          .subscribe(nestedComments => {
            if (nestedComments.length === 0) {
              this.deletePrivateConversation(privateConversation);
            }

            this.loadingService.setLoading(false);
          });
      });

    this.store$.dispatch(new LoadContentType(contentTypePayload));
  }

  onMessageUserClicked(event: Event) {
    event.preventDefault();

    this.loadingService.setLoading(true);

    this.currentUser$
      .pipe(
        switchMap(currentUser => {
          if (currentUser) {
            return this.store$
              .select(selectMarketplacePrivateConversations(this.listing.id, currentUser.id))
              .pipe(map(privateConversations => [privateConversations, currentUser]));
          } else {
            return of([[], null]);
          }
        }),
        take(1)
      )
      .subscribe((data: [MarketplacePrivateConversationInterface[], UserInterface]) => {
        const [privateConversations, currentUser] = data;

        if (!currentUser) {
          this.loadingService.setLoading(false);
          this.routerService.redirectToLogin();
          return;
        }

        if (privateConversations.length === 0) {
          this.actions$
            .pipe(
              ofType(EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS),
              filter(
                (action: CreateMarketplacePrivateConversationSuccess) =>
                  action.payload.privateConversation.listing === this.listing.id &&
                  action.payload.privateConversation.user === currentUser.id
              ),
              map((action: CreateMarketplacePrivateConversationSuccess) => action.payload.privateConversation),
              take(1)
            )
            .subscribe(privateConversation => {
              this.startPrivateConversation(privateConversation);
            });

          this.store$.dispatch(new CreateMarketplacePrivateConversation({ listingId: this.listing.id }));
        } else {
          // There can be only one private conversation per listing per user, so we can safely assume that the first one
          // is the one we want.
          this.startPrivateConversation(privateConversations[0]);
        }
      });
  }

  private _recordHit() {
    this.currentUser$
      .pipe(
        switchMap(user =>
          this.store$.select(selectContentType, this._contentTypePayload).pipe(
            filter(contentType => !!contentType),
            take(1),
            map(contentType => [user, contentType])
          )
        ),
        switchMap(([user, contentType]) => {
          if (!user || user.id !== this.listing.user) {
            return this.http.post(`${environment.classicBaseUrl}/json-api/common/record-hit/`, {
              content_type_id: contentType.id,
              object_id: this.listing.id
            });
          }

          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  private _subscribeToListingChanges() {
    if (this._listingUpdatedSubscription) {
      this._listingUpdatedSubscription.unsubscribe();
    }

    this._listingUpdatedSubscription = this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing && listing.id === this.listing.id),
      takeUntil(this.destroyed$)
    ).subscribe(listing => {
      this.setListing(listing);
    });
  }
}
