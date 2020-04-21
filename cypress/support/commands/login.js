Cypress.Commands.add("login", () => {
  cy.setCookie("classic-auth-token", "12345667890");
  // Cypress.Cookies.preserveOnce("classic-auth-token");
});
