Cypress.Commands.add("visitPage", url => {
  cy.visit(url);
  cy.waitForInitializationRoutes();
  cy.wait(1000);
});
