import { StateGraph, Annotation } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";
import { secureAuthNode } from "./authNode";

// This represents the data that gets passed around between your nodes
export const GraphState = Annotation.Root({
  //'messages' array automatically appends new messages instead of overwriting
  messages: Annotation<string[]>({
    reducer: (current, next) => current.concat(next),
  }),
  // Will use to track if a user is authenticated
  hasValidToken: Annotation<boolean>(), 
});

//Initializing the Postgres Checkpointer
const pool = new Pool({
  connectionString: "postgres://postgres:password@localhost:5432/postgres",
});
export const checkpointer = new PostgresSaver(pool);

// State Graph
const workflow = new StateGraph(GraphState)
  .addNode("secure_auth", secureAuthNode)
  .addNode("dummy_node", async (state) => {
    console.log("Graph is running!");
    return { messages: ["Hello from the graph!"] };
  })
  .addEdge("__start__", "secure_auth")
  .addEdge("secure_auth", "dummy_node");

// 4. Compiling the graph with our Postgres checkpointer!
export const appGraph = workflow.compile({ checkpointer });
