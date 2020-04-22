import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "login",
    loadChildren: () => import("@features/login/login.module").then(m => m.LoginModule)
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
