import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/image/image.routing";
import { ImageEffects } from "@features/image/store/image.effects";
import * as fromImage from "@features/image/store/image.reducer";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { ImageEditPageComponent } from "./pages/edit/image-edit-page.component";
import { CreateLocationModalComponent } from "./components/create-location-modal/create-location-modal.component";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";
import { SaveEquipmentPresetModalComponent } from "@features/image/components/save-equipment-preset-modal/save-equipment-preset-modal.component";
import { LoadEquipmentPresetModalComponent } from "./components/load-equipment-preset-modal/load-equipment-preset-modal.component";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from "./components/additional-deep-sky-acquisition-properties-modal/additional-deep-sky-acquisition-properties-modal.component";
import { AdditionalSolarSystemAcquisitionPropertiesModalComponent } from "@features/image/components/additional-solar-system-acquisition-properties-modal/additional-solar-system-acquisition-properties-modal.component";
import { LoadDeepSkyAcquisitionPresetModalComponent } from "@features/image/components/load-deep-sky-acquisition-preset-modal/load-deep-sky-acquisition-preset-modal.component";
import { SaveDeepSkyAcquisitionPresetModalComponent } from "@features/image/components/save-deep-sky-acquisition-preset-modal/save-deep-sky-acquisition-preset-modal.component";

@NgModule({
  declarations: [
    ImageEditPageComponent,
    CreateLocationModalComponent,
    SaveEquipmentPresetModalComponent,
    LoadEquipmentPresetModalComponent,
    AdditionalDeepSkyAcquisitionPropertiesModalComponent,
    AdditionalSolarSystemAcquisitionPropertiesModalComponent,
    LoadDeepSkyAcquisitionPresetModalComponent,
    SaveDeepSkyAcquisitionPresetModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(fromImage.imageFeatureKey, fromImage.reducer),
    EffectsModule.forFeature([ImageEffects])
  ],
  providers: [
    ImageEditService,
    ImageEditBasicFieldsService,
    ImageEditContentFieldsService,
    ImageEditSettingsFieldsService,
    ImageEditThumbnailFieldsService,
    ImageEditEquipmentFieldsService,
    ImageEditAcquisitionFieldsService,
    ImageEditWatermarkFieldsService
  ]
})
export class ImageModule {
}
