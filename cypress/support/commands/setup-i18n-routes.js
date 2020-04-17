Cypress.Commands.add("setupI18nRoutes", () => {
  cy.route("GET", "**/jsi18n", "fixture:api/jsi18n.json").as("jsi18n");
});
