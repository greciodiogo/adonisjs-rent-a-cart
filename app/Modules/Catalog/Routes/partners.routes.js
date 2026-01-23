
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "PartnerController.index").middleware(['role:ADMIN,MANAGER']);
      Route.post("/", "PartnerController.store").middleware(['role:ADMIN,MANAGER']);
      Route.get("/:id", "PartnerController.show").middleware(['role:ADMIN,MANAGER,PARTNER']);
      Route.put("/:id", "PartnerController.update").middleware(['role:ADMIN,MANAGER,PARTNER']);
      Route.delete("/:id", "PartnerController.destroy").middleware(['role:ADMIN,MANAGER,PARTNER']);
    }, 'partners').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);
    