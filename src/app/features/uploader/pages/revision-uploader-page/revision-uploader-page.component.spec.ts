import {ActivatedRoute} from "@angular/router";
import {RevisionUploaderPageComponent} from "@features/uploader/pages/revision-uploader-page/revision-uploader-page.component";
import {ImageGenerator} from "@shared/generators/image.generator";
import {MockBuilder, MockProvider, MockRender} from "ng-mocks";
import {UploaderModule} from "@features/uploader/uploader.module";
import {AppModule} from "@app/app.module";
import {ThumbnailGroupApiService} from "@shared/services/api/classic/images-app/thumbnail-group/thumbnail-group-api.service";
import {EMPTY} from "rxjs";
import {UploadxService} from "ngx-uploadx";

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
