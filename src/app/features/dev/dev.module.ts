import { NgModule } from "@angular/core";

import { SharedModule } from "@shared/shared.module";
import { DevRoutingModule } from "./dev-routing.module";
import { ImageTestPageComponent } from "./image-test-page/image-test-page.component";
import { NestedCommentsTestPageComponent } from "./nested-comments-test-page/nested-comments-test-page.component";

@NgModule({
  declarations: [ImageTestPageComponent, NestedCommentsTestPageComponent],
  imports: [DevRoutingModule, SharedModule]
})
export class DevModule {}
