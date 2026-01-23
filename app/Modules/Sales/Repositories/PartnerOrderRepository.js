
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PartnerOrderRepository extends BaseStorageRepository{
        
    constructor() {
      super("PartnerOrder", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = PartnerOrderRepository
    