import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { UploaderModule } from "@features/uploader/uploader.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

describe("Uploader.PageComponent", () => {
  let component: UploaderPageComponent;

  beforeEach(() =>
    MockBuilder(UploaderPageComponent, UploaderModule)
      .mock(AppModule, { export: true })
      .provide(provideMockStore({ initialState }))
  );

  beforeEach(() => {
    const fixture = MockRender(UploaderPageComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
