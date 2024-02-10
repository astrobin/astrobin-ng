import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { equipmentFeatureKey, reducer } from "@features/equipment/store/equipment.reducer";
import { routes } from "@features/equipment/equipment.routing";
import { MigrationToolComponent } from "./pages/migration/migration-tool/migration-tool.component";
import { MigrationReviewComponent } from "./pages/migration/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "./pages/migration/migration-review-item/migration-review-item.component";
import { RejectMigrationModalComponent } from "./components/migration/reject-migration-modal/reject-migration-modal.component";
import { MigrationExplorerComponent } from "./pages/migration/migration-explorer/migration-explorer.component";
import { ItemTypeNavComponent } from "./components/item-type-nav/item-type-nav.component";
import { MigrationNavComponent } from "@features/equipment/components/migration/migration-nav/migration-nav.component";
import { MigrationGuidelinesComponent } from "./components/migration/migration-guidelines/migration-guidelines.component";
import { ExplorerPageComponent } from "./pages/explorer/explorer-page.component";
import { ItemEditProposalComponent } from "./components/item-edit-proposal/item-edit-proposal.component";
import { PendingEditExplorerComponent } from "@features/equipment/pages/pending-edit-explorer/pending-edit-explorer.component";
import { PendingReviewExplorerComponent } from "@features/equipment/pages/pending-review-explorer/pending-review-explorer.component";
import { RejectItemModalComponent } from "./components/reject-item-modal/reject-item-modal.component";
import { ApproveItemModalComponent } from "@features/equipment/components/approve-item-modal/approve-item-modal.component";
import { RejectEditProposalModalComponent } from "@features/equipment/components/reject-edit-proposal-modal/reject-edit-proposal-modal.component";
import { ApproveEditProposalModalComponent } from "@features/equipment/components/approve-edit-proposal-modal/approve-edit-proposal-modal.component";
import { ExplorerComponent } from "@features/equipment/components/explorer/explorer.component";
import { MergeIntoModalComponent } from "./components/migration/merge-into-modal/merge-into-modal.component";
import { ReviewGearRenamingProposalsComponent } from "./pages/review-gear-renaming-proposals/review-gear-renaming-proposals.component";
import { RejectReviewGearRenamingProposalsModalComponent } from "@features/equipment/components/reject-review-gear-renaming-proposals-modal/reject-review-gear-renaming-proposals-modal.component";
import { PendingExplorerBaseComponent } from "@features/equipment/pages/explorer-base/pending-explorer-base.component";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { ExplorerFiltersComponent } from "./pages/explorer/explorer-filters/explorer-filters.component";
import { BrandExplorerPageComponent } from "./pages/explorer/brand-explorer-page/brand-explorer-page.component";
import { UnapproveItemModalComponent } from "@features/equipment/components/unapprove-item-modal/unapprove-item-modal.component";
import { ContributorsPageComponent } from "./pages/contributors-page/contributors-page.component";
import { EquipmentCompareComponent } from "./components/equipment-compare/equipment-compare.component";
import { EquipmentCompareModalComponent } from "./components/equipment-compare-modal/equipment-compare-modal.component";
import { EquipmentListingsComponent } from "./components/equipment-listings/equipment-listings.component";
import { FollowedExplorerComponent } from "@features/equipment/pages/followed-explorer/followed-explorer.component";
import { MarketplaceListingsPageComponent } from "./pages/marketplace/listings/marketplace-listings-page.component";
import { MarketplaceCreateListingPageComponent } from "./pages/marketplace/create-listing/marketplace-create-listing-page.component";
import { MarketplaceLineItemComponent } from "./components/marketplace-listing-line-item/marketplace-line-item.component";
import { MarketplaceListingComponent } from "./components/marketplace-listing/marketplace-listing.component";
import { MarketplaceListingLineItemPriceComponent } from "./components/marketplace-listing-line-item-price/marketplace-listing-line-item-price.component";
import { MarketplaceLineItemConditionComponent } from "./components/marketplace-listing-line-item-condition/marketplace-line-item-condition.component";
import { MarketplaceImagesComponent } from "./components/marketplace-listing-line-item-images/marketplace-images.component";
import { MarketplaceListingPageComponent } from "./pages/marketplace/listing/marketplace-listing.page.component";
import { MarketplaceLineItemCardComponent } from "./components/marketplace-line-item-card/marketplace-line-item-card.component";
import { MarketplaceUserCardComponent } from "./components/marketplace-user-card/marketplace-user-card.component";
import { MarketplaceFeedbackWidgetComponent } from "./components/marketplace-feedback-widget/marketplace-feedback-widget.component";
import { MarketplaceListingFormComponent } from "./components/marketplace-listing-form/marketplace-listing-form.component";
import { MarketplaceEditListingPageComponent } from "@features/equipment/pages/marketplace/edit-listing/marketplace-edit-listing-page.component";
import { MarketplaceNavComponent } from "./components/marketplace-nav/marketplace-nav.component";
import { MarketplaceSidebarComponent } from "./components/marketplace-sidebar/marketplace-sidebar.component";
import { MarketplaceMyListingsPageComponent } from "./pages/marketplace/my-listings/marketplace-my-listings-page.component";
import { MarketplaceFilterComponent } from "./components/marketplace-filter/marketplace-filter.component";
import { MarketplaceMoreFromUserComponent } from "./components/marketplace-more-from-user/marketplace-more-from-user.component";
import { MarketplaceLineItemCardsComponent } from './components/marketplace-line-item-cards/marketplace-line-item-cards.component';
import { MarketplaceSearchBarComponent } from './components/marketplace-search-bar/marketplace-search-bar.component';
import { MarketplaceOfferModalComponent } from './components/marketplace-offer-modal/marketplace-offer-modal.component';

@NgModule({
  declarations: [
    MigrationToolComponent,
    MigrationReviewComponent,
    MigrationReviewItemComponent,
    RejectMigrationModalComponent,
    MigrationExplorerComponent,
    ItemTypeNavComponent,
    MigrationNavComponent,
    MigrationGuidelinesComponent,
    ItemEditProposalComponent,
    PendingExplorerBaseComponent,
    ExplorerBaseComponent,
    ExplorerPageComponent,
    ExplorerComponent,
    PendingReviewExplorerComponent,
    FollowedExplorerComponent,
    PendingEditExplorerComponent,
    ApproveItemModalComponent,
    UnapproveItemModalComponent,
    RejectItemModalComponent,
    ApproveEditProposalModalComponent,
    RejectEditProposalModalComponent,
    MergeIntoModalComponent,
    ReviewGearRenamingProposalsComponent,
    RejectReviewGearRenamingProposalsModalComponent,
    ExplorerFiltersComponent,
    BrandExplorerPageComponent,
    ContributorsPageComponent,
    EquipmentCompareComponent,
    EquipmentCompareModalComponent,
    EquipmentListingsComponent,
    MarketplaceListingsPageComponent,
    MarketplaceCreateListingPageComponent,
    MarketplaceLineItemComponent,
    MarketplaceListingComponent,
    MarketplaceListingLineItemPriceComponent,
    MarketplaceLineItemConditionComponent,
    MarketplaceImagesComponent,
    MarketplaceListingPageComponent,
    MarketplaceLineItemCardComponent,
    MarketplaceUserCardComponent,
    MarketplaceFeedbackWidgetComponent,
    MarketplaceListingFormComponent,
    MarketplaceEditListingPageComponent,
    MarketplaceNavComponent,
    MarketplaceSidebarComponent,
    MarketplaceMyListingsPageComponent,
    MarketplaceFilterComponent,
    MarketplaceMoreFromUserComponent,
    MarketplaceLineItemCardsComponent,
    MarketplaceSearchBarComponent,
    MarketplaceOfferModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(equipmentFeatureKey, reducer)
  ]
})
export class EquipmentModule {
}
