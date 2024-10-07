import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { SearchModule } from "@features/search/search.module";
import { UserGalleryPageComponent } from "@features/users/pages/gallery/user-gallery-page.component";
import { userRoutes } from "@features/users/user.routing";
import { UserEffects } from "@features/users/store/user.effects";
import { userFeatureKey, userReducer } from "@features/users/store/user.reducers";
import { UserGalleryHeaderComponent } from "@features/users/pages/gallery/user-gallery-header.component";
import { UserGalleryNavigationComponent } from "@features/users/pages/gallery/user-gallery-navigation.component";
import { UserGalleryImagesComponent } from "@features/users/pages/gallery/user-gallery-images.component";
import { UserGalleryLoadingComponent } from "@features/users/pages/gallery/user-gallery-loading.component";
import { UserGalleryMarketplaceComponent } from "@features/users/pages/gallery/user-gallery-marketplace.component";
import { UserGalleryAboutComponent } from "@features/users/pages/gallery/user-gallery-about.component";
import { UserGalleryTrashComponent } from "@features/users/pages/gallery/user-gallery-trash.component";
import { UserGalleryCollectionsComponent } from "@features/users/pages/gallery/user-gallery-collections.component";

@NgModule({
  declarations: [
    UserGalleryPageComponent,
    UserGalleryHeaderComponent,
    UserGalleryNavigationComponent,
    UserGalleryImagesComponent,
    UserGalleryLoadingComponent,
    UserGalleryMarketplaceComponent,
    UserGalleryAboutComponent,
    UserGalleryTrashComponent,
    UserGalleryCollectionsComponent
  ],
  imports: [
    RouterModule.forChild(userRoutes),
    SharedModule,
    SearchModule,
    StoreModule.forFeature(userFeatureKey, userReducer),
    EffectsModule.forFeature([UserEffects])
  ]
})
export class UserModule {
}
