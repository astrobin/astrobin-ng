Cypress.Commands.add("equipmentItemSummaryShouldHaveItem", (container, brandName, itemName) => {
  cy.get(`${container} astrobin-equipment-item-summary .label strong`).should("contain", brandName);
  cy.get(`${container} astrobin-equipment-item-summary .label`).should("contain", itemName);
});

Cypress.Commands.add("equipmentItemSummaryShouldHaveProperty", (container, property, value) => {
  cy.get(`${container} astrobin-equipment-item-summary .property`)
    .contains(property)
    .find("+.property-value")
    .should("contain", value);
});
