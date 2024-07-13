const { Client } = require("pg");

class PostgreSQLConnector {
  constructor(config) {
    this.config = config;
    this.client = new Client({
      host: config.host,
      user: config.user,
      port: config.port,
      password: config.password,
      database: config.database,
    });
    this.schema = config.schema;
  }

  async connect() {
    await this.client.connect();
    console.log("Connected to PostgreSQL database");
  }

  async createTable(tableName, documentData) {
    const columns = Object.entries(this.schema)
      .map(([key, value]) => {
        return `${key} ${value.type}${value.unique ? " UNIQUE" : ""}`;
      })
      .join(", ");

    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

    try {
      await this.client.query(query);
      console.log(`Table '${tableName}' created successfully with schema`);
    } catch (error) {
      console.error("Error creating table:", error.message);
    }
  }
  async createDocument(tableName, documentData) {
    await this.createTable(tableName);

    const columns = Object.keys(documentData).join(", ");
    const values = Object.values(documentData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;

    try {
      const res = await this.client.query(query, values);
      console.log("Document inserted:", res.rows[0]);
    } catch (error) {
      console.error("Error inserting document:", error.message);
    }
  }

  async readCollection(tableName, query = {}) {
    const whereClauses = Object.entries(query)
      .map(([key, value], index) => {
        return `${key} = $${index + 1}`;
      })
      .join(" AND ");
    const values = Object.values(query);

    const sqlQuery = `SELECT * FROM ${tableName}${
      whereClauses ? " WHERE " + whereClauses : ""
    }`;

    try {
      const res = await this.client.query(sqlQuery, values);
      return res.rows;
    } catch (error) {
      console.error("Error reading collection:", error.message);
    }
  }

  async updateCollection(tableName, query, update) {
    const setClauses = Object.entries(update)
      .map(([key, value], index) => {
        return `${key} = $${index + 1}`;
      })
      .join(", ");
    const whereClauses = Object.entries(query)
      .map(([key, value], index) => {
        return `${key} = $${index + Object.keys(update).length + 1}`;
      })
      .join(" AND ");
    const values = [...Object.values(update), ...Object.values(query)];

    const sqlQuery = `UPDATE ${tableName} SET ${setClauses} WHERE ${whereClauses}`;

    try {
      await this.client.query(sqlQuery, values);
      console.log(`Collection '${tableName}' updated successfully`);
    } catch (error) {
      console.error("Error updating collection:", error.message);
    }
  }

  async deleteCollection(collectionName) {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    await this.db.collection(collectionName).drop();
  }

  async disconnect() {
    const query = `DROP TABLE IF EXISTS ${tableName}`;

    try {
      await this.client.query(query);
      console.log(`Table '${tableName}' deleted successfully`);
    } catch (error) {
      console.error("Error deleting table:", error.message);
    }
  }
}

module.exports = PostgreSQLConnector;

// database-connect-simplifier/
// │
// ├── lib/
// │   ├── db/
// │   │   ├── index.js        # Factory to get the right DB handler
// │   │   ├── mongodb.js      # MongoDB specific code
// │   │   ├── mysql.js        # MySQL specific code
// │   │   └── postgresql.js   # PostgreSQL specific code
// │   └── index.js            # Main interface for the package
// │
// ├── test/
// │   └── test.js             # Tests for the package (optional but recommended)
// │
// ├── .gitignore              # Git ignore file
// ├── package.json            # NPM package configuration
// ├── README.md               # Documentation for the package
// └── LICENSE                 # License for the package
