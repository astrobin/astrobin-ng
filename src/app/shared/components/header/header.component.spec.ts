import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { UsernameComponent } from "@shared/components/misc/username/username.component";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { IsContentModeratorPipe } from "@shared/pipes/is-content-moderator.pipe";
import { IsImageModeratorPipe } from "@shared/pipes/is-image-moderator.pipe";
import { IsIotdJudgePipe } from "@shared/pipes/is-iotd-judge.pipe";
import { IsIotdReviewerPipe } from "@shared/pipes/is-iotd-reviewer.pipe";
import { IsIotdStaffPipe } from "@shared/pipes/is-iotd-staff.pipe";
import { IsIotdSubmitterPipe } from "@shared/pipes/is-iotd-submitter.pipe";
import { IsProducerPipe } from "@shared/pipes/is-producer.pipe";
import { IsSuperUserPipe } from "@shared/pipes/is-superuser.pipe";
import { AppContextInterface, AppContextService } from "@shared/services/app-context/app-context.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { MockComponents, MockPipe } from "ng-mocks";
import { Observable } from "rxjs";
import { HeaderComponent } from "./header.component";

class MockAppContextService {
  context$ = new Observable<AppContextInterface>(observer => {
    observer.next({
      currentUserProfile: UserProfileGenerator.userProfile()
    } as AppContextInterface);
  });
}

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: [{ provide: AppContextService, useClass: MockAppContextService }, WindowRefService],
      declarations: [
        HeaderComponent,
        MockComponents(UsernameComponent),
        MockPipe(IsContentModeratorPipe),
        MockPipe(IsImageModeratorPipe),
        MockPipe(IsSuperUserPipe),
        MockPipe(IsIotdStaffPipe),
        MockPipe(IsIotdSubmitterPipe),
        MockPipe(IsIotdReviewerPipe),
        MockPipe(IsIotdJudgePipe),
        MockPipe(IsProducerPipe)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("openLoginModal", () => {
    it("should defer to modalService", () => {
      spyOn(component.modalService, "open");
      const mockEvent = {
        preventDefault: jest.fn()
      };

      component.openLoginModal(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.modalService.open).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should defer to authService", () => {
      spyOn(component.authService, "logout");
      const mockEvent = {
        preventDefault: jest.fn()
      };

      component.logout(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.authService.logout).toHaveBeenCalled();
    });
  });
});
