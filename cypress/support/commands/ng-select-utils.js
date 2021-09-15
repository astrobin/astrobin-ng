Cypress.Commands.add("ngSelectType", (selector, text) => {
  cy.get(`${selector} .ng-input input`).type(text);
});

Cypress.Commands.add("ngSelectShouldHaveOptionsCount", (selector, count) => {
  cy.get(`${selector} .ng-option`).should("have.length", count);
});

Cypress.Commands.add("ngSelectOptionNumberSelectorShouldContain", (selector, childNumber, childSelector, text) => {
  cy.get(`${selector} .ng-option:nth-child(${childNumber}) ${childSelector}`).should("contain", text);
});

Cypress.Commands.add("ngSelectOptionClick", (selector, childNumber) => {
  cy.get(`${selector} .ng-option:nth-child(${childNumber})`).click("top");
});

Cypress.Commands.add("ngSelectValueShouldContain", (selector, text) => {
  cy.get(`${selector} .ng-value`).should("contain", text);
});

Cypress.Commands.add("ngSelectOpen", selector => {
  cy.get(`${selector} .ng-input input`).click();
});
