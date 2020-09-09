const presale = require('./abi/presale.json');
const caco = require('./abi/caco.json');
const busd = require('./abi/busd.json');
const router = require('./abi/router.json');

// export const config = {
//   CHAIN_ID: 56,                                                   // 97
//   RPC_URL: 'https://bsc-dataseed.binance.org/',                   // https://data-seed-prebsc-1-s1.binance.org:8545/
//   INFURA_ID: 'e6943dcb5b0f495eb96a1c34e0d1493e',                  //            Test net
//   CACO_CONTRACT: '0x059715169f863024595803Ab04b55810F172B1a0',     // 0xee37E665A0a03e6E0b1305E887bDDAE7CF3255cd
  BUSD_CONTRACT: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
  PRESALE_FACTORY: '0xa037Cf034a4fBCF4a69C1bf58174f3F62D7d6f29',
  ROUTER_CONTRACT: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  WBNB_CONTRACT: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
}

export const ABI = {
  PRESALE: presale,
  CACO: caco,
  BUSD: busd,
  ROUTER: router,
}

export const def_config = {
  MAX_PRESALE_AMOUNT: 50000000
}