
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/products/partner", "AdminController.getProductsByPartner").middleware(['role:PARTNER,ADMIN']);
      Route.get("/partner/info", "AdminController.getPartnerInfo").middleware(['role:PARTNER,ADMIN']);
      Route.get("/partner/notifications", "AdminController.getNotificationsByPartner").middleware(['role:PARTNER']);
      Route.get("/partner/orders", "AdminController.getAllOrdersByPartner").middleware(['role:PARTNER,ADMIN,MANAGER']);
      Route.get("/partner/orders/:id", "AdminController.getOrderByPartner").middleware(['role:PARTNER,ADMIN,MANAGER']);
      Route.post("/order/:id/acceptOrderByPartner", "AdminController.acceptOrderByPartner").middleware(['role:PARTNER,ADMIN,MANAGER']);
      Route.post("/order/:id/cancelOrderByPartner", "AdminController.cancelOrderByPartner").middleware(['role:PARTNER,ADMIN,MANAGER']);
      
      Route.get("/client/orders", "AdminController.findAllOrderByClient").middleware(['role:CUSTOMER'])
      Route.get("/client/info", "AdminController.getClientInfo").middleware(['role:CUSTOMER']);
      Route.get("/client/notifications", "AdminController.getNotificationsByUser").middleware(['role:CUSTOMER']);

    }, 'admin').namespace("App/Modules/Admin/Controllers").middleware(["auth"]);
    