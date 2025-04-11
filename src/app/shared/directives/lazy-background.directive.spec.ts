import { DebugElement, Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { LazyBackgroundDirective } from "./lazy-background.directive";

@Component({
  template: `
    <div
      [highResolutionUrl]="highResUrl"
      [useHighResolution]="useHighRes"
      astrobinLazyBackground="regular-url.jpg"
    ></div>
  `
})
class TestComponent {
  highResUrl = "high-res-url.jpg";
  useHighRes = false;
}

describe("LazyBackgroundDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directiveElement: DebugElement;
  let directive: LazyBackgroundDirective;

  // Mock IntersectionObserver
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Store the original
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeAll(() => {
    // Mock it for tests
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterAll(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LazyBackgroundDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(LazyBackgroundDirective));
    directive = directiveElement.injector.get(LazyBackgroundDirective);
  });

  it("should create an instance", () => {
    expect(directive).toBeTruthy();
  });

  it("should set position relative on the element", () => {
    expect(directiveElement.nativeElement.style.position).toBe("relative");
  });

  it("should implement OnChanges", () => {
    expect(directive.ngOnChanges).toBeDefined();
  });

  it("should initialize IntersectionObserver on init", () => {
    directive.ngOnInit();
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  describe("basic directive functionality", () => {
    it("should create a directive instance with inputs set correctly", () => {
      // Change the component inputs
      component.useHighRes = true;
      component.highResUrl = "new-high-res.jpg";
      fixture.detectChanges();

      // Get the directive instance
      const updatedDirective = directiveElement.injector.get(LazyBackgroundDirective);

      // Verify inputs are passed correctly
      expect(updatedDirective.useHighResolution).toBe(true);
      expect(updatedDirective.highResolutionUrl).toBe("new-high-res.jpg");
    });
  });
});
