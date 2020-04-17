import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { ServicesModule } from "@lib/services/services.module";
import { ComponentsModule } from "./components/components.module";
import { PipesModule } from "./pipes/pipes.module";

@NgModule({
  imports: [CommonModule, ComponentsModule, HttpClientModule, PipesModule, ServicesModule],
  exports: [ComponentsModule, HttpClientModule, PipesModule, ServicesModule]
})
export class LibraryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibraryModule
    };
  }
}
