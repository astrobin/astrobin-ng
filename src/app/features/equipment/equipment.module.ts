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
    MigrationReviewItemComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(equipmentFeatureKey, reducer),
    EffectsModule.forFeature([EquipmentEffects])
  ]
})
export class EquipmentModule {}
