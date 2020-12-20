import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageTestPageComponent } from "./image-test-page.component";

describe("ImageTestPageComponent", () => {
  let component: ImageTestPageComponent;
  let fixture: ComponentFixture<ImageTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageTestPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
