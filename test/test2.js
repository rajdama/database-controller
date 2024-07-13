const DatabaseConnectSimplifier = require("../connectdb/index");

const postgresConfig = {
  type: "postgresql",
  host: "localhost",
  user: "postgres",
  password: "admin",
  database: "test",
  port: 5432,
  schema: {
    id: { type: "SERIAL PRIMARY KEY", unique: true },
    name: { type: "VARCHAR(255)", unique: false },
    email: { type: "VARCHAR(255)", unique: true },
  },
};

async function main() {
  const dbConnector = new DatabaseConnectSimplifier(postgresConfig);

  await dbConnector.connect();

  await dbConnector.createDocument("users", {
    id: 100,
    name: "raj D",
    email: "xyz@example.com",
  });

  const users = await dbConnector.readCollection("users");
  console.log(users);
}

main();
