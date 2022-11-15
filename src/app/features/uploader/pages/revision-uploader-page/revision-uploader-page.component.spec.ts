import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { RevisionUploaderPageComponent } from "@features/uploader/pages/revision-uploader-page/revision-uploader-page.component";
import { UploaderModule } from "@features/uploader/uploader.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder, MockRender } from "ng-mocks";
import { ComponentFixture } from "@angular/core/testing";

describe("RevisionUploader.PageComponent", () => {
  let fixture: ComponentFixture<RevisionUploaderPageComponent>;
  let component: RevisionUploaderPageComponent;

  beforeEach(() =>
    MockBuilder(RevisionUploaderPageComponent, UploaderModule)
      .mock(AppModule, { export: true })
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

  beforeEach(() => {
    fixture = MockRender(RevisionUploaderPageComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
