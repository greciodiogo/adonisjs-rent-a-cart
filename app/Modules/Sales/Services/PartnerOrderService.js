
'use strict'
  const Database = use("Database");
  const PartnerService = use('App/Modules/Catalog/Services/PartnerService')
  const OrderService = use('App/Modules/Sales/Services/OrderService')
  const PartnerOrderRepository = use("App/Modules/Sales/Repositories/PartnerOrderRepository");
  const PartnerOrderItemRepository = use("App/Modules/Sales/Repositories/PartnerOrderItemRepository");


    class PartnerOrderService{
        
    constructor(){}

    async getAllOrdersByPartner(filters, PartnerId) {
      const selectColumn = `partner_orders.*, orders."fullName", orders."contactEmail"`;
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "partner_orders.id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        status: filters.input("status") || "",
        searchBy: ["status"],
        isPaginate: true
      };  

      let query = new PartnerOrderRepository()
        .findAll(search, options, selectColumn) 
        .innerJoin("orders", "orders.id", "partner_orders.order_id")
        .where(function () {
          if (options.status ) {
            if (options.status == 'LOADING') {
              this.where('partner_orders.status', 'accepted');
              } else if(options.status == 'CONFIRMED'){
              this.where('orders.status', 'delivered').orWhere('partner_orders.status', 'confirmed');
              } else {
                this.where('partner_orders.status', 'PENDING');
              }
            }
        }).where('partner_id', PartnerId)
        // .whereIn('order_id', Database.select('id').from('orders').where("id", "orders.id"))
      return query.paginate(options.page, options.perPage || 10);
    }

    async getOrderByPartner(OrderId, filters, PartnerId) {
        const selectColumn =
      `partner_orders.id, partner_orders.order_id, partner_orders.partner_id, partner_orders.status, partner_orders.total_amount, partner_orders.created_at, partner_orders.updated_at, orders."fullName" ,orders."contactEmail"`;
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "partner_orders.id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        status: filters.input("status") || "",
        searchBy: ["status"],
        isPaginate: true
      };  
      
      let query = new PartnerOrderRepository()
        .findAll(search, options, selectColumn) 
        .innerJoin("orders", "orders.id", "partner_orders.order_id")
        .where(function () {
          if (options.status ) {
            if (options.status == 'LOADING') {
              this.where('partner_orders.status', 'accepted');
              } else if(options.status == 'CONFIRMED'){
              this.where('partner_orders.status', 'delivered');
              } else {
              this.where('partner_orders.status', options.status);
              }
          }
        }).where('partner_id', PartnerId)
        .where('order_id', OrderId)
        // .whereIn('order_id', Database.select('id').from('orders').where("id", OrderId))
        .with('orderItems')
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdPartnerOrders(ModelPayload) {
      return await new PartnerOrderRepository().create({
        ...ModelPayload
      });  
    }

    static async createFromOrderItems (orderId, orderItems) {
    const grouped = this.groupByPartner(orderItems)

    for (const partnerId in grouped) {
      const items = grouped[partnerId]

      const total = items.reduce((sum, i) => {
        return sum + Number(i.price) * Number(i.quantity)
      }, 0)

      const partnerOrder = await new PartnerOrderRepository().create({
        order_id: orderId,
        partner_id: partnerId,
        status: 'PENDING',
        total_amount: total
      })

      await this.attachItems(partnerOrder.id, items)
    }
  }

   static groupByPartner (items) {
    return items.reduce((acc, item) => {
      acc[item.partnerId] = acc[item.partnerId] || []
      acc[item.partnerId].push(item)
      return acc
    }, {})
  }

  static async attachItems (partnerOrderId, items) {
    for (const item of items) {
      await new PartnerOrderItemRepository().create({
        partner_order_id: partnerOrderId,
        order_item_id: item.id
      })
    }
  }

    async acceptOrderByPartner(OrderId, UserId) {
      return await this.updateOrderStatus(OrderId, 'accepted', UserId);
    }

    async cancelOrderByPartner(OrderId, UserId) {
      return await this.updateOrderStatus(OrderId, 'canceled', UserId);  
    }

    async updateOrderStatus(OrderId, Status, UserId) {
      const NotFoundException = use("App/Exceptions/NotFoundException");
      
      const order = await new OrderService().findOrderById(OrderId);
      if(!order) throw new NotFoundException("Pedido não foi encontrado.");
      
      const partner = await new PartnerService().findPartnerByUserId(UserId);
      if(!partner) throw new NotForbiddenException();

      const partnerOrder =  await this.findPartnerOrderByOrderId(OrderId);
      if(!partnerOrder) throw new NotFoundException("Pedido da loja não foi encontrado.");

      return await new PartnerOrderRepository().update(
        partnerOrder.id,
        {
        status: Status,
      });  
    }
     
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findPartnerOrderById(Id) {
      return await new PartnerOrderRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    async findPartnerOrderByOrderId(OrderId) {
      return await new PartnerOrderRepository()
        .findAll() 
        .where('order_id', OrderId).first()
        // .whereIn('order_id', Database.select('id').from('orders').where("id", "orders.id"))
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedPartnerOrder(Id, ModelPayload) {
      return await new PartnerOrderRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyPartnerOrder(Id) {
      return await new PartnerOrderRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitivePartnerOrder(Id) {
      return await new PartnerOrderRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllPartnerOrdersTrash(filters) {
        const options = {
        ...new PartnerOrderRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new PartnerOrderRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = PartnerOrderService
    