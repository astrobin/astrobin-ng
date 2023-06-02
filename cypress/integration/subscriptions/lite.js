/// <reference types="cypress" />

context("lite", () => {
  describe("when logged out", () => {
    it("should redirect to the login page", () => {
      cy.server();
      cy.setupInitializationRoutes();
      cy.route("get", "**/common/userprofiles/current", []).as("getCurrentUserProfile");
      cy.visitPage("/subscriptions/lite");
      cy.url().should("contain", "/account/logging-in");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      cy.server();
      cy.setupInitializationRoutes();

      cy.route("get", "**/payments/pricing/available-subscriptions/", {
        nonAutorenewingSupported: true,
        subscriptions: [
          { name: "AstroBin Lite 2020+", displayName: "Lite" },
          { name: "AstroBin Premium 2020+", displayName: "Premium" },
          { name: "AstroBin Ultimate 2020+", displayName: "Ultimate" }
        ]
      }).as("availableSubscriptions");

      cy.route("get", "**/payments/pricing/lite/USD/yearly/", {
        discount: 0,
        price: 20,
        fullPrice: 20,
        prorateAmount: 0
      }).as("pricing");

      cy.route("get", "**/payments/pricing/lite/USD/monthly/", {
        discount: 0,
        price: 2.5,
        fullPrice: 20,
        prorateAmount: 0
      }).as("pricingMonthly");

      cy.route("get", "**/images/image/?user=1", {}).as("userImages");

      cy.route("get", "**/images/image/public-images-count/?user=1", "0").as("userImages");

      cy.login();
    });

    it("should show correct header", () => {
      cy.visitPage("/subscriptions/lite");
      cy.get("h1 > span").contains("Lite").should("exist");
    });

    it("should not allow purchase if the user is on Lite", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_1_lite.json").as(
        "getUserSubscriptions"
      );
      cy.visitPage("/subscriptions/lite");
      cy.get(".already-subscribed").should("exist");
      cy.get(".buy.btn").should("not.exist");
    });

    it("should not allow purchase if the user is on Premium", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_1_premium.json").as(
        "getUserSubscriptions"
      );
      cy.visitPage("/subscriptions/lite");
      cy.get(".already-subscribed").should("not.exist");
      cy.get(".buy.btn").should("exist").click();
      cy.get(".modal").contains("You are already subscribed to a higher plan").should("be.visible");
    });

    it("should not allow purchase if the user is on Ultimate", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_1_ultimate.json").as(
        "getUserSubscriptions"
      );
      cy.visitPage("/subscriptions/lite");
      cy.get(".already-subscribed").should("not.exist");
      cy.get(".buy.btn").should("exist").click();
      cy.get(".modal").contains("You are already subscribed to a higher plan").should("be.visible");
    });

    it("should allow purchase if the user is not already subscribed", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", []).as("getUserSubscriptions");
      cy.visitPage("/subscriptions/lite");
      cy.get(".already-subscribed.alert").should("not.exist");
      cy.get(".already-subscribed-higher.alert").should("not.exist");
      cy.get(".price").should("contain", "$20.00");
      cy.get(".buy.btn").should("exist");
    });

    it("should not show warning about 50 images if use has less than 50 images", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", []).as("getUserSubscriptions");
      cy.route("get", "**/images/image/public-images-count/?user=1", "49").as("userImages");
      cy.visitPage("/subscriptions/lite");
      cy.get(".lite-limit.alert").should("not.exist");
    });

    it("should show warning about 50 images if use has 25 images", () => {
      cy.route("get", "**/common/usersubscriptions/?user=*", []).as("getUserSubscriptions");
      cy.route("get", "**/images/image/public-images-count/?user=1", "50").as("userImages");
      cy.visitPage("/subscriptions/lite");
      cy.get(".lite-limit.alert").should("exist");
    });
  });
});
