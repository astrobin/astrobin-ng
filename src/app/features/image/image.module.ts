import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { imageRoutes } from "@features/image/image.routing";
import { ImageEffects } from "@features/image/store/image.effects";
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
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from "./components/additional-deep-sky-acquisition-properties-modal/additional-deep-sky-acquisition-properties-modal.component";
import { AdditionalSolarSystemAcquisitionPropertiesModalComponent } from "@features/image/components/additional-solar-system-acquisition-properties-modal/additional-solar-system-acquisition-properties-modal.component";
import { CopyAcquisitionSessionsFromAnotherImageModalComponent } from "@features/image/components/copy-acquisition-sessions-from-another-image-modal/copy-acquisition-sessions-from-another-image-modal.component";
import { OverrideAcquisitionFormModalComponent } from "@features/image/components/override-acquisition-form-modal/override-acquisition-form-modal.component";
import { ImportAcquisitionsFromCsvFormModalComponent } from "@features/image/components/import-acquisitions-from-csv-form-modal/import-acquisitions-from-csv-form-modal.component";
import { imageFeatureKey, imageReducer } from "@features/image/store/image.reducer";
import { ImagePageComponent } from "@features/image/pages/image/image-page.component";
import { ImageEditRevisionPageComponent } from "@features/image/pages/edit-revision/image-edit-revision-page.component";
import { ImagePlateSolvingSettingsPageComponent } from "@features/image/pages/plate-solving-settings/image-plate-solving-settings-page.component";
// import { NgxDatatableModule } from "@swimlane/ngx-datatable";

@NgModule({
  declarations: [
    ImagePageComponent,
    ImageEditPageComponent,
    CreateLocationModalComponent,
    SaveEquipmentPresetModalComponent,
    AdditionalDeepSkyAcquisitionPropertiesModalComponent,
    AdditionalSolarSystemAcquisitionPropertiesModalComponent,
    CopyAcquisitionSessionsFromAnotherImageModalComponent,
    OverrideAcquisitionFormModalComponent,
    ImportAcquisitionsFromCsvFormModalComponent,
    ImageEditRevisionPageComponent,
    ImagePlateSolvingSettingsPageComponent
  ],
  imports: [
    RouterModule.forChild(imageRoutes),
    SharedModule,
    StoreModule.forFeature(imageFeatureKey, imageReducer),
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
