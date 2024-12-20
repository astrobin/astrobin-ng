import { IotdInterface } from "@features/iotd/services/iotd-api.service";

export class IotdGenerator {
  static iotd(): IotdInterface {
    return {
      id: 1,
      judge: 1,
      image: 1,
      date: "2021-01-01T00:00:00",
      thumbnail: "https://example.com/thumbnail.jpg",
      title: "IOTD",
      userDisplayNames: "user"
    };
  }
}
