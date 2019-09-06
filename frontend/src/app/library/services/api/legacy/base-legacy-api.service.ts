import { environment } from "../../../../../environments/environment";

export class BaseLegacyApiService {
  protected baseUrl = environment.legacyApiUrl + "/api/v2";
}
