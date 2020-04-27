import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleServiceInterface } from "@shared/services/title/title.service-interface";

@Injectable({
  providedIn: "root"
})
export class TitleService implements TitleServiceInterface {
  constructor(public titleService: Title) {}

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle + " - AstroBin");
  }
}
