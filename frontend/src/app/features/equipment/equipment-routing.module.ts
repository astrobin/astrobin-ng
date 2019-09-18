import { RouterModule, Routes } from "@angular/router";
import { VendorCreatePageComponent } from "./components/vendor-create-page/vendor-create.page-component";
import { NgModule } from "@angular/core";
import { VendorCheckSimilarPageComponent } from "@features/equipment/components/vendor-check-similar-page/vendor-check-similar.page-component";
import { VendorDetailPageComponent } from "@features/equipment/components/vendor-detail-page/vendor-detail.page-component";
import { VendorsResolver } from "@features/equipment/resolvers/vendors.resolver";
import { VendorListPageComponent } from "@features/equipment/components/vendor-list-page/vendor-list.page-component";

const routes: Routes = [
  {
    path: "vendors",
    children: [
      {
        path: "create",
        component: VendorCreatePageComponent,
      },
      {
        path: "create/check-similar",
        component: VendorCheckSimilarPageComponent,
      },
      {
        path: ":id",
        component: VendorDetailPageComponent,
      },
      {
        path: "",
        component: VendorListPageComponent,
        resolve: {
          vendors: VendorsResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquipmentRoutingModule {
}
