import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { equipmentFeatureKey, reducer } from "@features/equipment/store/equipment.reducer";
import { EquipmentEffects } from "@features/equipment/store/equipment.effects";
import { routes } from "@features/equipment/equipment.routing";
import { MigrationToolComponent } from "./pages/migration-tool/migration-tool.component";

@NgModule({
  declarations: [MigrationToolComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(equipmentFeatureKey, reducer),
    EffectsModule.forFeature([EquipmentEffects])
  ]
})
export class EquipmentModule {}
