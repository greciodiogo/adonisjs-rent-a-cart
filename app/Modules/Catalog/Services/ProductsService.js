
    'use strict'
    const Database = use("Database");
    const ProductsRepository = use("App/Modules/Catalog/Repositories/ProductsRepository");
    const PartnerService = use('App/Modules/Catalog/Services/PartnerService')

    class ProductsService{
        
    constructor(){}

    async findAllProductss(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true,
        withRalationships: ["photos"]
      };
      
      let query = new ProductsRepository()
      .findAll(search, options) 
      .where(function () {}).where('is_deleted', 0)
      .with('photos')
      return query.paginate(options.page, options.perPage || 10);
    }
    
    async getProductsByCategory(filters, CategoryId) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        withRalationships: ["photos"],
        isPaginate: true
      };
      
      let query = new ProductsRepository()
      .findAll(search, options) 
      .innerJoin('categories_products_products', 'categories_products_products.productsId', 'products.id')
      .where(function () {})
      // .
      .where('categories_products_products.categoriesId', CategoryId)
      .with('photos')
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
    */
   async createdProduct(ModelPayload, UserId) {
     const partner = await new PartnerService().findPartnerByUserId(UserId)
     const PartnerId = partner.id;
     const purchasePrice = ModelPayload.purchasePrice;
     const price = Math.round(ModelPayload.price) || await this.calculatePrice(purchasePrice)
     return await new ProductsRepository().create({
       ...ModelPayload,
       price: price,
       partnerId: PartnerId,
      });  
    }
    
    async calculatePrice(purchasePrice, profitMargin = 0) {
      const comissao = await Database.table('settings').where('name', 'Comissão').first();
      if (comissao) {
        profitMargin = comissao.value;
      }
      return purchasePrice + Math.round((purchasePrice * (profitMargin / 100)));
    }
    
    
    /**
     *
     * @param {*} Id
     * @returns
    */
   async findProductsById(Id) {
     return await new ProductsRepository().findById(Id) 
     .with('photos')
     //.where('is_deleted', 0)
     .first();
    }

    async getProductsByPartner(filters, PartnerId) {

      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true
      };
  
      let query = new ProductsRepository()
        .findAll(search, options) 
        .where(function () {})
        .where('partnerId', PartnerId)
        .where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedProducts(Id, ModelPayload) {
      return await new ProductsRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyProducts(Id) {
      return await new ProductsRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveProducts(Id) {
      return await new ProductsRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllProductssTrash(filters) {
        const options = {
        ...new ProductsRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new ProductsRepository()
        .findTrash(options.search, options) 
        .where(function () {}).where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = ProductsService
    