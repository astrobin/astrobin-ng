import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    loadChildren: () => import("@features/home/home.module").then(m => m.HomeModule)
  },
  {
    path: "account",
    loadChildren: () => import("@features/account/account.module").then(m => m.AccountModule)
  },
  {
    path: "dev",
    loadChildren: () => import("@features/dev/dev.module").then(m => m.DevModule)
  },
  {
    path: "equipment",
    loadChildren: () => import("@features/equipment/equipment.module").then(m => m.EquipmentModule)
  },
  {
    path: "explore",
    loadChildren: () => import("@features/explore/explore.module").then(m => m.ExploreModule)
  },
  {
    path: "i",
    loadChildren: () => import("@features/image/image.module").then(m => m.ImageModule)
  },
  {
    path: "iotd",
    loadChildren: () => import("@features/iotd/iotd.module").then(m => m.IotdModule)
  },
  {
    path: "notifications",
    loadChildren: () => import("@features/notifications/notifications.module").then(m => m.NotificationsModule)
  },
  {
    path: "permission-denied",
    loadChildren: () =>
      import("@features/permission-denied/permission-denied.module").then(m => m.PermissionDeniedModule)
  },
  {
    path: "search",
    loadChildren: () => import("@features/search/search.module").then(m => m.SearchModule)
  },
  {
    path: "subscriptions",
    loadChildren: () => import("@features/subscriptions/subscriptions.module").then(m => m.SubscriptionsModule)
  },
  {
    path: "uploader",
    loadChildren: () => import("@features/uploader/uploader.module").then(m => m.UploaderModule)
  },
  {
    path: "u",
    loadChildren: () => import("@features/users/user.module").then(m => m.UserModule)
  },
  {
    path: "**",
    loadChildren: () => import("@features/not-found-404/not-found-404.module").then(m => m.NotFound404Module)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: "reload",
      initialNavigation: "enabledBlocking",
      scrollPositionRestoration: "disabled",
      anchorScrolling: "enabled",
      scrollOffset: [0, 64]
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
