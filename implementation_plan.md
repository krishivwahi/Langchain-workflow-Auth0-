# Orchestration Layer: MonoCloud + LangGraph

Rebuild the orchestration layer to replace proprietary solutions with an open-source, mTLS-secured LangGraph architecture integrated with MonoCloud. The workflow will be strictly implemented in **TypeScript** within a **Next.js** environment.

## User Review Required

> [!IMPORTANT]
> The plan has been finalized with a new **Phase 0: Prerequisites Setup** based on your answers. Please review the installation steps and the overall phase execution. If you are ready, hit **Proceed** and we will begin executing Phase 0 and Phase 4 (Next.js initialization) together!

## Proposed Execution Plan

### Phase 0: Prerequisites Setup (New)
Since we need Docker for OpenFGA, we can also use it to easily run PostgreSQL for LangGraph's checkpointer.
1. **Install Docker**: You will need to install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/).
2. **Docker Compose**: I will create a `docker-compose.yml` file in the project root to instantly spin up both **PostgreSQL** (for LangGraph state) and **OpenFGA** with a single command.
3. **OpenSSL Scripts**: I will write a Bash/PowerShell script using OpenSSL to automatically generate the Root CA and client leaf certificates with the `clientAuth` EKU for mTLS.

*(Note: Please ensure you install Docker Desktop while I prepare the setup files in the next step.)*

### Phase 4: Initialization & Scaffold (Moved up)
- Initialize the Next.js project in `d:\langchainproject` with TypeScript, Tailwind CSS, and App Router (`npx -y create-next-app@latest .`).
- Install necessary dependencies (`@langchain/core`, `@langchain/langgraph`, `@langchain/langgraph-checkpoint-postgres`, `@monocloud/auth-nextjs`, `@openfga/sdk`).

### Phase 1: State & Interrupts (Asynchronous Authorization)
- **Primary Auth**: Configure `@monocloud/auth-nextjs` for Next.js to secure the application.
- **Graph & Checkpointer**: Initialize a LangGraph state graph in TypeScript using the Postgres checkpointer.
- **Authorization Gate**: Build a custom LangChain tool wrapper that intercepts calls and checks the state for a MonoCloud token.
- **Interrupts & Device Flow**: If missing, throw a LangGraph interrupt, initiate the OAuth 2.0 Device Authorization Grant (RFC 8628) with MonoCloud, and return the `user_code` and `verification_uri` to the UI.
- **Polling Loop**: Setup the backend polling loop for MonoCloud's token endpoint, strictly handling `authorization_pending` and `slow_down`.
- **Resumption**: Inject the strictly scoped access token into the graph state upon approval, execute the tool, and purge the token.

### Phase 2: RAG & OpenFGA (Fine-Grained Authorization)
- **Map Identities**: Write a sync script/endpoint to map MonoCloud identities to OpenFGA tuples.
- **Custom Retriever**: Implement a custom LangChain retriever in TypeScript.
- **Policy Enforcement**: The retriever will query OpenFGA (`check` API) for `can_read` relationships using the MonoCloud user ID before passing document chunks to the LLM.

### Phase 3: mTLS & Token Exchange (Cryptographic Binding)
- **Enforce mTLS**: Configure the Next.js custom `https.Agent` (or `fetch` dispatcher in Node) to enforce mTLS for all backend-to-MonoCloud communication using the generated certificates.
- **Token Exchange**: Build a dedicated LangGraph node to perform OAuth 2.0 Token Exchange (RFC 8693) swapping the session token for a tool-specific token.
- **Certificate Binding**: Implement RFC 8705 to bind the exchanged token to the client's X.509 certificate.

## Verification Plan

### Manual Verification
- Verify Docker starts Postgres and OpenFGA successfully.
- Verify MonoCloud login via Next.js frontend.
- Attempt a high-privilege agent action and verify the LangGraph interrupt successfully pauses execution and displays the device flow code.
- Approve the device flow on MonoCloud and ensure the polling loop resumes the graph and executes the tool.
- Test document retrieval against OpenFGA policies (authorized vs unauthorized).
