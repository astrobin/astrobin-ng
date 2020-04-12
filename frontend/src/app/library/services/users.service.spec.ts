import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppContextService, IAppContext } from "./app-context.service";

import { UsersService } from "./users.service";
import { Observable } from "rxjs";

class MockAppContextService {
  get = jest.fn(
    () => new Observable<IAppContext>(observer => {
      observer.next({
        currentUserProfile: null,
        subscriptions: [],
      });
    }));
}

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: AppContextService,
          useClass: MockAppContextService,
        },
      ],
    });

    service = TestBed.get(UsersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
