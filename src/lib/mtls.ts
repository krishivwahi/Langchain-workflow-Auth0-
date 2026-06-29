import https from "https";
import fs from "fs";
import path from "path";

// locate the certis we generared in phase 0 :D
const certsDir = path.join(process.cwd(), "certs");

//create the mtls https agent 
export const mtlsAgent = new https.Agent({
    cert: fs.readFileSync(path.join(certsDir, "client.crt")),
    key: fs.readFileSync(path.join(certsDir, "client.key")),
    ca: fs.readFileSync(path.join(certsDir, "rootCA.crt")),
    rejectUnauthorized: true,
});

/** Example wrapper function for securely calling internal backend services.
 * use this to fetch :/
 */

export async function secureBackendFetch(url: string, options: any = {}) {
    //using node fetch cause simpler
    const axios = require ('axios');

    return axios({
        url,
        ...options,
        httpsAgent: mtlsAgent,
    });
}