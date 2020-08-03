import { environment } from "@env/environment";
import { BaseService } from "@shared/services/base.service";

export class BaseClassicApiService extends BaseService {
  protected readonly baseUrl = environment.classicApiUrl + "/api/v2";
}
