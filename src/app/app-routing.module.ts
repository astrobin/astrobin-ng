import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "account",
    loadChildren: () => import("@features/account/account.module").then(m => m.AccountModule)
  },
  {
    path: "notifications",
    loadChildren: () => import("@features/notifications/notifications.module").then(m => m.NotificationsModule)
  },
  {
    path: "**",
    loadChildren: () => import("@features/not-found-404/not-found-404.module").then(m => m.NotFound404Module)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
