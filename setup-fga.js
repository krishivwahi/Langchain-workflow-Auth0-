const{ OpenFgaClient } = require('@openfga/sdk');

async function setupFGA(){
    //connected to docker
    const fgaClient = new OpenFgaClient({ apiUrl: "http://localhost:8080"});

    console.log("Creating OpenFGA store...");
    const {id: storeId } = await fgaClient.createStore({ name: "Langchain-Rag-Store" });
    fgaClient.storeId = storeId;

    //building the relationship :( model
    console.log("Writing Authorization Model...");
    const{ authorization_model_id } = await fgaClient.writeAuthorizationModel({
        schema_version: "1.1",
        type_definitions: [
            {type: "user"},
            {
                type: "document",
                relations: {
                    owner: { this: {} },
                    viewer: {
                        union: {
                            child: [
                                { this: {} },
                                { computedUserset: { relation: "owner"} } // owner = viewer.....woah
                            ] 
                        }
                    }
                },
                metadata: {
                    relations: {
                        owner: { directly_related_user_types: [{ type: "user" }] },
                        viewer: { directly_related_user_types: [{ type: "user" }] }
                    }
                }
            }
        ]
    });
    //mapping identities to OpenFGA tuples
    console.log("Writing sample permissions....");
    await fgaClient.write({
        writes: [
            {user: "user:alice", relation: "owner", object: "document:1" },
            {user: "user:bob", relation: "viewer", object: "document:1" },
            {user: "user:charlie", relation: "viewer", object: "document:2" },
        ]
    });
    console.log("\n SUCCESS! save in your .env local file:");
    console.log(`FGA_STORE_ID=${storeId}`);
    console.log(`FGA_AUTHZ_MODEL_ID=${authorization_model_id}`);
}
setupFGA().catch(console.error);
