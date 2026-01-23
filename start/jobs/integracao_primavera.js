'use strict'
require('dotenv/config')
const Env = use('Env')
const cron = require('node-cron')
const AXIOS = require('axios')



/*
|===============================================================|
|                   Rodar todos os dias as 22h:00m              |
|===============================================================|
*/
/**
 *
 * @param {*} TypeBilling
 */
function jobByTypeBilling(TypeBilling, isOcasional=0){
  const instanceId = process.env.NODE_APP_INSTANCE;
  if(Env.get('NODE_ENV')=='production' && instanceId == 0) { // Verifica se é o primeiro processo
    var moment = require("moment");
    const tipoFacturacao = TypeBilling;
    var mes = moment(new Date()).format("MM");
    var ano = moment(new Date()).format("YYYY");
    AXIOS.request({
          url: `${Env.get('APP_URL')}/api/primavera/ciclos/job?ano=${ano}&mes=${mes}&tipoFacturacao=${tipoFacturacao}&isOcasional=${isOcasional}`,
          method: 'GET',
      });
  }
}


/*
|===============================================================|
|                   Rodar diariamente as 22h:00m                |
|===============================================================|
*/

cron.schedule("00 22 * * *", function () {
  jobByTypeBilling('PRE-PAGO');
})


/*
|===============================================================|
|                   Rodar diariamente as 22h:00m                |
|===============================================================|
*/
// Ocasional
cron.schedule("00 21 * * *", function () {
  jobByTypeBilling('POS-PAGO', 1);
})

// Ocasional
cron.schedule("00 20 * * *", function () {
  jobByTypeBilling('RECEBIMENTOS');
})

/*
|===============================================================|
|                   Rodar todos os dias 10 as 23h:00m            |
|===============================================================|
*/

cron.schedule("00 23 10 * *", function () {
  jobByTypeBilling('POS-PAGO');
})

function jobByTypeProcessarEstatutos() {
  const instanceId = process.env.NODE_APP_INSTANCE; 
    if (Env.get('NODE_ENV') == 'production' && instanceId == 0) { 
      AXIOS.request({
        url: `${Env.get('APP_URL')}/api/estatuto/processarCarregamentosEstatutos`,
        method: 'GET',
      });
    } 
}

/*
|===============================================================|
|                   Rodar todos os dias 1 as 1h:00m            |
|===============================================================|
*/

cron.schedule("0 1 1 * *", function () {
  jobByTypeProcessarEstatutos();
});
