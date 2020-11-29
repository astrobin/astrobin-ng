import {ActivatedRoute} from "@angular/router";
import {AppModule} from "@app/app.module";
import {RevisionUploaderPageComponent} from "@features/uploader/pages/revision-uploader-page/revision-uploader-page.component";
import {UploaderModule} from "@features/uploader/uploader.module";
import {ImageGenerator} from "@shared/generators/image.generator";
import {ThumbnailGroupApiService} from "@shared/services/api/classic/images-app/thumbnail-group/thumbnail-group-api.service";
import {MockBuilder, MockProvider, MockRender} from "ng-mocks";
import {UploadxService} from "ngx-uploadx";
import {EMPTY} from "rxjs";

describe("RevisionUploader.PageComponent", () => {
  beforeEach(() =>
    MockBuilder(RevisionUploaderPageComponent, UploaderModule)
      .mock(AppModule)
      .provide(MockProvider(ThumbnailGroupApiService, {
        getThumbnailGroup: () => EMPTY,
      }))
      .provide(MockProvider(UploadxService, {
        events: EMPTY,
      }))
      .provide([
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                image: ImageGenerator.image()
              }
            }
          }
        },
      ])
  );

  it("should create", () => {
    const fixture = MockRender(RevisionUploaderPageComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
