import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { TitleServiceInterface } from "@shared/services/title/title.service-interface";

@Injectable({
  providedIn: "root"
})
export class TitleServiceMock extends BaseService implements TitleServiceInterface {
  public setTitle(newTitle: string) {}
}
