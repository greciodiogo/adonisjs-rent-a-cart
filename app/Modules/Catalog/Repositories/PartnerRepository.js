
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PartnerRepository extends BaseStorageRepository{
        
    constructor() {
      super("Partners", "App/Modules/Catalog/Models/")
    } 

    findPartnerByUserId(UserId) {
      return this.model.query().where('userId', UserId);
    }    

    }
    module.exports = PartnerRepository
    