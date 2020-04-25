import { Injectable } from "@angular/core";
import { TitleServiceInterface } from "@lib/services/title/title.service-interface";

@Injectable({
  providedIn: "root"
})
export class TitleServiceMock implements TitleServiceInterface {
  public setTitle(newTitle: string) {}
}
