import { DatabaseConnection, TransactionSettings, CompiledQuery, QueryResult, Dialect, DialectAdapter, Driver, Kysely, DatabaseIntrospector, QueryCompiler } from 'kysely';
import { ReservedSql, Sql } from 'postgres';

declare class PostgresJSConnection implements DatabaseConnection {
    #private;
    constructor(reservedConnection: ReservedSql);
    beginTransaction(settings: TransactionSettings): Promise<void>;
    commitTransaction(): Promise<void>;
    executeQuery<R>(compiledQuery: CompiledQuery<unknown>): Promise<QueryResult<R>>;
    releaseConnection(): void;
    rollbackTransaction(): Promise<void>;
    streamQuery<R>(compiledQuery: CompiledQuery<unknown>, chunkSize: number): AsyncIterableIterator<QueryResult<R>>;
}

interface PostgresJSDialectConfig {
    readonly postgres: Sql;
}

declare class PostgresJSDialect implements Dialect {
    #private;
    constructor(config: PostgresJSDialectConfig);
    createAdapter(): DialectAdapter;
    createDriver(): Driver;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
    createQueryCompiler(): QueryCompiler;
}

declare class PostgresJSDriver implements Driver {
    #private;
    constructor(config: PostgresJSDialectConfig);
    init(): Promise<void>;
    acquireConnection(): Promise<PostgresJSConnection>;
    beginTransaction(connection: PostgresJSConnection, settings: TransactionSettings): Promise<void>;
    commitTransaction(connection: PostgresJSConnection): Promise<void>;
    rollbackTransaction(connection: PostgresJSConnection): Promise<void>;
    releaseConnection(connection: PostgresJSConnection): Promise<void>;
    destroy(): Promise<void>;
}

declare class PostgresJSDialectError extends Error {
    constructor(message: string);
}

export { PostgresJSConnection, PostgresJSDialect, PostgresJSDialectConfig, PostgresJSDialectError, PostgresJSDriver };
