import { OpenFgaClient } from "@openfga/sdk";

//initialising the client

export const fgaClient = new OpenFgaClient ({
    apiUrl: process.env.FGA_API_URL || "http://localhost:8080",
    storeId: process.env.FGA_STORE_ID,
    authorizationModelId: process.env.FGA_MODEL_ID,
});

/**
 * Filter RAG vector retrievals via OPENFGA checks
 * Takes a list of document IDs and returns only the ones the user is allowed to view.
 */

export async function filterAllowedDocuments (userId: string, documentIds: string[]): Promise<string[]>{
    const allowedDocs: string[] = [];
    
    for (const docId of documentIds) {
        const { allowed } = await fgaClient.check({
            user: `user:${userId}`,
            relation: "viewer",
            object: `document:${docId}`,
        });
        if (allowed) {
            allowedDocs.push(docId);
        }
    }
    return allowedDocs;
}