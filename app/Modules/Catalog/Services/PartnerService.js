
    'use strict'
    const Database = use("Database");
    const PartnerRepository = use("App/Modules/Catalog/Repositories/PartnerRepository");
    const PartnerUserRepository = use("App/Modules/Catalog/Repositories/PartnerUserRepository");
    const UsersService = use('App/Modules/Authentication/Services/UsersService')

    class PartnerService{
        
    constructor(){}

    async findAllPartners(filters) {
      const options = {
        ...new PartnerRepository().setOptions(filters),
        typeOrderBy: "DESC"
      };
  
      let query = new PartnerRepository()
        .findAll(options.search, options)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdPartners(ModelPayload, trx) {
      return await new PartnerRepository().create({
        company_name: ModelPayload.company_name,
        nif: ModelPayload.nif,
        contact_phone: ModelPayload.contact_phone,
        address: ModelPayload.address,
      }, trx);  
    }

    async createPartnerWithDefaultUser(ModelPayload, UserId) {
       const trx = await Database.beginTransaction();
       try {
         const createdUser = await new UsersService().generateDefaultUSer(ModelPayload.company_name, trx);
         
         const createdPartner = await this.createdPartners(ModelPayload, trx);

         await new PartnerUserRepository().create({
           partner_id: createdPartner.id,
           user_id: createdUser.id,
           role: 'OWNER'
         }, trx);
         
         await trx.commit();
         return createdPartner; 
       } catch (error) {
          await trx.rollback();
          throw new Error('Falha ao criar parceiro e utilizador: ' + error.message);
        }
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findPartnerById(Id) {
      const data = await new PartnerRepository()
        .findById(Id, '*', ['products'])
        .first();
        return await data
    }

    async findPartnerByUserId(UserId) {
      const data = await new PartnerRepository()
        .findPartnerByUserId(UserId, '*', ['products'])
        .first();
        return await data
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedPartner(Id, ModelPayload) {
      return await new PartnerRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyPartner(Id) {
      return await new PartnerRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitivePartner(Id) {
      return await new PartnerRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllPartnersTrash(filters) {
        const options = {
        ...new PartnerRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new PartnerRepository()
        .findTrash(options.search, options) 
        .where(function () {})
        .with('products')
        //.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = PartnerService
    