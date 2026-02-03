
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class ProductsRepository extends BaseStorageRepository{
        
    constructor() {
      super("Product", "App/Modules/Catalog/Models/")
    } 

    findProductsByPartnerId(PartnerId) {
      return this.model.query().where('partnerId', PartnerId).where('is_deleted', 0);
    }    
    
    }    
    module.exports = ProductsRepository
    