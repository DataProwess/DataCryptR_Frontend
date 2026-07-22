// eslint-disable-next-line
import { FRONTEND_API_URL } from "./Components/ApiConfig";

const msalConfig = {
    auth: {
      clientId: '6081faf7-3d4a-415c-b95e-23d2c8a60517',
      authority: 'https://login.microsoftonline.com/61f5bdad-0f89-4d1f-8dec-d0530e5fad26',
      clientSecret: '6baf437c-2988-42df-96dd-238344be3194',
      redirectUri: `${FRONTEND_API_URL}/`, // Update with your redirect URI
      // redirectUri: 'http://localhost:3000/',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    },
  };
  
  export default msalConfig;
  
