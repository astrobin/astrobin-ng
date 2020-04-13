import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  exports: [CommonModule, FontAwesomeModule, TranslateModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
