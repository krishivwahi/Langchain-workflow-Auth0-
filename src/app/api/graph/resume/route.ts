import { NextRequest, NextResponse } from "next/server";
import { appGraph } from "@/lib/graph";

export async function POST(req: NextRequest) {
  const { thread_id, access_token } = await req.json();

  if (!thread_id) {
    return NextResponse.json({ error: "thread_id is required" }, { status: 400 });
  }

  // 1. We specify the exact graph thread we want to resume
  const config = { configurable: { thread_id } };

  // 2. We inject the new state, setting hasValidToken to true!
  // LangGraph's checkpointer will automatically save this to our Postgres database.
  await appGraph.updateState(config, { hasValidToken: true });

  // 3. We resume the graph by passing `null` as the input
  const result = await appGraph.invoke(null, config);

  return NextResponse.json({ 
    message: "Graph resumed successfully",
    result 
  });
}
