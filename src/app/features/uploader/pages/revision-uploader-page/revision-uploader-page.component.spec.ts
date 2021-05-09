import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { RevisionUploaderPageComponent } from "@features/uploader/pages/revision-uploader-page/revision-uploader-page.component";
import { UploaderModule } from "@features/uploader/uploader.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder, MockRender } from "ng-mocks";

describe("RevisionUploader.PageComponent", () => {
  beforeEach(() =>
    MockBuilder(RevisionUploaderPageComponent, UploaderModule)
      .mock(AppModule)
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
        }
      ])
      .provide(provideMockStore({ initialState }))
  );

  it("should create", () => {
    const fixture = MockRender(RevisionUploaderPageComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
