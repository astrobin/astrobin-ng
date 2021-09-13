import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { equipmentFeatureKey, reducer } from "@features/equipment/store/equipment.reducer";
import { EquipmentEffects } from "@features/equipment/store/equipment.effects";
import { routes } from "@features/equipment/equipment.routing";
import { MigrationToolComponent } from "./pages/migration-tool/migration-tool.component";
import { EquipmentItemSummaryComponent } from "./components/equipment-item-summary/equipment-item-summary.component";
import { CameraEditorComponent } from "./components/camera-editor/camera-editor.component";
import { BrandSummaryComponent } from "./components/brand-summary/brand-summary.component";
import { BaseEquipmentItemEditorComponent } from "./components/base-equipment-item-editor/base-equipment-item-editor.component";
import { BrandEditorComponent } from "./components/brand-editor/brand-editor.component";
import { MigrationReviewComponent } from "./pages/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "./pages/migration-review-item/migration-review-item.component";
import { SensorEditorComponent } from "@features/equipment/components/sensor-editor/sensor-editor.component";
import { SimilarItemsSuggestionComponent } from "./components/similar-items-suggestion/similar-items-suggestion.component";
import { ConfirmItemCreationModalComponent } from "./components/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { RejectMigrationModalComponent } from "./components/reject-migration-modal/reject-migration-modal.component";
import { MigrationExplorerComponent } from "./pages/migration-explorer/migration-explorer.component";
import { MigrationItemTypeNavComponent } from "./components/migration-item-type-nav/migration-item-type-nav.component";
import { MigrationNavComponent } from "@features/equipment/components/migration-nav/migration-nav.component";
import { MigrationCommandmentsComponent } from "./components/migration-commandments/migration-commandments.component";
import { MigrationTestWarningComponent } from "./components/migration-test-warning/migration-test-warning.component";

@NgModule({
  declarations: [
    MigrationToolComponent,
    EquipmentItemSummaryComponent,
    CameraEditorComponent,
    SensorEditorComponent,
    BrandSummaryComponent,
    BaseEquipmentItemEditorComponent,
    BrandEditorComponent,
    MigrationReviewComponent,
    MigrationReviewItemComponent,
    SimilarItemsSuggestionComponent,
    ConfirmItemCreationModalComponent,
    RejectMigrationModalComponent,
    MigrationExplorerComponent,
    MigrationItemTypeNavComponent,
    MigrationNavComponent,
    MigrationCommandmentsComponent,
    MigrationTestWarningComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(equipmentFeatureKey, reducer),
    EffectsModule.forFeature([EquipmentEffects])
  ]
})
export class EquipmentModule {}
