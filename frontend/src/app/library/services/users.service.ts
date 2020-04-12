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
}
