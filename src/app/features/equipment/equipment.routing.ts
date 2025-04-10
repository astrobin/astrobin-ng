import { Routes } from "@angular/router";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { GroupGuardService } from "@core/services/guards/group-guard.service";
import { UsernameMatchGuard } from "@core/services/guards/username-match-guard";
import { ContributorsPageComponent } from "@features/equipment/pages/contributors-page/contributors-page.component";
import { BrandExplorerPageComponent } from "@features/equipment/pages/explorer/brand-explorer-page/brand-explorer-page.component";
import { ExplorerPageComponent } from "@features/equipment/pages/explorer/explorer-page.component";
import { FollowedExplorerComponent } from "@features/equipment/pages/followed-explorer/followed-explorer.component";
import { MarketplaceCreateListingPageComponent } from "@features/equipment/pages/marketplace/create-listing/marketplace-create-listing-page.component";
import { MarketplaceEditListingPageComponent } from "@features/equipment/pages/marketplace/edit-listing/marketplace-edit-listing-page.component";
import { MarketplaceListingPageComponent } from "@features/equipment/pages/marketplace/listing/marketplace-listing.page.component";
import { MarketplaceListingsPageComponent } from "@features/equipment/pages/marketplace/listings/marketplace-listings-page.component";
import { MarketplaceUserFeedbackPageComponent } from "@features/equipment/pages/marketplace/marketplace-user-feedback/marketplace-user-feedback-page.component";
import { MarketplacePendingModerationListingsPageComponent } from "@features/equipment/pages/marketplace/pending-moderation-listings/marketplace-pending-moderation-listings-page.component";
import { MarketplaceSoldListingsPageComponent } from "@features/equipment/pages/marketplace/sold-listings/marketplace-sold-listings-page.component";
import { MarketplaceUserExpiredListingsPageComponent } from "@features/equipment/pages/marketplace/user-expired-listings/marketplace-user-expired-listings-page.component";
import { MarketplaceUserFeedbackListPageComponent } from "@features/equipment/pages/marketplace/user-feedback-list/marketplace-user-feedback-list-page.component";
import { MarketplaceUserFollowedListingsPageComponent } from "@features/equipment/pages/marketplace/user-followed-listings/marketplace-user-followed-listings-page.component";
import { MarketplaceUserListingsPageComponent } from "@features/equipment/pages/marketplace/user-listings/marketplace-user-listings-page.component";
import { MarketplaceUserOffersPageComponent } from "@features/equipment/pages/marketplace/user-offers/marketplace-user-offers-page.component";
import { MarketplaceUserPurchasesPageComponent } from "@features/equipment/pages/marketplace/user-purchases/marketplace-user-purchases-page.component";
import { MarketplaceUserSoldListingsPageComponent } from "@features/equipment/pages/marketplace/user-sold-listings/marketplace-user-sold-listings-page.component";
import { MigrationExplorerComponent } from "@features/equipment/pages/migration/migration-explorer/migration-explorer.component";
import { MigrationReviewComponent } from "@features/equipment/pages/migration/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "@features/equipment/pages/migration/migration-review-item/migration-review-item.component";
import { MigrationToolComponent } from "@features/equipment/pages/migration/migration-tool/migration-tool.component";
import { PendingEditExplorerComponent } from "@features/equipment/pages/pending-edit-explorer/pending-edit-explorer.component";
import { PendingReviewExplorerComponent } from "@features/equipment/pages/pending-review-explorer/pending-review-explorer.component";
import { ReviewGearRenamingProposalsComponent } from "@features/equipment/pages/review-gear-renaming-proposals/review-gear-renaming-proposals.component";
import { ItemResolver } from "@features/equipment/resolvers/item.resolver";
import { MarketplaceListingResolver } from "@features/equipment/resolvers/marketplace-listing.resolver";
import { MigrationReviewItemGuardService } from "@features/equipment/services/migration-review-item-guard.service";
import { Constants } from "@shared/constants";

export const equipmentRoutes: Routes = [
  {
    path: "review-gear-renaming-proposals/:itemType",
    component: ReviewGearRenamingProposalsComponent
  },
  {
    path: "migration-tool",
    redirectTo: "migration-tool/camera"
  },
  {
    path: "migration-tool/:itemType",
    component: MigrationToolComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: [Constants.EQUIPMENT_MODERATORS_GROUP, Constants.OWN_EQUIPMENT_MIGRATORS_GROUP] }
  },
  {
    path: "migration-review",
    component: MigrationReviewComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: Constants.EQUIPMENT_MODERATORS_GROUP }
  },
  {
    path: "migration-review/:migrationStrategyId",
    component: MigrationReviewItemComponent,
    canActivate: [AuthGuardService, GroupGuardService, MigrationReviewItemGuardService],
    data: { group: Constants.EQUIPMENT_MODERATORS_GROUP }
  },
  {
    path: "migration-explorer",
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: Constants.EQUIPMENT_MODERATORS_GROUP },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "camera"
      },
      {
        path: ":itemType/:itemId/:itemSlug",
        pathMatch: "full",
        component: MigrationExplorerComponent
      },
      {
        path: ":itemType/:itemId",
        pathMatch: "full",
        component: MigrationExplorerComponent
      },
      {
        path: ":itemType",
        pathMatch: "full",
        component: MigrationExplorerComponent
      }
    ]
  },
  {
    path: "explorer",
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "camera"
      },
      {
        path: "contributors",
        pathMatch: "full",
        component: ContributorsPageComponent
      },
      {
        path: "brand",
        pathMatch: "full",
        component: BrandExplorerPageComponent
      },
      {
        path: "brand/:brandId/:brandSlug",
        pathMatch: "full",
        component: BrandExplorerPageComponent
      },
      {
        path: "brand/:brandId",
        pathMatch: "full",
        component: BrandExplorerPageComponent
      },

      {
        path: ":itemType/:itemId/:itemSlug/edit-proposals/:editProposalId",
        pathMatch: "full",
        component: ExplorerPageComponent,
        resolve: {
          item: ItemResolver
        }
      },
      {
        path: ":itemType/:itemId/:itemSlug",
        pathMatch: "full",
        component: ExplorerPageComponent,
        resolve: {
          item: ItemResolver
        }
      },
      {
        path: ":itemType/:itemId",
        pathMatch: "full",
        component: ExplorerPageComponent,
        resolve: {
          item: ItemResolver
        }
      },
      {
        path: ":itemType",
        pathMatch: "full",
        component: ExplorerPageComponent
      }
    ]
  },
  {
    path: "pending-review-explorer/:itemType",
    component: PendingReviewExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: Constants.EQUIPMENT_MODERATORS_GROUP }
  },
  {
    path: "pending-edit-explorer/:itemType",
    component: PendingEditExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: [Constants.EQUIPMENT_MODERATORS_GROUP, Constants.OWN_EQUIPMENT_MIGRATORS_GROUP] }
  },
  {
    path: "followed-explorer/:itemType",
    component: FollowedExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: [Constants.EQUIPMENT_MODERATORS_GROUP, Constants.OWN_EQUIPMENT_MIGRATORS_GROUP] }
  },
  {
    path: "marketplace",
    children: [
      {
        path: "",
        component: MarketplaceListingsPageComponent
      },
      {
        path: "listings",
        component: MarketplaceListingsPageComponent
      },
      {
        path: "pending-moderation",
        component: MarketplacePendingModerationListingsPageComponent,
        canActivate: [GroupGuardService],
        data: { anyOfGroups: [Constants.MARKETPLACE_MODERATORS_GROUP] }
      },
      {
        path: "sold",
        component: MarketplaceSoldListingsPageComponent
      },
      {
        path: "users/:username",
        component: MarketplaceUserListingsPageComponent
      },
      {
        path: "users/:username/listings",
        component: MarketplaceUserListingsPageComponent
      },
      {
        path: "users/:username/sold",
        component: MarketplaceUserSoldListingsPageComponent
      },
      {
        path: "users/:username/expired",
        component: MarketplaceUserExpiredListingsPageComponent,
        canActivate: [AuthGuardService, UsernameMatchGuard]
      },
      {
        path: "users/:username/offers",
        component: MarketplaceUserOffersPageComponent,
        canActivate: [AuthGuardService, UsernameMatchGuard]
      },
      {
        path: "users/:username/purchases",
        component: MarketplaceUserPurchasesPageComponent,
        canActivate: [AuthGuardService, UsernameMatchGuard]
      },
      {
        path: "users/:username/followed",
        component: MarketplaceUserFollowedListingsPageComponent,
        canActivate: [AuthGuardService, UsernameMatchGuard]
      },
      {
        path: "users/:username/feedback",
        component: MarketplaceUserFeedbackListPageComponent
      },
      {
        path: "users/:username/feedback/:id",
        component: MarketplaceUserFeedbackPageComponent
      },
      {
        path: "create",
        component: MarketplaceCreateListingPageComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: "listing/:hashOrId/edit",
        component: MarketplaceEditListingPageComponent,
        canActivate: [AuthGuardService],
        resolve: {
          listing: MarketplaceListingResolver
        }
      },
      {
        path: "listing/:hashOrId/:slug/edit",
        component: MarketplaceEditListingPageComponent,
        canActivate: [AuthGuardService],
        resolve: {
          listing: MarketplaceListingResolver
        }
      },
      {
        path: "listing/:hashOrId",
        component: MarketplaceListingPageComponent,
        resolve: {
          listing: MarketplaceListingResolver
        }
      },
      {
        path: "listing/:hashOrId/:slug",
        component: MarketplaceListingPageComponent,
        resolve: {
          listing: MarketplaceListingResolver
        }
      }
    ]
  }
];
