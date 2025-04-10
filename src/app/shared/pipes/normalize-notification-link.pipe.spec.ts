import { NormalizeNotificationLinkPipe } from "./normalize-notification-link.pipe";

jest.mock("@env/environment.prod", () => ({
  environment: {
    classicBaseUrl: "https://www.astrobin.com"
  }
}));

describe("NormalizeNotificationLinkPipe", () => {
  it("create an instance", () => {
    const pipe = new NormalizeNotificationLinkPipe();
    expect(pipe).toBeTruthy();
  });

  it("should transform href", () => {
    const pipe = new NormalizeNotificationLinkPipe();
    expect(pipe.transform(`<a href="/foo">Foo</a>`)).toEqual(`<a href="https://www.astrobin.com/foo">Foo</a>`);
  });

  it("should transform multiple href", () => {
    const pipe = new NormalizeNotificationLinkPipe();
    expect(pipe.transform(`<a href="/foo">Foo</a> said <a href="/bar">Bar</a>`)).toEqual(
      `<a href="https://www.astrobin.com/foo">Foo</a> said <a href="https://www.astrobin.com/bar">Bar</a>`
    );
  });
});
