import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";

describe("Uploader.PageComponent", () => {
  let component: UploaderPageComponent;
  let fixture: ComponentFixture<UploaderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploaderPageComponent]
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
