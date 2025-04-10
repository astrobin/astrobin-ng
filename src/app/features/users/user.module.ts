import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UserGalleryAboutComponent } from "@features/users/pages/gallery/user-gallery-about.component";
import { UserGalleryButtonsComponent } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { UserGalleryCollectionAddRemoveImagesComponent } from "@features/users/pages/gallery/user-gallery-collection-add-remove-images.component";
import { UserGalleryCollectionCreateComponent } from "@features/users/pages/gallery/user-gallery-collection-create.component";
import { UserGalleryCollectionMenuComponent } from "@features/users/pages/gallery/user-gallery-collection-menu.component";
import { UserGalleryCollectionThumbnailComponent } from "@features/users/pages/gallery/user-gallery-collection-thumbnail.component";
import { UserGalleryCollectionsComponent } from "@features/users/pages/gallery/user-gallery-collections.component";
import { UserGalleryEquipmentComponent } from "@features/users/pages/gallery/user-gallery-equipment.component";
import { UserGalleryHeaderChangeImageComponent } from "@features/users/pages/gallery/user-gallery-header-change-image.component";
import { UserGalleryHeaderComponent } from "@features/users/pages/gallery/user-gallery-header.component";
import { UserGalleryImageMenuComponent } from "@features/users/pages/gallery/user-gallery-image-menu.component";
import { UserGalleryImagesComponent } from "@features/users/pages/gallery/user-gallery-images.component";
import { UserGalleryMarketplaceComponent } from "@features/users/pages/gallery/user-gallery-marketplace.component";
import { UserGalleryNavigationComponent } from "@features/users/pages/gallery/user-gallery-navigation.component";
import { UserGalleryPageComponent } from "@features/users/pages/gallery/user-gallery-page.component";
import { UserGallerySmartFolderComponent } from "@features/users/pages/gallery/user-gallery-smart-folder.component";
import { UserGallerySmartFoldersComponent } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { UserGalleryTrashComponent } from "@features/users/pages/gallery/user-gallery-trash.component";
import { UserEffects } from "@features/users/store/user.effects";
import { userFeatureKey, userReducer } from "@features/users/store/user.reducers";
import { userRoutes } from "@features/users/user.routing";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";

@NgModule({
  declarations: [
    UserGalleryPageComponent,
    UserGalleryHeaderComponent,
    UserGalleryHeaderChangeImageComponent,
    UserGalleryNavigationComponent,
    UserGalleryImagesComponent,
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
    UserGallerySmartFolderComponent,
    UserGalleryEquipmentComponent
  ],
  imports: [
    RouterModule.forChild(userRoutes),
    SharedModule,
    StoreModule.forFeature(userFeatureKey, userReducer),
    EffectsModule.forFeature([UserEffects])
  ]
})
export class UserModule {}
