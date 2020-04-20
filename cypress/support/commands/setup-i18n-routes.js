Cypress.Commands.add("setupI18nRoutes", () => {
  cy.route("GET", "**/json-api/i18n/messages/*", "fixture:api/i18n.txt").as("i18n");
});
