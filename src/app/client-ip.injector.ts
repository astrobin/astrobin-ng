import { InjectionToken, makeStateKey } from "@angular/core";

export const CLIENT_IP = new InjectionToken<string>("clientIp");
export const CLIENT_IP_KEY = makeStateKey<string>("clientIp");
