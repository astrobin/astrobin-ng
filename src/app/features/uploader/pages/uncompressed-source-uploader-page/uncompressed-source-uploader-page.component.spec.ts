import {ActivatedRoute} from "@angular/router";
import {UncompressedSourceUploaderPageComponent} from "@features/uploader/pages/uncompressed-source-uploader-page/uncompressed-source-uploader-page.component";
import {ImageGenerator} from "@shared/generators/image.generator";
import {MockBuilder, MockProvider, MockRender} from "ng-mocks";
import {UploaderModule} from "@features/uploader/uploader.module";
import {AppModule} from "@app/app.module";
import {ThumbnailGroupApiService} from "@shared/services/api/classic/images-app/thumbnail-group/thumbnail-group-api.service";
import {EMPTY} from "rxjs";
import {UploadxService} from "ngx-uploadx";
import {ImageApiService} from "@shared/services/api/classic/images-app/image/image-api.service";

describe("UncompressedSourceUploader.PageComponent", () => {
  let component: UncompressedSourceUploaderPageComponent;

  beforeEach(() =>
    MockBuilder(UncompressedSourceUploaderPageComponent, UploaderModule)
      .mock(AppModule)
      .provide(MockProvider(ThumbnailGroupApiService, {
        getThumbnailGroup: () => EMPTY,
      }))
      .provide(MockProvider(UploadxService, {
        events: EMPTY,
      }))
      .provide(MockProvider(ImageApiService, {
        getImage: () => EMPTY,
      }))
      .provide({
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              image: ImageGenerator.image()
            }
          }
        }
      })
  );

  beforeEach(() => {
    const fixture = MockRender(UncompressedSourceUploaderPageComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
