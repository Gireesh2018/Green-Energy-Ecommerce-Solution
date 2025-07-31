/// <reference types="./index.d.ts" />
// src/connection.ts
import { CompiledQuery } from "kysely";

// src/errors.ts
var PostgresJSDialectError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "PostgresJSDialectError";
  }
};

// src/connection.ts
var PostgresJSConnection = class {
  #reservedConnection;
  constructor(reservedConnection) {
    this.#reservedConnection = reservedConnection;
  }
  async beginTransaction(settings) {
    const { isolationLevel } = settings;
    const compiledQuery = CompiledQuery.raw(
      isolationLevel ? `start transaction isolation level ${isolationLevel}` : "begin"
    );
    await this.executeQuery(compiledQuery);
  }
  async commitTransaction() {
    await this.executeQuery(CompiledQuery.raw("commit"));
  }
  async executeQuery(compiledQuery) {
    const result = await this.#reservedConnection.unsafe(
      compiledQuery.sql,
      compiledQuery.parameters.slice()
    );
    const rows = Array.from(result.values());
    if (["INSERT", "UPDATE", "DELETE"].includes(result.command)) {
      const numAffectedRows = BigInt(result.count);
      return { numAffectedRows, rows };
    }
    return { rows };
  }
  releaseConnection() {
    this.#reservedConnection.release();
    this.#reservedConnection = null;
  }
  async rollbackTransaction() {
    await this.executeQuery(CompiledQuery.raw("rollback"));
  }
  async *streamQuery(compiledQuery, chunkSize) {
    if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
      throw new PostgresJSDialectError("chunkSize must be a positive integer");
    }
    const cursor = this.#reservedConnection.unsafe(compiledQuery.sql, compiledQuery.parameters.slice()).cursor(chunkSize);
    for await (const rows of cursor) {
      yield { rows };
    }
  }
};

// src/dialect.ts
import {
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler
} from "kysely";

// src/utils.ts
function freeze(obj) {
  return Object.freeze(obj);
}

// src/driver.ts
var PostgresJSDriver = class {
  #config;
  constructor(config) {
    this.#config = freeze({ ...config });
  }
  async init() {
  }
  async acquireConnection() {
    const reservedConnection = await this.#config.postgres.reserve();
    return new PostgresJSConnection(reservedConnection);
  }
  async beginTransaction(connection, settings) {
    await connection.beginTransaction(settings);
  }
  async commitTransaction(connection) {
    await connection.commitTransaction();
  }
  async rollbackTransaction(connection) {
    await connection.rollbackTransaction();
  }
  async releaseConnection(connection) {
    connection.releaseConnection();
  }
  async destroy() {
    await this.#config.postgres.end();
  }
};

// src/dialect.ts
var PostgresJSDialect = class {
  #config;
  constructor(config) {
    this.#config = freeze({ ...config });
  }
  createAdapter() {
    return new PostgresAdapter();
  }
  createDriver() {
    return new PostgresJSDriver(this.#config);
  }
  createIntrospector(db) {
    return new PostgresIntrospector(db);
  }
  createQueryCompiler() {
    return new PostgresQueryCompiler();
  }
};
export {
  PostgresJSConnection,
  PostgresJSDialect,
  PostgresJSDialectError,
  PostgresJSDriver
};
//# sourceMappingURL=index.js.map