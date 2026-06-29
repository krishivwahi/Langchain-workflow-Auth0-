import { secureBackendFetch } from "./mtls";
import { GraphState } from "./graph";

export const tokenExchangeNode = async (state: typeof GraphState.State) => {
  console.log("Initiating Token Exchange (RFC 8693) with mTLS Binding...");

  // We are exchanging the normal access token for a highly-scoped one
  const subjectToken = state.accessToken || "dummy_subject_token";

  const tenantUrl = process.env.MONOCLOUD_AUTH_TENANT_DOMAIN || "https://your-tenant.monocloud.com";
  const clientId = process.env.MONOCLOUD_AUTH_CLIENT_ID || "your-client-id";

  try {
    // 1. We use our mTLS secure fetch!
    // This cryptographically binds the new token to our server's certificate (RFC 8705)
    const response = await secureBackendFetch(`${tenantUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        client_id: clientId,
        subject_token: subjectToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
        // Requesting a highly-privileged token just for the internal RAG database
        resource: "urn:internal:rag-database",
      }).toString(),
    });

    const newBoundToken = response.data.access_token;
    console.log("Successfully exchanged for an mTLS-bound token!");

    // 2. Update the state with the new super-token
    return { 
      messages: ["Token successfully exchanged!"], 
      boundToken: newBoundToken 
    };

  } catch (error) {
    console.error("Token Exchange failed!");
    return { messages: ["Token Exchange failed!"] };
  }
};
