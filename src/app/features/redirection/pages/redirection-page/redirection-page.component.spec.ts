import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RedirectionPageComponent } from "./redirection-page.component";

describe("RedirectionPageComponent", () => {
  let component: RedirectionPageComponent;
  let fixture: ComponentFixture<RedirectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedirectionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
