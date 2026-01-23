
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.post("/auth/login", "AdminController.authenticateAsPartner")//.validator("AuthenticateUser");
    }, 'partner').namespace("App/Modules/Admin/Controllers");
    