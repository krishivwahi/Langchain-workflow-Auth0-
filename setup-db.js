const { Pool } = require('pg');
const{ PostgresSaver } = require('@langchain/langgraph-checkpoint-postgres')

async function setup(){
    const pool = new Pool({
        connectionString: 
        "postgres://postgres:password@localhost:5432/postgres"
    });
    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();
    console.log("Postgres Checkpointer tables created");
    process.exit(0);
}
setup();
