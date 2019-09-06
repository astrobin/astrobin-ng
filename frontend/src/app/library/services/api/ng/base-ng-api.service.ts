import { environment } from "../../../../../environments/environment";

export class BaseNgApiService {
  protected baseUrl = environment.ngApiUrl;
}
