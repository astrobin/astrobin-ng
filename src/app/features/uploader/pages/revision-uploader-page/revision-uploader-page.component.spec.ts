import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { RevisionUploaderPageComponent } from "@features/uploader/pages/revision-uploader-page/revision-uploader-page.component";
import { ReadOnlyModeComponent } from "@shared/components/misc/read-only-mode/read-only-mode.component";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockComponents } from "ng-mocks";

describe("RevisionUploader.PageComponent", () => {
  let component: RevisionUploaderPageComponent;
  let fixture: ComponentFixture<RevisionUploaderPageComponent>;

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
      declarations: [RevisionUploaderPageComponent, MockComponents(ReadOnlyModeComponent)]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionUploaderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
