import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { UploaderModule } from "@features/uploader/uploader.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

describe("Uploader.PageComponent", () => {
  let component: UploaderPageComponent;
  let store: MockStore;

  beforeEach(() =>
    MockBuilder(UploaderPageComponent, UploaderModule)
      .mock(AppModule)
      .provide(provideMockStore({ initialState }))
  );

  beforeEach(() => {
    store = TestBed.inject(MockStore);

    const fixture = MockRender(UploaderPageComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
