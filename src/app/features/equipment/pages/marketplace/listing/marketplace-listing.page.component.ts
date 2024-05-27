import { AfterViewInit, Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { LoadContentType, LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { forkJoin, merge, Observable, of, ReplaySubject } from "rxjs";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Actions, ofType } from "@ngrx/effects";
import {
  AcceptMarketplaceOffer,
  AcceptMarketplaceOfferFailure,
  AcceptMarketplaceOfferSuccess,
  ApproveMarketplaceListing,
  ApproveMarketplaceListingSuccess,
  CreateMarketplacePrivateConversation,
  CreateMarketplacePrivateConversationSuccess,
  DeleteMarketplaceListing,
  DeleteMarketplaceListingSuccess,
  DeleteMarketplaceOffer,
  DeleteMarketplaceOfferFailure,
  DeleteMarketplaceOfferSuccess,
  DeleteMarketplacePrivateConversation,
  DeleteMarketplacePrivateConversationSuccess,
  EquipmentActionTypes,
  LoadMarketplaceListing,
  LoadMarketplaceListingSuccess,
  LoadMarketplacePrivateConversations,
  RenewMarketplaceListing,
  RenewMarketplaceListingSuccess,
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
import {
  MarketplaceOfferInterface,
  MarketplaceOfferStatus
} from "@features/equipment/types/marketplace-offer.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { LoadUser } from "@features/account/store/auth.actions";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { MarketplaceMarkLineItemsAsSoldModalComponent } from "@features/equipment/components/marketplace-mark-line-items-as-sold-modal/marketplace-mark-line-items-as-sold-modal.component";
import { Location } from "@angular/common";

interface UserOfferGroup {
  user: UserInterface;
  userId: UserInterface["id"];
  userDisplayName: string;
  status: MarketplaceOfferStatus;
  offersByLineItem: { [lineItemId: number]: MarketplaceOfferInterface[] };
  lineItemsWithoutOffers: MarketplaceLineItemInterface[];
}

@Component({
  selector: "astrobin-marketplace-listing-page",
  templateUrl: "./marketplace-listing.page.component.html",
  styleUrls: ["./marketplace-listing.page.component.scss"]
})
export class MarketplaceListingPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  readonly MarketplaceOfferStatus = MarketplaceOfferStatus;

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

  title = this.translateService.instant("Equipment marketplace listing");
  listing: MarketplaceListingInterface;
  listingContentType$: Observable<ContentTypeInterface>;
  listingUser$: Observable<UserInterface>;
  privateConversations$: Observable<MarketplacePrivateConversationInterface[]>;
  hasOffered$: Observable<boolean>;
  offersGroupedByUser: UserOfferGroup[] = [];

  private _contentTypePayload = { appLabel: "astrobin_apps_equipment", model: "equipmentitemmarketplacelisting" };
  private _listingUpdated$ = new ReplaySubject<void>();

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
    public readonly location: Location
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this.setListing();

    this.loadContentType();
    this.loadPrivateConversations();
    this.loadUser();
    this.loadHasOffered();
    this.loadOffersGroupedByUser();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.setListing();
        this.windowRefService.scroll({ top: 0 });
      });
  }

  setListing() {
    this.listing = this.activatedRoute.snapshot.data.listing;
    this.appendSlugToUrl();

    if (!!this.listing.title) {
      this.title = this.listing.title;
      this.titleService.setTitle(this.title);
    }

    this._listingUpdated$.next();
  }

  loadHasOffered() {
    this.hasOffered$ = this._listingUpdated$.pipe(
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

  loadOffersGroupedByUser() {
    this._listingUpdated$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.offersGroupedByUser = [];

      this.listing.lineItems.forEach(lineItem => {
        lineItem.offers.forEach(offer => {
          const userId = offer.user;

          this.store$.dispatch(new LoadUser({ id: userId }));

          this.store$
            .select(selectUser, userId)
            .pipe(
              filter(user => !!user),
              take(1)
            )
            .subscribe(user => {
              let userGroup = this.offersGroupedByUser.find(group => group.userId === userId);

              if (!userGroup) {
                userGroup = {
                  user,
                  userId,
                  userDisplayName: offer.userDisplayName,
                  status: MarketplaceOfferStatus.PENDING,
                  offersByLineItem: {},
                  lineItemsWithoutOffers: []
                };
                this.offersGroupedByUser.push(userGroup);
              }

              if (!userGroup.offersByLineItem[lineItem.id]) {
                userGroup.offersByLineItem[lineItem.id] = [];
              }

              userGroup.offersByLineItem[lineItem.id].push(offer);

              if (
                lineItem.offers
                  .filter(offer => offer.user === userId)
                  .every(offer => offer.status === MarketplaceOfferStatus.ACCEPTED)
              ) {
                userGroup.status = MarketplaceOfferStatus.ACCEPTED;
              }

              userGroup.lineItemsWithoutOffers = this.listing.lineItems.filter(
                lineItem => !Object.keys(userGroup.offersByLineItem).includes(lineItem.id.toString())
              );
            });
        });
      });
    });
  }

  loadUser() {
    this.listingUser$ = this._listingUpdated$.pipe(
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
    const url = this.router.url;
    const baseUrl = `/equipment/marketplace/listing/${this.listing.hash}`;
    const slugUrl = `${baseUrl}/${this.listing.slug}`;

    if (url !== slugUrl) {
      this.location.replaceState(slugUrl);
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
    }

    this._recordHit();
  }

  approve() {
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_SUCCESS),
        filter((action: ApproveMarketplaceListingSuccess) => action.payload.listing.id === this.listing.id),
        map(action => action.payload.listing),
        take(1)
      )
      .subscribe(listing => {
        this.loadingService.setLoading(false);
        this.listing = listing;
        this._listingUpdated$.next();
      });

    this.loadingService.setLoading(true);
    this.store$.dispatch(new ApproveMarketplaceListing({ listing: this.listing }));
  }

  markAsSold() {
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

    modal.closed.subscribe(() => {
      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_SUCCESS),
          filter((action: LoadMarketplaceListingSuccess) => action.payload.listing.id === this.listing.id),
          map(action => action.payload.listing),
          take(1)
        )
        .subscribe(listing => {
          this.listing = listing;
          this._listingUpdated$.next();
        });

      this.store$.dispatch(new LoadMarketplaceListing({ id: this.listing.id }));
    });
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
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.RENEW_MARKETPLACE_LISTING_SUCCESS),
        filter((action: RenewMarketplaceListingSuccess) => action.payload.listing.id === this.listing.id),
        map(action => action.payload.listing),
        take(1)
      )
      .subscribe(listing => {
        this.listing = listing;
        this._listingUpdated$.next();
      });

    this.store$.dispatch(new RenewMarketplaceListing({ listing: this.listing }));
  }

  onMakeAnOfferClicked(event: Event) {
    event.preventDefault();

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }

      const modalRef: NgbModalRef = this.modalService.open(MarketplaceOfferModalComponent, { size: "xl" });
      const component = modalRef.componentInstance;

      component.listing = this.listing;

      modalRef.closed
        .pipe(
          filter(listing => !!listing),
          switchMap(listing =>
            this.store$.select(selectMarketplaceListing, { id: listing.id }).pipe(
              filter(innerListing => !!innerListing),
              take(1)
            )
          )
        )
        .subscribe(listing => {
          this.listing = listing;
          this._listingUpdated$.next();
        });
    });
  }

  loadPrivateConversations() {
    this.privateConversations$ = this._listingUpdated$.pipe(
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
            ? this.translateService.instant("Private conversations with a prospective buyer")
            : this.translateService.instant("Private conversations with the seller");
        componentInstance.addCommentLabel = this.translateService.instant("Start a new conversation");
        componentInstance.noCommentsLabel = this.translateService.instant("No messages yet.");

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

  onMessageSellerClicked(event: Event) {
    event.preventDefault();

    this.loadingService.setLoading(true);

    this.currentUser$
      .pipe(
        switchMap(currentUser =>
          this.store$
            .select(selectMarketplacePrivateConversations(this.listing.id, currentUser.id))
            .pipe(map(privateConversations => [privateConversations, currentUser]))
        ),
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

  getLineItem(id: MarketplaceLineItemInterface["id"]): MarketplaceLineItemInterface {
    return this.listing.lineItems.find(lineItem => lineItem.id === id);
  }

  onAcceptOfferClicked(event: Event, userId: UserInterface["id"]) {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.message = this.translateService.instant(
      "Accepting this offer will mark the affected line items as reserved, and it constitutes a binding agreement " +
      "with the buyer. Failure to deliver the equipment as described may result in negative feedback and " +
      "possible disciplinary action. Are you sure you want to proceed?"
    );

    modalRef.closed.subscribe(() => {
      const offers = EquipmentMarketplaceService.offersByUser(userId, this.listing);

      this.loadingService.setLoading(true);

      forkJoin(
        offers.map(offer =>
          this.actions$.pipe(
            ofType(EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_FAILURE),
            filter((action: AcceptMarketplaceOfferFailure) => action.payload.offer.id === offer.id),
            take(1)
          )
        )
      ).subscribe(() => {
        this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
        this.loadingService.setLoading(false);
      });

      forkJoin(
        offers.map(offer =>
          this.actions$.pipe(
            ofType(EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS),
            filter((action: AcceptMarketplaceOfferSuccess) => action.payload.offer.id === offer.id),
            take(1),
            switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
            take(1)
          )
        )
      ).subscribe(listings => {
        // It's always the same listing, so we can safely assume that the first one is the one we want.
        this.listing = listings[0];
        this._listingUpdated$.next();

        this.popNotificationsService.success(
          this.translateService.instant("The offer has been accepted. The buyer will be notified.")
        );
        this.loadingService.setLoading(false);
      });

      offers.forEach(offer => {
        this.store$.dispatch(new AcceptMarketplaceOffer({ offer }));
      });
    });
  }

  onRejectOfferClicked(event: Event, userId: UserInterface["id"]) {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);

      if (
        this.listing.lineItems.filter(lineItem =>
          lineItem.offers.some(
            offer => offer.user === currentUser.id && offer.status === MarketplaceOfferStatus.ACCEPTED
          )
        )
      ) {
        const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;
        componentInstance.message = this.translateService.instant(
          "Careful! If you reject an offer that you already accepted, and have not reached a mutual " +
          "agreement with the buyer concerning this, you may risk disciplinary action. Offers are considered binding " +
          "agreements between buyers and sellers. Are you sure you want to retract your offer?"
        );
      }

      modalRef.closed.subscribe(() => {
        const offers = EquipmentMarketplaceService.offersByUser(userId, this.listing);

        this.loadingService.setLoading(true);

        forkJoin(
          offers.map(offer =>
            this.actions$.pipe(
              ofType(EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE),
              filter((action: DeleteMarketplaceOfferFailure) => action.payload.offer.id === offer.id),
              take(1)
            )
          )
        ).subscribe(() => {
          this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
          this.loadingService.setLoading(false);
        });

        forkJoin(
          offers.map(offer =>
            this.actions$.pipe(
              ofType(EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS),
              filter((action: DeleteMarketplaceOfferSuccess) => action.payload.offer.id === offer.id),
              take(1)
            )
          )
        )
          .pipe(
            switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
            take(1)
          )
          .subscribe(listing => {
            this.listing = listing;
            this._listingUpdated$.next();
            this.popNotificationsService.success(this.translateService.instant("Offer rejected successfully."));
            this.loadingService.setLoading(false);
          });

        offers.forEach(offer => {
          this.store$.dispatch(new DeleteMarketplaceOffer({ offer }));
        });
      });
    });
  }

  onMessageProspectBuyerClicked(event: Event, userId: UserInterface["id"]) {
    event.preventDefault();

    this.loadingService.setLoading(true);

    this.store$
      .pipe(select(selectMarketplacePrivateConversations(this.listing.id, userId)), take(1))
      .subscribe(privateConversations => {
        privateConversations = privateConversations.filter(
          privateConversation => privateConversation.user === userId
        );

        if (privateConversations.length === 0) {
          this.actions$
            .pipe(
              ofType(EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS),
              filter(
                (action: CreateMarketplacePrivateConversationSuccess) =>
                  action.payload.privateConversation.listing === this.listing.id &&
                  action.payload.privateConversation.user === userId
              ),
              map((action: CreateMarketplacePrivateConversationSuccess) => action.payload.privateConversation),
              take(1)
            )
            .subscribe(privateConversation => {
              this.startPrivateConversation(privateConversation);
            });

          this.store$.dispatch(new CreateMarketplacePrivateConversation({ listingId: this.listing.id, userId }));
        } else {
          this.startPrivateConversation(privateConversations[0]);
        }
      });

    this.store$.dispatch(new LoadUser({ id: userId }));
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
}
