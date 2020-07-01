import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { ReadOnlyModeComponent } from "@shared/components/misc/read-only-mode/read-only-mode.component";
import { MockComponents } from "ng-mocks";

describe("Uploader.PageComponent", () => {
  let component: UploaderPageComponent;
  let fixture: ComponentFixture<UploaderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: testAppProviders,
      declarations: [UploaderPageComponent, MockComponents(ReadOnlyModeComponent)]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
