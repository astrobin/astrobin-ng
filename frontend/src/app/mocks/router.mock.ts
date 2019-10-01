declare let jasmine;

export class RouterMock {
  public navigate = jasmine.createSpy("navigate");
}
