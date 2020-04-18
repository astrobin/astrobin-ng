Cypress.Commands.add("setupAuthToken", () => {
  window.localStorage.setItem("classic-auth-token", "foo");
});
