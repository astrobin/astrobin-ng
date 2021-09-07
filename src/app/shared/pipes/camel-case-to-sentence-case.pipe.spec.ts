import { CamelCaseToSentenceCasePipe } from "./camel-case-to-sentence-case.pipe";

describe("CamelCaseToSentenceCasePipe", () => {
  it("create an instance", () => {
    const pipe = new CamelCaseToSentenceCasePipe();
    expect(pipe).toBeTruthy();
  });
});
