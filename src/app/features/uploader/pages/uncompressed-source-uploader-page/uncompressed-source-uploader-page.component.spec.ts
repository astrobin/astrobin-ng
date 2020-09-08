import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { UncompressedSourceUploaderPageComponent } from "@features/uploader/pages/uncompressed-source-uploader-page/uncompressed-source-uploader-page.component";
import { ReadOnlyModeComponent } from "@shared/components/misc/read-only-mode/read-only-mode.component";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockComponents } from "ng-mocks";

describe("UncompressedSourceUploader.PageComponent", () => {
  let component: UncompressedSourceUploaderPageComponent;
  let fixture: ComponentFixture<UncompressedSourceUploaderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: [
        ...testAppProviders,
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
      ],
      declarations: [UncompressedSourceUploaderPageComponent, MockComponents(ReadOnlyModeComponent)]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UncompressedSourceUploaderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
