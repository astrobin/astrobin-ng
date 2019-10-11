import { environment } from "@env/environment";

export class BaseLegacyApiService {
  protected baseUrl = environment.legacyApiUrl + "/api/v2";
}
