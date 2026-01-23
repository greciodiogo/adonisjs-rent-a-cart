
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PartnerUserRepository extends BaseStorageRepository{
        
    constructor() {
      super("PartnerUser", "App/Modules/Catalog/Models/")
    } 

    }
    module.exports = PartnerUserRepository
    