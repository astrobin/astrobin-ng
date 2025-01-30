import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UploaderGuardService } from "@features/uploader/services/guards/uploader-guard.service";
import { uploaderRoutes } from "@features/uploader/uploader.routing";
import { SharedModule } from "@shared/shared.module";
import { UploadxModule } from "ngx-uploadx";
import { RevisionUploaderPageComponent } from "./pages/revision-uploader-page/revision-uploader-page.component";
import { UncompressedSourceUploaderPageComponent } from "./pages/uncompressed-source-uploader-page/uncompressed-source-uploader-page.component";
import { UploaderPageComponent } from "./pages/uploader-page/uploader-page.component";

@NgModule({
  declarations: [RevisionUploaderPageComponent, UncompressedSourceUploaderPageComponent, UploaderPageComponent],
  imports: [
    RouterModule.forChild(uploaderRoutes),
    SharedModule,
    UploadxModule
  ],
  providers: [UploaderGuardService]
})
export class UploaderModule {
}
