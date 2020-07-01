import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { PermissionDeniedPageComponent } from "./permission-denied-page.component";

describe("PermissionDeniedPageComponent", () => {
  let component: PermissionDeniedPageComponent;
  let fixture: ComponentFixture<PermissionDeniedPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      declarations: [PermissionDeniedPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionDeniedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
