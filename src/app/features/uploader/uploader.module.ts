import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/uploader/uploader.routing";
import { SharedModule } from "@shared/shared.module";
import { UploadxModule } from "ngx-uploadx";
import { UploaderPageComponent } from "./pages/uploader-page/uploader-page.component";

@NgModule({
  declarations: [UploaderPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule, UploadxModule]
})
export class UploaderModule {}
