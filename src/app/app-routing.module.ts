import { NgModule } from "@angular/core";
import type { Type } from "@angular/core";
import { RouterModule } from "@angular/router";
import type { Routes, LoadChildrenCallback } from "@angular/router";
import { CustomPreloadStrategy } from "@app/app.preload-strategy";
import type { NgModuleClass } from "@app/core/interfaces/ng-module-class.interface";

const routes: Routes = [
  {
    path: "",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/home/home.module").then(
        (m: { HomeModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.HomeModule
      )
  },
  {
    path: "account",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/account/account.module").then(
        (m: { AccountModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.AccountModule
      )
  },
  {
    path: "dev",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/dev/dev.module").then(
        (m: { DevModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.DevModule
      )
  },
  {
    path: "equipment",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/equipment/equipment.module").then(
        (m: { EquipmentModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.EquipmentModule
      )
  },
  {
    path: "explore",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/explore/explore.module").then(
        (m: { ExploreModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.ExploreModule
      )
  },
  {
    path: "i",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/image/image.module").then(
        (m: { ImageModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.ImageModule
      )
  },
  {
    path: "iotd",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/iotd/iotd.module").then(
        (m: { IotdModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.IotdModule
      )
  },
  {
    path: "notifications",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/notifications/notifications.module").then(
        (m: { NotificationsModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.NotificationsModule
      )
  },
  {
    path: "permission-denied",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/permission-denied/permission-denied.module").then(
        (m: { PermissionDeniedModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.PermissionDeniedModule
      )
  },
  {
    path: "search",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/search/search.module").then(
        (m: { SearchModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.SearchModule
      ),
    data: { preload: true }
  },
  {
    path: "subscriptions",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/subscriptions/subscriptions.module").then(
        (m: { SubscriptionsModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.SubscriptionsModule
      )
  },
  {
    path: "uploader",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/uploader/uploader.module").then(
        (m: { UploaderModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.UploaderModule
      )
  },
  {
    path: "u",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/users/user.module").then(
        (m: { UserModule: Type<NgModuleClass> }): Type<NgModuleClass> => m.UserModule
      ),
    data: { preload: true }
  },
  {
    path: "**",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/not-found-404/not-found-404.module").then(
        (m: { NotFound404Module: Type<NgModuleClass> }): Type<NgModuleClass> => m.NotFound404Module
      )
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: "reload",
      initialNavigation: "enabledBlocking",
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
      scrollOffset: [0, 64],
      preloadingStrategy: CustomPreloadStrategy
    })
  ],
  exports: [RouterModule],
  providers: [CustomPreloadStrategy]
})
export class AppRoutingModule {}
