import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { UncompressedSourceUploaderPageComponent } from "@features/uploader/pages/uncompressed-source-uploader-page/uncompressed-source-uploader-page.component";
import { UploaderModule } from "@features/uploader/uploader.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder, MockRender } from "ng-mocks";

describe("UncompressedSourceUploader.PageComponent", () => {
  let component: UncompressedSourceUploaderPageComponent;

  beforeEach(() =>
    MockBuilder(UncompressedSourceUploaderPageComponent, UploaderModule)
      .mock(AppModule, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
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
        UtilsService
      ])
  );

  beforeEach(() => {
    const fixture = MockRender(UncompressedSourceUploaderPageComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
