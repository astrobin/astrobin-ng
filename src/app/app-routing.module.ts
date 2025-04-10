import { NgModule } from "@angular/core";
import type { Type } from "@angular/core";
import { RouterModule } from "@angular/router";
import type { Routes, LoadChildrenCallback } from "@angular/router";
import { CustomPreloadStrategy } from "@app/app.preload-strategy";

const routes: Routes = [
  {
    path: "",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/home/home.module").then((m: { HomeModule: Type<unknown> }): Type<unknown> => m.HomeModule)
  },
  {
    path: "account",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/account/account.module").then(
        (m: { AccountModule: Type<unknown> }): Type<unknown> => m.AccountModule
      )
  },
  {
    path: "dev",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/dev/dev.module").then((m: { DevModule: Type<unknown> }): Type<unknown> => m.DevModule)
  },
  {
    path: "equipment",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/equipment/equipment.module").then(
        (m: { EquipmentModule: Type<unknown> }): Type<unknown> => m.EquipmentModule
      )
  },
  {
    path: "explore",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/explore/explore.module").then(
        (m: { ExploreModule: Type<unknown> }): Type<unknown> => m.ExploreModule
      )
  },
  {
    path: "i",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/image/image.module").then((m: { ImageModule: Type<unknown> }): Type<unknown> => m.ImageModule)
  },
  {
    path: "iotd",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/iotd/iotd.module").then((m: { IotdModule: Type<unknown> }): Type<unknown> => m.IotdModule)
  },
  {
    path: "notifications",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/notifications/notifications.module").then(
        (m: { NotificationsModule: Type<unknown> }): Type<unknown> => m.NotificationsModule
      )
  },
  {
    path: "permission-denied",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/permission-denied/permission-denied.module").then(
        (m: { PermissionDeniedModule: Type<unknown> }): Type<unknown> => m.PermissionDeniedModule
      )
  },
  {
    path: "search",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/search/search.module").then(
        (m: { SearchModule: Type<unknown> }): Type<unknown> => m.SearchModule
      ),
    data: { preload: true }
  },
  {
    path: "subscriptions",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/subscriptions/subscriptions.module").then(
        (m: { SubscriptionsModule: Type<unknown> }): Type<unknown> => m.SubscriptionsModule
      )
  },
  {
    path: "uploader",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/uploader/uploader.module").then(
        (m: { UploaderModule: Type<unknown> }): Type<unknown> => m.UploaderModule
      )
  },
  {
    path: "u",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/users/user.module").then((m: { UserModule: Type<unknown> }): Type<unknown> => m.UserModule),
    data: { preload: true }
  },
  {
    path: "**",
    loadChildren: (): ReturnType<LoadChildrenCallback> =>
      import("@features/not-found-404/not-found-404.module").then(
        (m: { NotFound404Module: Type<unknown> }): Type<unknown> => m.NotFound404Module
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
