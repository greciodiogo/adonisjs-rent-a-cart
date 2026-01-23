
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const ProductsService = use('App/Modules/Catalog/Services/ProductsService')
const PartnerService = use('App/Modules/Catalog/Services/PartnerService')
const PartnerOrderService = use('App/Modules/Sales/Services/PartnerOrderService')
const OrderService = use('App/Modules/Sales/Services/OrderService')
const AuthenticatedRepository = use('App/Modules/Security/Auth/Repositories/AuthenticatedRepository')
const User = use('App/Modules/Security/Users/Models/User')
const NotFoundException = use("App/Exceptions/NotFoundException");
const NotificationService = use('App/Modules/Notification/Services/NotificationService')
const UsersService = use('App/Modules/Authentication/Services/UsersService')


/**
 * Resourceful controller for interacting with icttrunkouts
 */
class AdminController{
 
  async getProductsByPartner ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const partner = await new PartnerService().findPartnerByUserId(UserId)
    const partnerId = partner.id;
    const data = await new ProductsService().getProductsByPartner(filters, partnerId);
    return response.ok(data);
  }

  async getPartnerInfo ({ response, auth  }) {
    const UserId = auth.user.id;
    const partner = await new PartnerService().findPartnerByUserId(UserId)
    return response.ok(partner);
  }

  async getClientInfo ({ response, auth  }) {
    const UserId = auth.user.id;
    const partner = await new UsersService().getClientInfo(UserId)
    return response.ok(partner);
  }

  async getAllOrdersByPartner ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const partner = await new PartnerService().findPartnerByUserId(UserId)
    const partnerId = partner.id;

    const data = await new PartnerOrderService().getAllOrdersByPartner(filters,partnerId)
    return response.ok(data);
  }

  async getOrderByPartner ({ params, request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const OrderId = params.id
    
    const partner = await new PartnerService().findPartnerByUserId(UserId)
    const partnerId = partner.id;
    
    const data = await new PartnerOrderService().getOrderByPartner(OrderId, filters,partnerId)
    return response.ok(data);
  }
  
  
  async findAllOrderByClient ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const order = await new OrderService().findAllOrderByClient(filters,UserId)
    return response.ok(order);
  }
  
  async acceptOrderByPartner ({ params, response, auth }) {
    const UserId = auth.user.id;
    const OrderId = params.id
    const data = await new PartnerOrderService().acceptOrderByPartner(OrderId, UserId);
    return response.created(data, {message: "Pedido Aceite com sucesso"});
  }
  
  async cancelOrderByPartner ({ params, response, auth }) {
    const UserId = auth.user.id;
    const OrderId = params.id
    const data = await new PartnerOrderService().cancelOrderByPartner(OrderId, UserId);
    return response.created(data, {message: "Pedido Cancelado com sucesso"});
  }
  
  async authenticateAsPartner({ request, response, auth }) {
    const requestAndRole = {
      request,
      role: 'sales'
    }
    
    const { email } = request.all();
    
    // Garantir que o utilizador existe
    const user = await User.findBy('email', email);
    if (!user) {
      return response.unauthorized({
        message: 'Credenciais inválidas',
      });
    }
    
    // Verificar se o utilizador tem a role "sales"
    const role = await user.role;
    if ( role !='sales') {
      return response.forbidden('Credenciais inválidas');
    }
    
    // Se passou na validação de role, segue o fluxo normal de autenticação
    const data = await new AuthenticatedRepository().authenticate(requestAndRole, auth, response);
    return data;
  }

  async getNotificationsByPartner ({ request, response, auth  }) {
  const filters = request;
  const UserId = auth.user.id;
  
  const partner = await new PartnerService().findPartnerByUserId(UserId)

  if(!partner){
    throw new NotFoundException("Loja não encontrada");
  }
  
  const data = await new NotificationService().findNotificationByUserId(filters, UserId);
  return response.ok(data);
  }

  async getNotificationsByUser ({ request, response, auth  }) {
  const filters = request;
  const UserId = auth.user.id;
  const data = await new NotificationService().findNotificationByUserId(filters, UserId);
  return response.ok(data);
  }
  
}

module.exports = AdminController
    