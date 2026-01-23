
    'use strict'
    const Database = use("Database");
    const UsersRepository = use("App/Modules/Authentication/Repositories/UsersRepository");

    class UsersService{
        
    constructor(){}

    async findAllUserss(filters) {
      const options = {
        ...new UsersRepository().setOptions(filters),
        typeOrderBy: "DESC",
      };

      const selectColumn = '"id", "first_name", "last_name", "email", "role" as created_at';

      let query = new UsersRepository()
        .findAll(options.search, options, selectColumn) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */

     generateUsernameAndPassword(company_name) {
    // Pegando a primeira palavra do nome da empresa (em minúsculas)
    const firstWord = company_name.split(' ')[0].toLowerCase();
    
    // Gerando username e password
    const username = `${firstWord}.rentals`;
    const password = `rentals@${firstWord}`;
    const first_name = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    
    return { first_name, username, password };
  }

  async generateDefaultUSer(CompanyName, trx = null) {
    const { first_name, username, password } = this.generateUsernameAndPassword(CompanyName);
    const userPayload = {
      first_name,
      username,
      password,
      role: 'PARTNER',
    };

    return await new UsersRepository().create(userPayload, trx);  
  }

    async createUser(ModelPayload) {
      return await new UsersRepository().create({
        ...ModelPayload
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findUsersById(Id) {
      const selectColumn = '"id", "first_name", "last_name", "email", "role", created_at';
      return await new UsersRepository().findById(Id, selectColumn) 
        //.where('is_deleted', 0)
        .first();
    }

    async findUsersByEmail(Email, role = null) {
      const selectColumn = '"id", "first_name", "last_name", "email", "role", created_at';
      return await new UsersRepository().findAll(null, {}, selectColumn) 
       .where(function () {
          if (role === 'sales') {
            this.where('role', 'sales');
          }}
        )
        .where('email', Email)
        .first();
    }

    async getClientInfo(Id) {
      return await new UsersRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedUsers(Id, ModelPayload) {
      return await new UsersRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyUsers(Id) {
      return await new UsersRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveUsers(Id) {
      return await new UsersRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllUserssTrash(filters) {
        const options = {
        ...new UsersRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new UsersRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = UsersService
    