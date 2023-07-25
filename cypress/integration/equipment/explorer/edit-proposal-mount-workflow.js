import { testMount, testMountEditProposal } from "../../../support/commands/equipment-item-browser-utils";

const testMountIncomplete = {
  ...testMount,
  type: "OTHER",
  weight: null,
  maxPayload: null
};

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutesForAllClasses();
    cy.setupEquipmentDefaultRoutesForBrands();
    cy.setupEquipmentDefaultRoutesForMounts();

    cy.route("GET", "**/api/v2/equipment/mount/?page=*", {
      count: 1,
      next: null,
      previous: null,
      results: [testMountIncomplete]
    }).as("findMounts");

    cy.route("get", "**/api/v2/equipment/mount-edit-proposal/?edit_proposal_target=*", { results: [] });
  });

  context("Edit proposal mount workflow", () => {
    it("should not have the 'Propose edit' button if logged out", () => {
      cy.visitPage("/equipment/explorer/mount");

      cy.equipmentItemBrowserSelectFirstMount("#equipment-item-field", "Test", testMountIncomplete);

      cy.get(".card .card-header").contains("Mount").should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("not.exist");
    });

    it("should have the 'Propose edit' button if logged in", () => {
      cy.login();
      cy.visitPage("/equipment/explorer/mount");

      cy.equipmentItemBrowserSelectFirstMount("#equipment-item-field", "Test", testMountIncomplete);

      cy.get(".card .card-header").contains("Mount").should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("be.visible");
    });

    it("should show all the prefilled data in the form", () => {
      cy.get("[data-test=propose-edit]").click();
      cy.get("astrobin-mount-editor").should("be.visible");
      cy.get("#equipment-item-field-name").should("have.value", testMountIncomplete.name);
      cy.ngSelectValueShouldContain("#mount-field-type", "Other");
      cy.get("#mount-field-max-payload").should("have.value", "");
      cy.get("#mount-field-weight").should("have.value", "");
    });

    it("should have the comment field", () => {
      cy.get("#equipment-item-field-edit-proposal-comment").should("be.visible");
    });

    it("should show warning if name is changed", () => {
      cy.route("get", "**/api/v2/equipment/mount/?name=*", {
        count: 0,
        next: null,
        previous: null,
        results: []
      }).as("findMountsByName");

      cy.get("#equipment-item-field-name").clear().type("Foo");

      cy.wait("@findMountsByName");

      cy.get(".alert-warning span").contains("Change the name only to fix a typo").should("be.visible");
    });

    it("should update some data", () => {
      cy.ngSelectType("#mount-field-type", "Equatorial");
      cy.ngSelectOptionClick("#mount-field-type", 1);
      cy.get("#mount-field-weight").type(10);
      cy.get("#mount-field-max-payload").type(20);
    });

    it("should submit the form", () => {
      cy.route("post", "**/api/v2/equipment/mount-edit-proposal/", testMountEditProposal).as("saveEditProposal");
      cy.route("get", "**/api/v2/equipment/mount-edit-proposal/?edit_proposal_target=*", {
        results: [testMountEditProposal]
      }).as("getEditProposals");

      cy.get("[data-test=propose-edit-confirm]").click();

      cy.get("astrobin-confirmation-dialog .modal-footer .btn-primary").click();

      cy.wait("@saveEditProposal");
      cy.wait("@getEditProposals");

      cy.get(".toast-message").contains("Your edit proposal has been submitted").should("be.visible");

      cy.get("astrobin-mount-editor").should("not.exist");
    });

    it("should show the new edit proposal on the page", () => {
      cy.get("astrobin-item-edit-proposal").should("be.visible");
      cy.get("astrobin-item-edit-proposal .edit-proposal astrobin-username .username").should(
        "contain",
        "AstroBin Dev"
      );
      cy.get("astrobin-item-edit-proposal").click();
      cy.get("astrobin-item-edit-proposal .change .before").contains("Test mount").should("be.visible");
      cy.get("astrobin-item-edit-proposal .change .after").contains("Test mount Pro").should("be.visible");
    });

    it("should have disabled buttons because the proposer cannot review", () => {
      cy.get("astrobin-item-edit-proposal .btn").contains("Approve edit…").should("be.visible").should("be.disabled");
      cy.get(".approve-disabled-reason")
        .contains("You cannot approve this edit proposal because you were the one who proposed it.")
        .should("be.visible");
    });
  });
});
