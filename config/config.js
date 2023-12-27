const getQuotationTypesConfig = (quotationType) => {

    switch (quotationType) {
        case 'CONSTRUCTION':
            return 1;
            break;
        case 'SPECIAL_EVENTS':
            return 2;
            break;
        case 'DISASTER_RELIEF':
            return 3;
            break;
        case 'FARM_WINERY_ORCHARD':
            return 4;
            break;
        case 'INDIVIDUAL_NEEDS':
            return 5;
            break;
        default:
          console.log('undefined');
    }
      
};

module.exports = {
    getQuotationTypesConfig,
};
  