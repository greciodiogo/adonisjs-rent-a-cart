
    module.exports = (ApiRoute, Route) => {
  // Public routes (no authentication required)
  Route.post('api/orders', 'OrderController.store').namespace('App/Modules/Sales/Controllers');
  Route.get('api/orders/:id', 'OrderController.show').namespace('App/Modules/Sales/Controllers');
  
  // Protected routes (require authentication and ADMIN/MANAGER role)
  Route.group(() => {
    Route.get('orders', 'OrderController.index').middleware(['auth', 'role:ADMIN,MANAGER']);
    Route.put('orders/:id', 'OrderController.update').middleware(['auth', 'role:ADMIN,MANAGER']);
    Route.delete('orders/:id', 'OrderController.destroy').middleware(['auth', 'role:ADMIN,MANAGER']);
  }).prefix('api');
};
    