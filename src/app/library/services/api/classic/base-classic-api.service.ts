import { environment } from "@env/environment";

export class BaseClassicApiService {
  protected baseUrl = environment.classicApiUrl + "/api/v2";
}
