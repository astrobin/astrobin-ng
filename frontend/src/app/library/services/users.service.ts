import { Injectable } from "@angular/core";
import { UserProfileModel } from "../models/common/userprofile.model";
import { AppContextService } from "./app-context.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private appContext: AppContextService) {
  }

  public hasValidRawDataSubscription(user: UserProfileModel): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.appContext.get().subscribe(appContext => {
        const subscriptions = appContext.subscriptions;
        if (!subscriptions) {
          observer.next(false);
        }

        if (!user.userSubscriptionObjects) {
          observer.next(false);
        }

        const ids = subscriptions.filter(s => s.category === "rawdata").map(s => s.id);

        observer.next(user.userSubscriptionObjects.filter(us => {
          return ids.indexOf(us.subscription) > -1 && us.valid;
        }).length > 0);

        observer.complete();
      });
    });
  }
}
