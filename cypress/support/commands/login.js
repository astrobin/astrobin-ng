Cypress.Commands.add("login", (username, password) => {
  cy.get("#login-button").click();
  cy.get("#handle").type("astrobin_dev");
  cy.get("#password").type("astrobin_dev");
  cy.get("#login-form .btn[type=submit]").click();
});
