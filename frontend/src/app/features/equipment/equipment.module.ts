import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VendorCreatePageComponent } from "./components/vendor-create-page/vendor-create.page-component";
import { EquipmentRoutingModule } from "./equipment-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { VendorComponent } from "./containers/vendor/vendor.component";
import { VendorCheckSimilarPageComponent } from "./components/vendor-check-similar-page/vendor-check-similar.page-component";
import { VendorDetailPageComponent } from "./components/vendor-detail-page/vendor-detail.page-component";
import { PipesModule } from "@library/pipes/pipes.module";
import { ComponentsModule } from "@library/components/components.module";
import { ResolversModule } from "@features/equipment/resolvers/resolvers.module";
import { VendorListPageComponent } from "@features/equipment/components/vendor-list-page/vendor-list.page-component";
import { VendorListComponent } from "@features/equipment/containers/vendor-list/vendor-list.component";

@NgModule({
  declarations: [
    VendorCheckSimilarPageComponent,
    VendorComponent,
    VendorCreatePageComponent,
    VendorDetailPageComponent,
    VendorListComponent,
    VendorListPageComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    EquipmentRoutingModule,
    FormlyModule.forChild(),
    PipesModule,
    ReactiveFormsModule,
    ResolversModule,
    TranslateModule,
  ],
})
export class EquipmentModule {
}
