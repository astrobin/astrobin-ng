import { TestBed } from "@angular/core/testing";
import { CommonApiServiceMock } from "@lib/services/api/classic/common/common-api.service-mock";
import { JsonApiService } from "@lib/services/api/classic/json/json-api.service";
import { JsonApiServiceMock } from "@lib/services/api/classic/json/json-api.service-mock";
import { CommonApiService } from "./api/classic/common/common-api.service";
import { AppContextService } from "./app-context.service";

describe("AppContextService", () => {
  let service: AppContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CommonApiService, useClass: CommonApiServiceMock },
        { provide: JsonApiService, useClass: JsonApiServiceMock }
      ]
    });
    service = TestBed.inject(AppContextService);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("currentUserProfile should be available", () => {
    service.loadForUser().then((contextService: AppContextService) => {
      contextService.get().subscribe(appContext => {
        expect(appContext.currentUserProfile.id).toEqual(1);
      });
    });
  });

  it("currentUser should be available", () => {
    service.loadForUser().then((contextService: AppContextService) => {
      contextService.get().subscribe(appContext => {
        expect(appContext.currentUser.id).toEqual(1);
      });
    });
  });
});
