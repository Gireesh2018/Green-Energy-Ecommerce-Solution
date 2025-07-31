"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PostgresJSConnection: () => PostgresJSConnection,
  PostgresJSDialect: () => PostgresJSDialect,
  PostgresJSDialectError: () => PostgresJSDialectError,
  PostgresJSDriver: () => PostgresJSDriver
});
module.exports = __toCommonJS(src_exports);

// src/connection.ts
var import_kysely = require("kysely");

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
    const compiledQuery = import_kysely.CompiledQuery.raw(
      isolationLevel ? `start transaction isolation level ${isolationLevel}` : "begin"
    );
    await this.executeQuery(compiledQuery);
  }
  async commitTransaction() {
    await this.executeQuery(import_kysely.CompiledQuery.raw("commit"));
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
    await this.executeQuery(import_kysely.CompiledQuery.raw("rollback"));
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
var import_kysely2 = require("kysely");

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
    return new import_kysely2.PostgresAdapter();
  }
  createDriver() {
    return new PostgresJSDriver(this.#config);
  }
  createIntrospector(db) {
    return new import_kysely2.PostgresIntrospector(db);
  }
  createQueryCompiler() {
    return new import_kysely2.PostgresQueryCompiler();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PostgresJSConnection,
  PostgresJSDialect,
  PostgresJSDialectError,
  PostgresJSDriver
});
//# sourceMappingURL=index.js.map