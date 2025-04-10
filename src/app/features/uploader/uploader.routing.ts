import type { Routes } from "@angular/router";
import { ImageResolver } from "@core/resolvers/image.resolver";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { ImageOwnerGuardService } from "@core/services/guards/image-owner-guard.service";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { UploaderGuardService } from "@features/uploader/services/guards/uploader-guard.service";

import { RevisionUploaderPageComponent } from "./pages/revision-uploader-page/revision-uploader-page.component";
import { UncompressedSourceUploaderPageComponent } from "./pages/uncompressed-source-uploader-page/uncompressed-source-uploader-page.component";

export const uploaderRoutes: Routes = [
  {
    path: "",
    canActivate: [AuthGuardService],
    children: [
      {
        path: "",
        component: UploaderPageComponent
      },
      {
        path: "revision/:imageId",
        canActivate: [ImageOwnerGuardService],
        component: RevisionUploaderPageComponent,
        resolve: {
          image: ImageResolver
        }
      },
      {
        path: "uncompressed-source/:imageId",
        canActivate: [UploaderGuardService, ImageOwnerGuardService],
        component: UncompressedSourceUploaderPageComponent,
        resolve: {
          image: ImageResolver
        }
      }
    ]
  }
];
