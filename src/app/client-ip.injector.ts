import { InjectionToken } from "@angular/core";
import { makeStateKey } from "@angular/platform-browser";

export const CLIENT_IP = new InjectionToken<string>("clientIp");
export const CLIENT_IP_KEY = makeStateKey<string>("clientIp");
