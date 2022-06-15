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
import { UsersUsingItemComponent } from "./components/explorer/users-using-item/users-using-item.component";
import { ImagesUsingItemComponent } from "@features/equipment/components/explorer/images-using-item/images-using-item.component";
import { MostOftenUsedWithComponent } from "./components/explorer/most-often-used-with/most-often-used-with.component";
import { ExplorerFiltersComponent } from './pages/explorer/explorer-filters/explorer-filters.component';

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
    PendingEditExplorerComponent,
    ApproveItemModalComponent,
    RejectItemModalComponent,
    ApproveEditProposalModalComponent,
    RejectEditProposalModalComponent,
    MergeIntoModalComponent,
    ReviewGearRenamingProposalsComponent,
    RejectReviewGearRenamingProposalsModalComponent,
    UsersUsingItemComponent,
    ImagesUsingItemComponent,
    MostOftenUsedWithComponent,
    ExplorerFiltersComponent
  ],
  imports: [RouterModule.forChild(routes), SharedModule, StoreModule.forFeature(equipmentFeatureKey, reducer)]
})
export class EquipmentModule {}
