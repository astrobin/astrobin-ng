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
import { UserGalleryCollectionThumbnailComponent } from "@features/users/pages/gallery/user-gallery-collection-thumbnail.component";
import { UserGalleryButtonsComponent } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { UserGalleryHeaderChangeImageComponent } from "@features/users/pages/gallery/user-gallery-header-change-image.component";
import { UserGalleryCollectionAddRemoveImagesComponent } from "@features/users/pages/gallery/user-gallery-collection-add-remove-images.component";
import { UserGalleryCollectionMenuComponent } from "@features/users/pages/gallery/user-gallery-collection-menu.component";
import { UserGalleryCollectionCreateComponent } from "@features/users/pages/gallery/user-gallery-collection-create.component";
import { UserGalleryImageMenuComponent } from "@features/users/pages/gallery/user-gallery-image-menu.component";
import { UserGallerySmartFoldersComponent } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { UserGallerySmartFolderComponent } from "@features/users/pages/gallery/user-gallery-smart-folder.component";

@NgModule({
  declarations: [
    UserGalleryPageComponent,
    UserGalleryHeaderComponent,
    UserGalleryHeaderChangeImageComponent,
    UserGalleryNavigationComponent,
    UserGalleryImagesComponent,
    UserGalleryLoadingComponent,
    UserGalleryMarketplaceComponent,
    UserGalleryAboutComponent,
    UserGalleryTrashComponent,
    UserGalleryCollectionsComponent,
    UserGalleryCollectionThumbnailComponent,
    UserGalleryCollectionMenuComponent,
    UserGalleryCollectionAddRemoveImagesComponent,
    UserGalleryCollectionCreateComponent,
    UserGalleryButtonsComponent,
    UserGalleryImageMenuComponent,
    UserGallerySmartFoldersComponent,
    UserGallerySmartFolderComponent
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
