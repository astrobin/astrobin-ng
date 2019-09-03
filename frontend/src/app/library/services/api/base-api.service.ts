import { environment } from "../../../../environments/environment";

export class BaseApiService {
  protected baseUrl = environment.legacyApiUrl + "/api/v2";
}
