import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { equipmentFeatureKey, reducer } from "@features/equipment/store/equipment.reducer";
import { EquipmentEffects } from "@features/equipment/store/equipment.effects";
import { routes } from "@features/equipment/equipment.routing";
import { MigrationToolComponent } from "./pages/migration/migration-tool/migration-tool.component";
import { ItemSummaryComponent } from "./components/summaries/item-summary/item-summary.component";
import { CameraEditorComponent } from "./components/editors/camera-editor/camera-editor.component";
import { BrandSummaryComponent } from "./components/summaries/brand-summary/brand-summary.component";
import { BaseItemEditorComponent } from "./components/editors/base-item-editor/base-item-editor.component";
import { BrandEditorComponent } from "./components/editors/brand-editor/brand-editor.component";
import { MigrationReviewComponent } from "./pages/migration/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "./pages/migration/migration-review-item/migration-review-item.component";
import { SensorEditorComponent } from "@features/equipment/components/editors/sensor-editor/sensor-editor.component";
import { SimilarItemsSuggestionComponent } from "./components/similar-items-suggestion/similar-items-suggestion.component";
import { ConfirmItemCreationModalComponent } from "./components/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { RejectMigrationModalComponent } from "./components/migration/reject-migration-modal/reject-migration-modal.component";
import { MigrationExplorerComponent } from "./pages/migration/migration-explorer/migration-explorer.component";
import { ItemTypeNavComponent } from "./components/item-type-nav/item-type-nav.component";
import { MigrationNavComponent } from "@features/equipment/components/migration/migration-nav/migration-nav.component";
import { MigrationCommandmentsComponent } from "./components/migration/migration-commandments/migration-commandments.component";
import { MigrationTestWarningComponent } from "./components/migration/migration-test-warning/migration-test-warning.component";
import { ItemBrowserComponent } from "./components/item-browser/item-browser.component";
import { ExplorerComponent } from "./pages/explorer/explorer.component";
import { OthersInBrandComponent } from "./components/others-in-brand/others-in-brand.component";

@NgModule({
  declarations: [
    MigrationToolComponent,
    ItemSummaryComponent,
    CameraEditorComponent,
    SensorEditorComponent,
    BrandSummaryComponent,
    BaseItemEditorComponent,
    BrandEditorComponent,
    MigrationReviewComponent,
    MigrationReviewItemComponent,
    SimilarItemsSuggestionComponent,
    ConfirmItemCreationModalComponent,
    RejectMigrationModalComponent,
    MigrationExplorerComponent,
    ItemTypeNavComponent,
    MigrationNavComponent,
    MigrationCommandmentsComponent,
    MigrationTestWarningComponent,
    ItemBrowserComponent,
    ExplorerComponent,
    OthersInBrandComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(equipmentFeatureKey, reducer),
    EffectsModule.forFeature([EquipmentEffects])
  ]
})
export class EquipmentModule {}
