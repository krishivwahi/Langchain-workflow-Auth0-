import { NodeInterrupt } from "@langchain/langgraph";
import { GraphState } from "./graph";

export const secureAuthNode = async(state: typeof GraphState.State) => {
    if(!state.hasValidToken){
        console.log("No token found. Initiating MonoCloud Device Flow....");
    //initiate OAuth 2.0 Device Flow 
    const tenantUrl = process.env.MONOCLOUD_AUTH_TENANT_DOMAIN || "https://your-tenant.monocloud.com";
    const clientId = process.env.MONOCLOUD_AUTH_CLIENT_ID || "your clientID";
    //will be fetched from MonoCloud's authorisation endpoint

    const deviceFlowRes = {
        device_code: "12345",
        user_code: "1234",
        verification_uri: `${tenantUrl}/device`,
        expires_in: 600,
        interval: 5
    };
    //throwing a langgraph interrupt to pause 
    throw new NodeInterrupt({
        action_required: true,
        message: "Authorisation required to execute this tool.",
        device_flow : deviceFlowRes
    });
   }
   //if token available
   console.log("Token is valid. Executing secure action");
   return { messages: ["Secure action executed successfully"] };
};
