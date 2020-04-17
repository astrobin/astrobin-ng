import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { of } from "rxjs";
import { CommonApiService } from "./common-api.service";

describe("CommonApiService", () => {
  let service: CommonApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommonApiService]
    });

    service = TestBed.inject(CommonApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getUser should work", () => {
    const user = UserGenerator.user();

    service.getUser(user.id).subscribe(response => {
      expect(response.id).toEqual(user.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/users/${user.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(user);
  });

  it("getCurrentUserProfile should return the authenticated user", () => {
    const userProfile = UserProfileGenerator.userProfile();

    service.getCurrentUserProfile().subscribe(response => {
      expect(response.user).toEqual(userProfile.user);
    });

    const req = httpMock.expectOne(`${service.configUrl}/userprofiles/current/`);
    expect(req.request.method).toBe("GET");
    req.flush([userProfile]);
  });

  it("getCurrentUserProfile should return null if not authenticated", () => {
    service.getCurrentUserProfile().subscribe(response => {
      expect(response).toEqual(null);
    });

    const req = httpMock.expectOne(`${service.configUrl}/userprofiles/current/`);
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("isAuthenticated should return false if there is no current user profile", () => {
    jest.spyOn(service, "getCurrentUserProfile").mockReturnValue(of(null));
    service.isAuthenticated().subscribe(response => {
      expect(response).toBe(false);
    });
  });

  it("isAuthenticated should return true if there is a current user profile", () => {
    jest.spyOn(service, "getCurrentUserProfile").mockReturnValue(of(UserProfileGenerator.userProfile()));
    service.isAuthenticated().subscribe(response => {
      expect(response).toBe(true);
    });
  });

  it("getUserSubscriptions should return list", () => {
    service.getUserSubscriptions().subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].user).toBe(1);
    });

    const req = httpMock.expectOne(`${service.configUrl}/usersubscriptions/`);
    expect(req.request.method).toBe("GET");
    req.flush([{ user: 1 } as UserSubscriptionInterface]);
  });

  it("getUserSubscriptions should apply filter", () => {
    service.getUserSubscriptions(UserGenerator.user()).subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].user).toBe(1);
    });

    const req = httpMock.expectOne(`${service.configUrl}/usersubscriptions/?user=1`);
    expect(req.request.method).toBe("GET");
    req.flush([{ user: 1 } as UserSubscriptionInterface]);
  });
});
