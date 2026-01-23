
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PartnerOrderItemRepository extends BaseStorageRepository{
        
    constructor() {
      super("PartnerOrderItem", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = PartnerOrderItemRepository
    