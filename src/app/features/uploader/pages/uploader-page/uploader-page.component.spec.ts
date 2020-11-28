import {UploaderPageComponent} from "@features/uploader/pages/uploader-page/uploader-page.component";
import {MockBuilder, MockProvider, MockRender} from "ng-mocks";
import {UploaderModule} from "@features/uploader/uploader.module";
import {AppModule} from "@app/app.module";
import {UserSubscriptionService} from "@shared/services/user-subscription/user-subscription.service";
import {EMPTY} from "rxjs";
import {UploadxService} from "ngx-uploadx";

describe("Uploader.PageComponent", () => {
  let component: UploaderPageComponent;

  beforeEach(() =>
    MockBuilder(UploaderPageComponent, UploaderModule)
      .mock(AppModule)
      .provide(MockProvider(UserSubscriptionService, {
        fileSizeAllowed: () => EMPTY,
      }))
      .provide(MockProvider(UploadxService, {
        events: EMPTY,
      }))
  );

  beforeEach(() => {
    const fixture = MockRender(UploaderPageComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
