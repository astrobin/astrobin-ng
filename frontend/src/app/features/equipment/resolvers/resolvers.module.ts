import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VendorsResolver } from "@features/equipment/resolvers/vendors.resolver";

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    VendorsResolver
  ]
})
export class ResolversModule {
}
