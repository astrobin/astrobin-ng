import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/image/image.routing";
import { ImageEffects } from "@features/image/store/image.effects";
import * as fromImage from "@features/image/store/image.reducer";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { ImageEditPageComponent } from "./pages/edit/image-edit-page.component";

@NgModule({
  declarations: [ImageEditPageComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(fromImage.imageFeatureKey, fromImage.reducer),
    EffectsModule.forFeature([ImageEffects])
  ]
})
export class ImageModule {}
