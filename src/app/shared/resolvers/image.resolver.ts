import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { SetImage } from "@app/store/actions/image.actions";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { EMPTY, Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ImageInterface } from "../interfaces/image.interface";

@Injectable({
  providedIn: "root"
})
export class ImageResolver implements Resolve<ImageInterface> {
  constructor(
    private readonly service: ImageApiService,
    private readonly router: Router,
    private readonly location: Location,
    private readonly store$: Store<State>
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const id = route.paramMap.get("imageId");

    return this.service.getImage(id).pipe(
      tap(image => {
        this.store$.dispatch(new SetImage(image));
      }),
      catchError(err => {
        this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
          this.location.replaceState(state.url);
        });
        return EMPTY;
      })
    );
  }
}
