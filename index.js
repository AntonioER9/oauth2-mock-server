const { OAuth2Server } = require("oauth2-mock-server");
const { getuid } = require("process");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let server = new OAuth2Server();

async function main() {
  console.log("Baufest OAUTH2 Mock Server starting...");

  const jwk = {
    kty: "RSA",
    n: "mlldtfHASV_kkSbv78uwCNlvo8MJcj-asJNj7vj2LvJfs14loBZhyKnGTPvRvipp_hLSnchL5pIcRv3faX034KJQJcXIbLjheUnfWN_3FoUqT-pC9_YeU-STcmjw5DqHJ4_HzCHUy4tHWfw9TwXzGV8MvwhZ8AAlvg10bReQ1eGixw9h5Mo2DdU8fbA5x9eJKlXeYYAvc4-Top9ssdoV8Bru9SOxhd__T_OpSw1NCjZXz1pQXXL0iIRfEiYTlzYZyjtkL7rrbKk_UDYzTAvMIV_Iqcitze2vMkFbMSJ9hhA6s6WOJISI6CPd4DEC5d4_5nkH9U2PrqgQYiNatidpaw",
    e: "AQAB",
    d: "Gs0xzIoyDYutMNdGCqmf46l-DT2swj3xKoAtdi2c8gH8RDUw6193k1SHro57mT3cMdYq5GMHav4sEte6l6K6tTL6H9T8PITOAjWlptUdHrf45O-UuWHvWjnysIcwbTEMjv4Uf4nQXZfNx_5Y1wP9doZevD1DAL3Fz_6eHONerwS-KmaTt7eg_eqTHRGKuY1ahm4DLAvzulM9HgF4DiH5EPHX_FX3fXEwrZ7pH7HuWk49uai265-PY0-NP69fsQlXqzi2BQw4c2nIRzBGB1TPECsDNAMzyMBXL-KZ14IfIW3YR88WL_Iv8NOk0Gy6uTNfgiMAd3KViiA_X7F_XsVCoQ",
    p: "x1iPxWn8Zna1_O1jksPXw8b6BPrcwOEDKT3Vd0D0WC97Xk_JTbzr6UywdT5bGrofr9LW-1HOBNHJLE0wVMrnZQmZYTxF7SczeXRai0uAOuaCFCq9WjQuQgxsAsgl-GdUIgFwZ5ocdnnFgMKWIAwcnEZAtmJy7I5WzLsizWogjm0",
    q: "xjcNd0Pt6y4fUKsZdQF6U0uXYa2Qc2FZ8rBn6-ltofjjB-ngMpPwQk-TrQRwX5GVFK_5Gy3fLWCNS3EVEr4RJGhxCH2Hlf1sgvrjui_9-JkH68R04Wn2218FoIdPscLuRKkLLIBR8FmXjj6YBp7FT_-Lfmt2jfbipGKBhJAKEDc",
    dp: "iFVcNmJu2VC01B8ya0x_QwjRMxiyY0NAWzNLy7xjn_ARSoX8oarkGPF2-ShFPHkwdJoYp1biNE-Zay_7LvJ54JL5EBQdqryVqqnVxtBDCYVeTxaP26I2RLukHx7tQP7B_mPHkUNH1gsf9RiffZlq88HkPhgEix4p5OjTO3Mqgt0",
    dq: "prfZcK5HKF_T4RL4x4xlqjfTbUoCTLneYR11W10sZGcl9hsGAyShmfS63nT0W73kqdDVcsHjjJRAY-sKcYhCfOAH6r9C0qqkoYqLDqidMoLswaatNIffJWbIIdyN8JNnu4J_rn-D6-g_bFpDnpXemknzt3KF9iRpPyDHlYtdm4M",
    qi: "LGs8DngTMn4QWdOvKanc8qkOaRxxe_5ouLPuEuWQtXobEJKp-F8YIlw-_ahnNcxsgwLZ5kInKVF8BNRAVBs34WSJCPYK_mlykud1VWrq-SOEykbSJqUNxb1GeOtmQVzJ7yej4rt_Wn0EAQrFNkqh9wA9WnXUA1m-pzKUBwdtGQg",
    kid: "d6feca02a01ae1f1413b6072e21b752497354107d4ad1c6fe058d39d2851b0fc8c51be258f61ba60",
    alg: "RS256",
  };

  if (!jwk) {
    await server.issuer.keys.generate("RS256");
  } else {
    await server.issuer.keys.add(jwk);
  }

  const PORT = process.env.PORT || 8080;
  const HOST = process.env.HOST || "127.0.0.1";

  
  const issuer = process.env.ISSUER_HOST;

  if(issuer && issuer.length > 0){
    server.issuer.url = server.issuer.url.replace('localhost', issuer);
  }

  server.service.on("beforeTokenSigning", (token, req) => {
    const clientId = req.body.client_id;
    token.payload.client_id = clientId;
    token.payload.sub = "6c84fb90-12c4-11e1-840d-7b25c5ee775a"; // Should be a valid user id on the backend DB...
    token.payload.exp = 4102462799; // 2099-12-31 23:59:59
  });

  server.service.on("beforeResponse", (tokenEndpointResponse, req) => {
    console.log("Token issued: ");
    console.log(tokenEndpointResponse.body);
  });

  server.service.on(
    "beforePostLogoutRedirect",
    (postLogoutRedirectUri, req) => {
      console.log("Logout url:" + JSON.stringify(postLogoutRedirectUri));
    }
  );

  process.once('SIGINT', async() => {
    console.log('OAuth 2 server is stopping...');    
    await server.stop();    
    console.log('OAuth 2 server has been stopped.');
  });

  await server.start(PORT, HOST);

  console.log("- Issuer URL:", server.issuer.url);
  console.log(
    "- Discovery URL:",
    server.issuer.url + "/.well-known/openid-configuration"
  );
  console.log("- JWKS URL:", server.issuer.url + "/jwks");
  console.log("- Authorize URL:", server.issuer.url + "/authorize"); //example: ?client_id=a17c21ed&response_type=code&state=5ca75bd30&redirect_uri=https%3A%2F%2Flocalhost%2Fauth&scope=photos
  console.log("- Token URL:", server.issuer.url + "/token");
}

main()
  .then()
  .catch((err) => console.error(err));
