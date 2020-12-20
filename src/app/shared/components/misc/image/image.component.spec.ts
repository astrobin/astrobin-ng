import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageComponent } from "./image.component";

describe("ImageComponent", () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("isPlaceholder", () => {
    it("should be true if the url contains the word 'placeholder'", () => {
      expect(component.isPlaceholder("https://www.astrobin.com/static/images/placeholder-gallery.jpg")).toBe(true);
    });

    it("should be false if the url does not contain the word 'placeholder'", () => {
      expect(component.isPlaceholder("https://cdn.astrobin.com/thumbs/llfoDOGMKjw2_1000x380_RSLeFbX4.jpg")).toBe(true);
    });
  });

  describe("makeUrl", () => {
    it("should return a placeholder if the image is not ready", () => {
      jest.spyOn(component, "isPlaceholder").mockReturnValue(true);
      jest.spyOn(component.imageService, "getPlaceholder").mockReturnValue("placeholder");

      expect(component.makeUrl("foo")).toEqual("placeholder");
    });

    it("should return the url itself if the image is ready", () => {
      jest.spyOn(component, "isPlaceholder").mockReturnValue(false);

      expect(component.makeUrl("foo")).toEqual("foo");
    });
  });
});
