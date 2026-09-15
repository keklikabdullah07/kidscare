/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Tenant
 *
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>;
/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Student
 *
 */
export type Student = $Result.DefaultSelection<Prisma.$StudentPayload>;
/**
 * Model DailyReport
 *
 */
export type DailyReport = $Result.DefaultSelection<Prisma.$DailyReportPayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const TenantStatus: {
    ACTIVE: 'ACTIVE';
    SUSPENDED: 'SUSPENDED';
    DELETED: 'DELETED';
  };

  export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

  export const UserRole: {
    ADMIN: 'ADMIN';
    TEACHER: 'TEACHER';
    PARENT: 'PARENT';
  };

  export type UserRole = (typeof UserRole)[keyof typeof UserRole];
}

export type TenantStatus = $Enums.TenantStatus;

export const TenantStatus: typeof $Enums.TenantStatus;

export type UserRole = $Enums.UserRole;

export const UserRole: typeof $Enums.UserRole;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void,
  ): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>;

  /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   */
  get tenant(): Prisma.TenantDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.student`: Exposes CRUD operations for the **Student** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Students
   * const students = await prisma.student.findMany()
   * ```
   */
  get student(): Prisma.StudentDelegate<ExtArgs>;

  /**
   * `prisma.dailyReport`: Exposes CRUD operations for the **DailyReport** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more DailyReports
   * const dailyReports = await prisma.dailyReport.findMany()
   * ```
   */
  get dailyReport(): Prisma.DailyReportDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;
  export import NotFoundError = runtime.NotFoundError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
        | ({ [P in keyof O as P extends K ? K : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Tenant: 'Tenant';
    User: 'User';
    Student: 'Student';
    DailyReport: 'DailyReport';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs; clientOptions: PrismaClientOptions },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    ClientOptions = {},
  > = {
    meta: {
      modelProps: 'tenant' | 'user' | 'student' | 'dailyReport';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>;
        fields: Prisma.TenantFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[];
          };
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[];
          };
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>;
          };
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTenant>;
          };
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TenantGroupByOutputType>[];
          };
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>;
            result: $Utils.Optional<TenantCountAggregateOutputType> | number;
          };
        };
      };
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      Student: {
        payload: Prisma.$StudentPayload<ExtArgs>;
        fields: Prisma.StudentFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.StudentFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.StudentFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          findFirst: {
            args: Prisma.StudentFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.StudentFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          findMany: {
            args: Prisma.StudentFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[];
          };
          create: {
            args: Prisma.StudentCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          createMany: {
            args: Prisma.StudentCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.StudentCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[];
          };
          delete: {
            args: Prisma.StudentDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          update: {
            args: Prisma.StudentUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          deleteMany: {
            args: Prisma.StudentDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.StudentUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.StudentUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>;
          };
          aggregate: {
            args: Prisma.StudentAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateStudent>;
          };
          groupBy: {
            args: Prisma.StudentGroupByArgs<ExtArgs>;
            result: $Utils.Optional<StudentGroupByOutputType>[];
          };
          count: {
            args: Prisma.StudentCountArgs<ExtArgs>;
            result: $Utils.Optional<StudentCountAggregateOutputType> | number;
          };
        };
      };
      DailyReport: {
        payload: Prisma.$DailyReportPayload<ExtArgs>;
        fields: Prisma.DailyReportFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DailyReportFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DailyReportFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          findFirst: {
            args: Prisma.DailyReportFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DailyReportFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          findMany: {
            args: Prisma.DailyReportFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>[];
          };
          create: {
            args: Prisma.DailyReportCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          createMany: {
            args: Prisma.DailyReportCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DailyReportCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>[];
          };
          delete: {
            args: Prisma.DailyReportDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          update: {
            args: Prisma.DailyReportUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          deleteMany: {
            args: Prisma.DailyReportDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DailyReportUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.DailyReportUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DailyReportPayload>;
          };
          aggregate: {
            args: Prisma.DailyReportAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDailyReport>;
          };
          groupBy: {
            args: Prisma.DailyReportGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DailyReportGroupByOutputType>[];
          };
          count: {
            args: Prisma.DailyReportCountArgs<ExtArgs>;
            result: $Utils.Optional<DailyReportCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition
    ? T['emit'] extends 'event'
      ? T['level']
      : never
    : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    users: number;
    students: number;
    dailyReports: number;
  };

  export type TenantCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    users?: boolean | TenantCountOutputTypeCountUsersArgs;
    students?: boolean | TenantCountOutputTypeCountStudentsArgs;
    dailyReports?: boolean | TenantCountOutputTypeCountDailyReportsArgs;
  };

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
  };

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountStudentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: StudentWhereInput;
  };

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountDailyReportsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DailyReportWhereInput;
  };

  /**
   * Count Type StudentCountOutputType
   */

  export type StudentCountOutputType = {
    dailyReports: number;
  };

  export type StudentCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    dailyReports?: boolean | StudentCountOutputTypeCountDailyReportsArgs;
  };

  // Custom InputTypes
  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the StudentCountOutputType
     */
    select?: StudentCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountDailyReportsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DailyReportWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
  };

  export type TenantMinAggregateOutputType = {
    id: string | null;
    slug: string | null;
    name: string | null;
    status: $Enums.TenantStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TenantMaxAggregateOutputType = {
    id: string | null;
    slug: string | null;
    name: string | null;
    status: $Enums.TenantStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TenantCountAggregateOutputType = {
    id: number;
    slug: number;
    name: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TenantMinAggregateInputType = {
    id?: true;
    slug?: true;
    name?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TenantMaxAggregateInputType = {
    id?: true;
    slug?: true;
    name?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TenantCountAggregateInputType = {
    id?: true;
    slug?: true;
    name?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TenantAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Tenants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Tenants
     **/
    _count?: true | TenantCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TenantMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TenantMaxAggregateInputType;
  };

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
    [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>;
  };

  export type TenantGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TenantWhereInput;
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[];
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum;
    having?: TenantScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TenantCountAggregateInputType | true;
    _min?: TenantMinAggregateInputType;
    _max?: TenantMaxAggregateInputType;
  };

  export type TenantGroupByOutputType = {
    id: string;
    slug: string;
    name: string;
    status: $Enums.TenantStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
  };

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> & {
        [P in keyof T & keyof TenantGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
          : GetScalarType<T[P], TenantGroupByOutputType[P]>;
      }
    >
  >;

  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        slug?: boolean;
        name?: boolean;
        status?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        users?: boolean | Tenant$usersArgs<ExtArgs>;
        students?: boolean | Tenant$studentsArgs<ExtArgs>;
        dailyReports?: boolean | Tenant$dailyReportsArgs<ExtArgs>;
        _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['tenant']
    >;

  export type TenantSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      slug?: boolean;
      name?: boolean;
      status?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['tenant']
  >;

  export type TenantSelectScalar = {
    id?: boolean;
    slug?: boolean;
    name?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Tenant$usersArgs<ExtArgs>;
    students?: boolean | Tenant$studentsArgs<ExtArgs>;
    dailyReports?: boolean | Tenant$dailyReportsArgs<ExtArgs>;
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type TenantIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'Tenant';
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[];
      students: Prisma.$StudentPayload<ExtArgs>[];
      dailyReports: Prisma.$DailyReportPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        slug: string;
        name: string;
        status: $Enums.TenantStatus;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['tenant']
    >;
    composites: {};
  };

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> =
    $Result.GetResult<Prisma.$TenantPayload, S>;

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    TenantFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: TenantCountAggregateInputType | true;
  };

  export interface TenantDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant']; meta: { name: 'Tenant' } };
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(
      args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(
      args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     *
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TenantFindManyArgs>(
      args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     *
     */
    create<T extends TenantCreateArgs>(
      args: SelectSubset<T, TenantCreateArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TenantCreateManyArgs>(
      args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     *
     */
    delete<T extends TenantDeleteArgs>(
      args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TenantUpdateArgs>(
      args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TenantDeleteManyArgs>(
      args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TenantUpdateManyArgs>(
      args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(
      args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
     **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TenantAggregateArgs>(
      args: Subset<T, TenantAggregateArgs>,
    ): Prisma.PrismaPromise<GetTenantAggregateType<T>>;

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T['by'] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Tenant model
     */
    readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    users<T extends Tenant$usersArgs<ExtArgs> = {}>(
      args?: Subset<T, Tenant$usersArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany'> | Null>;
    students<T extends Tenant$studentsArgs<ExtArgs> = {}>(
      args?: Subset<T, Tenant$studentsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    dailyReports<T extends Tenant$dailyReportsArgs<ExtArgs> = {}>(
      args?: Subset<T, Tenant$dailyReportsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<'Tenant', 'String'>;
    readonly slug: FieldRef<'Tenant', 'String'>;
    readonly name: FieldRef<'Tenant', 'String'>;
    readonly status: FieldRef<'Tenant', 'TenantStatus'>;
    readonly createdAt: FieldRef<'Tenant', 'DateTime'>;
    readonly updatedAt: FieldRef<'Tenant', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput;
  };

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput;
  };

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Tenants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[];
  };

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Tenants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[];
  };

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Tenants.
     */
    skip?: number;
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[];
  };

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Tenant
       */
      select?: TenantSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: TenantInclude<ExtArgs> | null;
      /**
       * The data needed to create a Tenant.
       */
      data: XOR<TenantCreateInput, TenantUncheckedCreateInput>;
    };

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Tenant
       */
      select?: TenantSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: TenantInclude<ExtArgs> | null;
      /**
       * The data needed to update a Tenant.
       */
      data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>;
      /**
       * Choose, which Tenant to update.
       */
      where: TenantWhereUniqueInput;
    };

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>;
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput;
  };

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Tenant
       */
      select?: TenantSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: TenantInclude<ExtArgs> | null;
      /**
       * The filter to search for the Tenant to update in case it exists.
       */
      where: TenantWhereUniqueInput;
      /**
       * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
       */
      create: XOR<TenantCreateInput, TenantUncheckedCreateInput>;
      /**
       * In case the Tenant was found with the provided `where` argument, update it with this data.
       */
      update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>;
    };

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Tenant
       */
      select?: TenantSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: TenantInclude<ExtArgs> | null;
      /**
       * Filter which Tenant to delete.
       */
      where: TenantWhereUniqueInput;
    };

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput;
  };

  /**
   * Tenant.users
   */
  export type Tenant$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      where?: UserWhereInput;
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      cursor?: UserWhereUniqueInput;
      take?: number;
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * Tenant.students
   */
  export type Tenant$studentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    where?: StudentWhereInput;
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[];
    cursor?: StudentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[];
  };

  /**
   * Tenant.dailyReports
   */
  export type Tenant$dailyReportsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    where?: DailyReportWhereInput;
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    cursor?: DailyReportWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DailyReportScalarFieldEnum | DailyReportScalarFieldEnum[];
  };

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null;
  };

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    email: string | null;
    passwordHash: string | null;
    role: $Enums.UserRole | null;
    isActive: boolean | null;
    lastLoginAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    email: string | null;
    passwordHash: string | null;
    role: $Enums.UserRole | null;
    isActive: boolean | null;
    lastLoginAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    tenantId: number;
    email: number;
    passwordHash: number;
    role: number;
    isActive: number;
    lastLoginAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    isActive?: true;
    lastLoginAt?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    isActive?: true;
    lastLoginAt?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    isActive?: true;
    lastLoginAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: UserWhereInput;
      orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
      by: UserScalarFieldEnum[] | UserScalarFieldEnum;
      having?: UserScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: UserCountAggregateInputType | true;
      _min?: UserMinAggregateInputType;
      _max?: UserMaxAggregateInputType;
    };

  export type UserGroupByOutputType = {
    id: string;
    tenantId: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        tenantId?: boolean;
        email?: boolean;
        passwordHash?: boolean;
        role?: boolean;
        isActive?: boolean;
        lastLoginAt?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        tenant?: boolean | TenantDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['user']
    >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tenantId?: boolean;
      email?: boolean;
      passwordHash?: boolean;
      role?: boolean;
      isActive?: boolean;
      lastLoginAt?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      tenant?: boolean | TenantDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    isActive?: boolean;
    lastLoginAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
  };

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'User';
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        tenantId: string;
        email: string;
        passwordHash: string;
        role: $Enums.UserRole;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['user']
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<
    Prisma.$UserPayload,
    S
  >;

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User']; meta: { name: 'User' } };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T['by'] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, TenantDefaultArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<'User', 'String'>;
    readonly tenantId: FieldRef<'User', 'String'>;
    readonly email: FieldRef<'User', 'String'>;
    readonly passwordHash: FieldRef<'User', 'String'>;
    readonly role: FieldRef<'User', 'UserRole'>;
    readonly isActive: FieldRef<'User', 'Boolean'>;
    readonly lastLoginAt: FieldRef<'User', 'DateTime'>;
    readonly createdAt: FieldRef<'User', 'DateTime'>;
    readonly updatedAt: FieldRef<'User', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      /**
       * Filter, which Users to fetch.
       */
      where?: UserWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of Users to fetch.
       */
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing Users.
       */
      cursor?: UserWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` Users from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` Users.
       */
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
    };

  /**
   * Model Student
   */

  export type AggregateStudent = {
    _count: StudentCountAggregateOutputType | null;
    _min: StudentMinAggregateOutputType | null;
    _max: StudentMaxAggregateOutputType | null;
  };

  export type StudentMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    notes: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
  };

  export type StudentMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    notes: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
  };

  export type StudentCountAggregateOutputType = {
    id: number;
    tenantId: number;
    firstName: number;
    lastName: number;
    dateOfBirth: number;
    gender: number;
    notes: number;
    passport: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    deletedAt: number;
    _all: number;
  };

  export type StudentMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    firstName?: true;
    lastName?: true;
    dateOfBirth?: true;
    gender?: true;
    notes?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
  };

  export type StudentMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    firstName?: true;
    lastName?: true;
    dateOfBirth?: true;
    gender?: true;
    notes?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
  };

  export type StudentCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    firstName?: true;
    lastName?: true;
    dateOfBirth?: true;
    gender?: true;
    notes?: true;
    passport?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
    _all?: true;
  };

  export type StudentAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Student to aggregate.
     */
    where?: StudentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: StudentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Students from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Students.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Students
     **/
    _count?: true | StudentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: StudentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: StudentMaxAggregateInputType;
  };

  export type GetStudentAggregateType<T extends StudentAggregateArgs> = {
    [P in keyof T & keyof AggregateStudent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStudent[P]>
      : GetScalarType<T[P], AggregateStudent[P]>;
  };

  export type StudentGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: StudentWhereInput;
    orderBy?: StudentOrderByWithAggregationInput | StudentOrderByWithAggregationInput[];
    by: StudentScalarFieldEnum[] | StudentScalarFieldEnum;
    having?: StudentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StudentCountAggregateInputType | true;
    _min?: StudentMinAggregateInputType;
    _max?: StudentMaxAggregateInputType;
  };

  export type StudentGroupByOutputType = {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string | null;
    notes: string | null;
    passport: JsonValue | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    _count: StudentCountAggregateOutputType | null;
    _min: StudentMinAggregateOutputType | null;
    _max: StudentMaxAggregateOutputType | null;
  };

  type GetStudentGroupByPayload<T extends StudentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StudentGroupByOutputType, T['by']> & {
        [P in keyof T & keyof StudentGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], StudentGroupByOutputType[P]>
          : GetScalarType<T[P], StudentGroupByOutputType[P]>;
      }
    >
  >;

  export type StudentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        tenantId?: boolean;
        firstName?: boolean;
        lastName?: boolean;
        dateOfBirth?: boolean;
        gender?: boolean;
        notes?: boolean;
        passport?: boolean;
        isActive?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        deletedAt?: boolean;
        tenant?: boolean | TenantDefaultArgs<ExtArgs>;
        dailyReports?: boolean | Student$dailyReportsArgs<ExtArgs>;
        _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['student']
    >;

  export type StudentSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tenantId?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      dateOfBirth?: boolean;
      gender?: boolean;
      notes?: boolean;
      passport?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      deletedAt?: boolean;
      tenant?: boolean | TenantDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['student']
  >;

  export type StudentSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    dateOfBirth?: boolean;
    gender?: boolean;
    notes?: boolean;
    passport?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
  };

  export type StudentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
    dailyReports?: boolean | Student$dailyReportsArgs<ExtArgs>;
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type StudentIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
  };

  export type $StudentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      name: 'Student';
      objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
        dailyReports: Prisma.$DailyReportPayload<ExtArgs>[];
      };
      scalars: $Extensions.GetPayloadResult<
        {
          id: string;
          tenantId: string;
          firstName: string;
          lastName: string;
          dateOfBirth: Date;
          gender: string | null;
          notes: string | null;
          passport: Prisma.JsonValue | null;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
          deletedAt: Date | null;
        },
        ExtArgs['result']['student']
      >;
      composites: {};
    };

  type StudentGetPayload<S extends boolean | null | undefined | StudentDefaultArgs> =
    $Result.GetResult<Prisma.$StudentPayload, S>;

  type StudentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    StudentFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: StudentCountAggregateInputType | true;
  };

  export interface StudentDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Student']; meta: { name: 'Student' } };
    /**
     * Find zero or one Student that matches the filter.
     * @param {StudentFindUniqueArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StudentFindUniqueArgs>(
      args: SelectSubset<T, StudentFindUniqueArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Student that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StudentFindUniqueOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StudentFindUniqueOrThrowArgs>(
      args: SelectSubset<T, StudentFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Student that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StudentFindFirstArgs>(
      args?: SelectSubset<T, StudentFindFirstArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Student that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StudentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, StudentFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Students that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Students
     * const students = await prisma.student.findMany()
     *
     * // Get first 10 Students
     * const students = await prisma.student.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const studentWithIdOnly = await prisma.student.findMany({ select: { id: true } })
     *
     */
    findMany<T extends StudentFindManyArgs>(
      args?: SelectSubset<T, StudentFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Student.
     * @param {StudentCreateArgs} args - Arguments to create a Student.
     * @example
     * // Create one Student
     * const Student = await prisma.student.create({
     *   data: {
     *     // ... data to create a Student
     *   }
     * })
     *
     */
    create<T extends StudentCreateArgs>(
      args: SelectSubset<T, StudentCreateArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Students.
     * @param {StudentCreateManyArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends StudentCreateManyArgs>(
      args?: SelectSubset<T, StudentCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Students and returns the data saved in the database.
     * @param {StudentCreateManyAndReturnArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Students and only return the `id`
     * const studentWithIdOnly = await prisma.student.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends StudentCreateManyAndReturnArgs>(
      args?: SelectSubset<T, StudentCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Student.
     * @param {StudentDeleteArgs} args - Arguments to delete one Student.
     * @example
     * // Delete one Student
     * const Student = await prisma.student.delete({
     *   where: {
     *     // ... filter to delete one Student
     *   }
     * })
     *
     */
    delete<T extends StudentDeleteArgs>(
      args: SelectSubset<T, StudentDeleteArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Student.
     * @param {StudentUpdateArgs} args - Arguments to update one Student.
     * @example
     * // Update one Student
     * const student = await prisma.student.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends StudentUpdateArgs>(
      args: SelectSubset<T, StudentUpdateArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Students.
     * @param {StudentDeleteManyArgs} args - Arguments to filter Students to delete.
     * @example
     * // Delete a few Students
     * const { count } = await prisma.student.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends StudentDeleteManyArgs>(
      args?: SelectSubset<T, StudentDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Students
     * const student = await prisma.student.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends StudentUpdateManyArgs>(
      args: SelectSubset<T, StudentUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Student.
     * @param {StudentUpsertArgs} args - Arguments to update or create a Student.
     * @example
     * // Update or create a Student
     * const student = await prisma.student.upsert({
     *   create: {
     *     // ... data to create a Student
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Student we want to update
     *   }
     * })
     */
    upsert<T extends StudentUpsertArgs>(
      args: SelectSubset<T, StudentUpsertArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentCountArgs} args - Arguments to filter Students to count.
     * @example
     * // Count the number of Students
     * const count = await prisma.student.count({
     *   where: {
     *     // ... the filter for the Students we want to count
     *   }
     * })
     **/
    count<T extends StudentCountArgs>(
      args?: Subset<T, StudentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StudentCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends StudentAggregateArgs>(
      args: Subset<T, StudentAggregateArgs>,
    ): Prisma.PrismaPromise<GetStudentAggregateType<T>>;

    /**
     * Group by Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends StudentGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: StudentGroupByArgs['orderBy'] }
        : { orderBy?: StudentGroupByArgs['orderBy'] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T['by'] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, StudentGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Student model
     */
    readonly fields: StudentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Student.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StudentClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, TenantDefaultArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    dailyReports<T extends Student$dailyReportsArgs<ExtArgs> = {}>(
      args?: Subset<T, Student$dailyReportsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Student model
   */
  interface StudentFieldRefs {
    readonly id: FieldRef<'Student', 'String'>;
    readonly tenantId: FieldRef<'Student', 'String'>;
    readonly firstName: FieldRef<'Student', 'String'>;
    readonly lastName: FieldRef<'Student', 'String'>;
    readonly dateOfBirth: FieldRef<'Student', 'DateTime'>;
    readonly gender: FieldRef<'Student', 'String'>;
    readonly notes: FieldRef<'Student', 'String'>;
    readonly passport: FieldRef<'Student', 'Json'>;
    readonly isActive: FieldRef<'Student', 'Boolean'>;
    readonly createdAt: FieldRef<'Student', 'DateTime'>;
    readonly updatedAt: FieldRef<'Student', 'DateTime'>;
    readonly deletedAt: FieldRef<'Student', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Student findUnique
   */
  export type StudentFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput;
  };

  /**
   * Student findUniqueOrThrow
   */
  export type StudentFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput;
  };

  /**
   * Student findFirst
   */
  export type StudentFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Students from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Students.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[];
  };

  /**
   * Student findFirstOrThrow
   */
  export type StudentFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Students from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Students.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[];
  };

  /**
   * Student findMany
   */
  export type StudentFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter, which Students to fetch.
     */
    where?: StudentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Students.
     */
    cursor?: StudentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Students from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Students.
     */
    skip?: number;
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[];
  };

  /**
   * Student create
   */
  export type StudentCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Student.
     */
    data: XOR<StudentCreateInput, StudentUncheckedCreateInput>;
  };

  /**
   * Student createMany
   */
  export type StudentCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Student createManyAndReturn
   */
  export type StudentCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Student update
   */
  export type StudentUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Student.
     */
    data: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>;
    /**
     * Choose, which Student to update.
     */
    where: StudentWhereUniqueInput;
  };

  /**
   * Student updateMany
   */
  export type StudentUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Students.
     */
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyInput>;
    /**
     * Filter which Students to update
     */
    where?: StudentWhereInput;
  };

  /**
   * Student upsert
   */
  export type StudentUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Student to update in case it exists.
     */
    where: StudentWhereUniqueInput;
    /**
     * In case the Student found by the `where` argument doesn't exist, create a new Student with this data.
     */
    create: XOR<StudentCreateInput, StudentUncheckedCreateInput>;
    /**
     * In case the Student was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>;
  };

  /**
   * Student delete
   */
  export type StudentDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
    /**
     * Filter which Student to delete.
     */
    where: StudentWhereUniqueInput;
  };

  /**
   * Student deleteMany
   */
  export type StudentDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Students to delete
     */
    where?: StudentWhereInput;
  };

  /**
   * Student.dailyReports
   */
  export type Student$dailyReportsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    where?: DailyReportWhereInput;
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    cursor?: DailyReportWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DailyReportScalarFieldEnum | DailyReportScalarFieldEnum[];
  };

  /**
   * Student without action
   */
  export type StudentDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null;
  };

  /**
   * Model DailyReport
   */

  export type AggregateDailyReport = {
    _count: DailyReportCountAggregateOutputType | null;
    _min: DailyReportMinAggregateOutputType | null;
    _max: DailyReportMaxAggregateOutputType | null;
  };

  export type DailyReportMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    studentId: string | null;
    date: Date | null;
    mood: string | null;
    teacherNote: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DailyReportMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    studentId: string | null;
    date: Date | null;
    mood: string | null;
    teacherNote: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DailyReportCountAggregateOutputType = {
    id: number;
    tenantId: number;
    studentId: number;
    date: number;
    mood: number;
    meals: number;
    naps: number;
    potty: number;
    activities: number;
    medications: number;
    teacherNote: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type DailyReportMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    studentId?: true;
    date?: true;
    mood?: true;
    teacherNote?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DailyReportMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    studentId?: true;
    date?: true;
    mood?: true;
    teacherNote?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DailyReportCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    studentId?: true;
    date?: true;
    mood?: true;
    meals?: true;
    naps?: true;
    potty?: true;
    activities?: true;
    medications?: true;
    teacherNote?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type DailyReportAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DailyReport to aggregate.
     */
    where?: DailyReportWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DailyReports to fetch.
     */
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DailyReportWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DailyReports from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DailyReports.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DailyReports
     **/
    _count?: true | DailyReportCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DailyReportMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DailyReportMaxAggregateInputType;
  };

  export type GetDailyReportAggregateType<T extends DailyReportAggregateArgs> = {
    [P in keyof T & keyof AggregateDailyReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyReport[P]>
      : GetScalarType<T[P], AggregateDailyReport[P]>;
  };

  export type DailyReportGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DailyReportWhereInput;
    orderBy?: DailyReportOrderByWithAggregationInput | DailyReportOrderByWithAggregationInput[];
    by: DailyReportScalarFieldEnum[] | DailyReportScalarFieldEnum;
    having?: DailyReportScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DailyReportCountAggregateInputType | true;
    _min?: DailyReportMinAggregateInputType;
    _max?: DailyReportMaxAggregateInputType;
  };

  export type DailyReportGroupByOutputType = {
    id: string;
    tenantId: string;
    studentId: string;
    date: Date;
    mood: string | null;
    meals: JsonValue | null;
    naps: JsonValue | null;
    potty: JsonValue | null;
    activities: JsonValue | null;
    medications: JsonValue | null;
    teacherNote: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: DailyReportCountAggregateOutputType | null;
    _min: DailyReportMinAggregateOutputType | null;
    _max: DailyReportMaxAggregateOutputType | null;
  };

  type GetDailyReportGroupByPayload<T extends DailyReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyReportGroupByOutputType, T['by']> & {
        [P in keyof T & keyof DailyReportGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DailyReportGroupByOutputType[P]>
          : GetScalarType<T[P], DailyReportGroupByOutputType[P]>;
      }
    >
  >;

  export type DailyReportSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tenantId?: boolean;
      studentId?: boolean;
      date?: boolean;
      mood?: boolean;
      meals?: boolean;
      naps?: boolean;
      potty?: boolean;
      activities?: boolean;
      medications?: boolean;
      teacherNote?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      tenant?: boolean | TenantDefaultArgs<ExtArgs>;
      student?: boolean | StudentDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['dailyReport']
  >;

  export type DailyReportSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tenantId?: boolean;
      studentId?: boolean;
      date?: boolean;
      mood?: boolean;
      meals?: boolean;
      naps?: boolean;
      potty?: boolean;
      activities?: boolean;
      medications?: boolean;
      teacherNote?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      tenant?: boolean | TenantDefaultArgs<ExtArgs>;
      student?: boolean | StudentDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['dailyReport']
  >;

  export type DailyReportSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    studentId?: boolean;
    date?: boolean;
    mood?: boolean;
    meals?: boolean;
    naps?: boolean;
    potty?: boolean;
    activities?: boolean;
    medications?: boolean;
    teacherNote?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type DailyReportInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
    student?: boolean | StudentDefaultArgs<ExtArgs>;
  };
  export type DailyReportIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>;
    student?: boolean | StudentDefaultArgs<ExtArgs>;
  };

  export type $DailyReportPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'DailyReport';
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>;
      student: Prisma.$StudentPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        tenantId: string;
        studentId: string;
        date: Date;
        mood: string | null;
        meals: Prisma.JsonValue | null;
        naps: Prisma.JsonValue | null;
        potty: Prisma.JsonValue | null;
        activities: Prisma.JsonValue | null;
        medications: Prisma.JsonValue | null;
        teacherNote: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['dailyReport']
    >;
    composites: {};
  };

  type DailyReportGetPayload<S extends boolean | null | undefined | DailyReportDefaultArgs> =
    $Result.GetResult<Prisma.$DailyReportPayload, S>;

  type DailyReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DailyReportCountAggregateInputType | true;
    };

  export interface DailyReportDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['DailyReport'];
      meta: { name: 'DailyReport' };
    };
    /**
     * Find zero or one DailyReport that matches the filter.
     * @param {DailyReportFindUniqueArgs} args - Arguments to find a DailyReport
     * @example
     * // Get one DailyReport
     * const dailyReport = await prisma.dailyReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyReportFindUniqueArgs>(
      args: SelectSubset<T, DailyReportFindUniqueArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one DailyReport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyReportFindUniqueOrThrowArgs} args - Arguments to find a DailyReport
     * @example
     * // Get one DailyReport
     * const dailyReport = await prisma.dailyReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyReportFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DailyReportFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first DailyReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportFindFirstArgs} args - Arguments to find a DailyReport
     * @example
     * // Get one DailyReport
     * const dailyReport = await prisma.dailyReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyReportFindFirstArgs>(
      args?: SelectSubset<T, DailyReportFindFirstArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first DailyReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportFindFirstOrThrowArgs} args - Arguments to find a DailyReport
     * @example
     * // Get one DailyReport
     * const dailyReport = await prisma.dailyReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyReportFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DailyReportFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more DailyReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyReports
     * const dailyReports = await prisma.dailyReport.findMany()
     *
     * // Get first 10 DailyReports
     * const dailyReports = await prisma.dailyReport.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const dailyReportWithIdOnly = await prisma.dailyReport.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DailyReportFindManyArgs>(
      args?: SelectSubset<T, DailyReportFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a DailyReport.
     * @param {DailyReportCreateArgs} args - Arguments to create a DailyReport.
     * @example
     * // Create one DailyReport
     * const DailyReport = await prisma.dailyReport.create({
     *   data: {
     *     // ... data to create a DailyReport
     *   }
     * })
     *
     */
    create<T extends DailyReportCreateArgs>(
      args: SelectSubset<T, DailyReportCreateArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many DailyReports.
     * @param {DailyReportCreateManyArgs} args - Arguments to create many DailyReports.
     * @example
     * // Create many DailyReports
     * const dailyReport = await prisma.dailyReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DailyReportCreateManyArgs>(
      args?: SelectSubset<T, DailyReportCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many DailyReports and returns the data saved in the database.
     * @param {DailyReportCreateManyAndReturnArgs} args - Arguments to create many DailyReports.
     * @example
     * // Create many DailyReports
     * const dailyReport = await prisma.dailyReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DailyReports and only return the `id`
     * const dailyReportWithIdOnly = await prisma.dailyReport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DailyReportCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DailyReportCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a DailyReport.
     * @param {DailyReportDeleteArgs} args - Arguments to delete one DailyReport.
     * @example
     * // Delete one DailyReport
     * const DailyReport = await prisma.dailyReport.delete({
     *   where: {
     *     // ... filter to delete one DailyReport
     *   }
     * })
     *
     */
    delete<T extends DailyReportDeleteArgs>(
      args: SelectSubset<T, DailyReportDeleteArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one DailyReport.
     * @param {DailyReportUpdateArgs} args - Arguments to update one DailyReport.
     * @example
     * // Update one DailyReport
     * const dailyReport = await prisma.dailyReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DailyReportUpdateArgs>(
      args: SelectSubset<T, DailyReportUpdateArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more DailyReports.
     * @param {DailyReportDeleteManyArgs} args - Arguments to filter DailyReports to delete.
     * @example
     * // Delete a few DailyReports
     * const { count } = await prisma.dailyReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DailyReportDeleteManyArgs>(
      args?: SelectSubset<T, DailyReportDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DailyReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyReports
     * const dailyReport = await prisma.dailyReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DailyReportUpdateManyArgs>(
      args: SelectSubset<T, DailyReportUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one DailyReport.
     * @param {DailyReportUpsertArgs} args - Arguments to update or create a DailyReport.
     * @example
     * // Update or create a DailyReport
     * const dailyReport = await prisma.dailyReport.upsert({
     *   create: {
     *     // ... data to create a DailyReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyReport we want to update
     *   }
     * })
     */
    upsert<T extends DailyReportUpsertArgs>(
      args: SelectSubset<T, DailyReportUpsertArgs<ExtArgs>>,
    ): Prisma__DailyReportClient<
      $Result.GetResult<Prisma.$DailyReportPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of DailyReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportCountArgs} args - Arguments to filter DailyReports to count.
     * @example
     * // Count the number of DailyReports
     * const count = await prisma.dailyReport.count({
     *   where: {
     *     // ... the filter for the DailyReports we want to count
     *   }
     * })
     **/
    count<T extends DailyReportCountArgs>(
      args?: Subset<T, DailyReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyReportCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a DailyReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DailyReportAggregateArgs>(
      args: Subset<T, DailyReportAggregateArgs>,
    ): Prisma.PrismaPromise<GetDailyReportAggregateType<T>>;

    /**
     * Group by DailyReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyReportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DailyReportGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: DailyReportGroupByArgs['orderBy'] }
        : { orderBy?: DailyReportGroupByArgs['orderBy'] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T['by'] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, DailyReportGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetDailyReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DailyReport model
     */
    readonly fields: DailyReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyReportClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, TenantDefaultArgs<ExtArgs>>,
    ): Prisma__TenantClient<
      $Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, StudentDefaultArgs<ExtArgs>>,
    ): Prisma__StudentClient<
      $Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the DailyReport model
   */
  interface DailyReportFieldRefs {
    readonly id: FieldRef<'DailyReport', 'String'>;
    readonly tenantId: FieldRef<'DailyReport', 'String'>;
    readonly studentId: FieldRef<'DailyReport', 'String'>;
    readonly date: FieldRef<'DailyReport', 'DateTime'>;
    readonly mood: FieldRef<'DailyReport', 'String'>;
    readonly meals: FieldRef<'DailyReport', 'Json'>;
    readonly naps: FieldRef<'DailyReport', 'Json'>;
    readonly potty: FieldRef<'DailyReport', 'Json'>;
    readonly activities: FieldRef<'DailyReport', 'Json'>;
    readonly medications: FieldRef<'DailyReport', 'Json'>;
    readonly teacherNote: FieldRef<'DailyReport', 'String'>;
    readonly createdAt: FieldRef<'DailyReport', 'DateTime'>;
    readonly updatedAt: FieldRef<'DailyReport', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * DailyReport findUnique
   */
  export type DailyReportFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter, which DailyReport to fetch.
     */
    where: DailyReportWhereUniqueInput;
  };

  /**
   * DailyReport findUniqueOrThrow
   */
  export type DailyReportFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter, which DailyReport to fetch.
     */
    where: DailyReportWhereUniqueInput;
  };

  /**
   * DailyReport findFirst
   */
  export type DailyReportFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter, which DailyReport to fetch.
     */
    where?: DailyReportWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DailyReports to fetch.
     */
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DailyReports.
     */
    cursor?: DailyReportWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DailyReports from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DailyReports.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DailyReports.
     */
    distinct?: DailyReportScalarFieldEnum | DailyReportScalarFieldEnum[];
  };

  /**
   * DailyReport findFirstOrThrow
   */
  export type DailyReportFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter, which DailyReport to fetch.
     */
    where?: DailyReportWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DailyReports to fetch.
     */
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DailyReports.
     */
    cursor?: DailyReportWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DailyReports from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DailyReports.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DailyReports.
     */
    distinct?: DailyReportScalarFieldEnum | DailyReportScalarFieldEnum[];
  };

  /**
   * DailyReport findMany
   */
  export type DailyReportFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter, which DailyReports to fetch.
     */
    where?: DailyReportWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DailyReports to fetch.
     */
    orderBy?: DailyReportOrderByWithRelationInput | DailyReportOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DailyReports.
     */
    cursor?: DailyReportWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DailyReports from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DailyReports.
     */
    skip?: number;
    distinct?: DailyReportScalarFieldEnum | DailyReportScalarFieldEnum[];
  };

  /**
   * DailyReport create
   */
  export type DailyReportCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * The data needed to create a DailyReport.
     */
    data: XOR<DailyReportCreateInput, DailyReportUncheckedCreateInput>;
  };

  /**
   * DailyReport createMany
   */
  export type DailyReportCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many DailyReports.
     */
    data: DailyReportCreateManyInput | DailyReportCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * DailyReport createManyAndReturn
   */
  export type DailyReportCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many DailyReports.
     */
    data: DailyReportCreateManyInput | DailyReportCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DailyReport update
   */
  export type DailyReportUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * The data needed to update a DailyReport.
     */
    data: XOR<DailyReportUpdateInput, DailyReportUncheckedUpdateInput>;
    /**
     * Choose, which DailyReport to update.
     */
    where: DailyReportWhereUniqueInput;
  };

  /**
   * DailyReport updateMany
   */
  export type DailyReportUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update DailyReports.
     */
    data: XOR<DailyReportUpdateManyMutationInput, DailyReportUncheckedUpdateManyInput>;
    /**
     * Filter which DailyReports to update
     */
    where?: DailyReportWhereInput;
  };

  /**
   * DailyReport upsert
   */
  export type DailyReportUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * The filter to search for the DailyReport to update in case it exists.
     */
    where: DailyReportWhereUniqueInput;
    /**
     * In case the DailyReport found by the `where` argument doesn't exist, create a new DailyReport with this data.
     */
    create: XOR<DailyReportCreateInput, DailyReportUncheckedCreateInput>;
    /**
     * In case the DailyReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyReportUpdateInput, DailyReportUncheckedUpdateInput>;
  };

  /**
   * DailyReport delete
   */
  export type DailyReportDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
    /**
     * Filter which DailyReport to delete.
     */
    where: DailyReportWhereUniqueInput;
  };

  /**
   * DailyReport deleteMany
   */
  export type DailyReportDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DailyReports to delete
     */
    where?: DailyReportWhereInput;
  };

  /**
   * DailyReport without action
   */
  export type DailyReportDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DailyReport
     */
    select?: DailyReportSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyReportInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const TenantScalarFieldEnum: {
    id: 'id';
    slug: 'slug';
    name: 'name';
    status: 'status';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type TenantScalarFieldEnum =
    (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum];

  export const UserScalarFieldEnum: {
    id: 'id';
    tenantId: 'tenantId';
    email: 'email';
    passwordHash: 'passwordHash';
    role: 'role';
    isActive: 'isActive';
    lastLoginAt: 'lastLoginAt';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const StudentScalarFieldEnum: {
    id: 'id';
    tenantId: 'tenantId';
    firstName: 'firstName';
    lastName: 'lastName';
    dateOfBirth: 'dateOfBirth';
    gender: 'gender';
    notes: 'notes';
    passport: 'passport';
    isActive: 'isActive';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
    deletedAt: 'deletedAt';
  };

  export type StudentScalarFieldEnum =
    (typeof StudentScalarFieldEnum)[keyof typeof StudentScalarFieldEnum];

  export const DailyReportScalarFieldEnum: {
    id: 'id';
    tenantId: 'tenantId';
    studentId: 'studentId';
    date: 'date';
    mood: 'mood';
    meals: 'meals';
    naps: 'naps';
    potty: 'potty';
    activities: 'activities';
    medications: 'medications';
    teacherNote: 'teacherNote';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type DailyReportScalarFieldEnum =
    (typeof DailyReportScalarFieldEnum)[keyof typeof DailyReportScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
  };

  export type NullableJsonNullValueInput =
    (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;

  /**
   * Reference to a field of type 'TenantStatus'
   */
  export type EnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'TenantStatus'
  >;

  /**
   * Reference to a field of type 'TenantStatus[]'
   */
  export type ListEnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'TenantStatus[]'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>;

  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'UserRole[]'
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;

  /**
   * Deep Input Types
   */

  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[];
    OR?: TenantWhereInput[];
    NOT?: TenantWhereInput | TenantWhereInput[];
    id?: StringFilter<'Tenant'> | string;
    slug?: StringFilter<'Tenant'> | string;
    name?: StringFilter<'Tenant'> | string;
    status?: EnumTenantStatusFilter<'Tenant'> | $Enums.TenantStatus;
    createdAt?: DateTimeFilter<'Tenant'> | Date | string;
    updatedAt?: DateTimeFilter<'Tenant'> | Date | string;
    users?: UserListRelationFilter;
    students?: StudentListRelationFilter;
    dailyReports?: DailyReportListRelationFilter;
  };

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder;
    slug?: SortOrder;
    name?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    users?: UserOrderByRelationAggregateInput;
    students?: StudentOrderByRelationAggregateInput;
    dailyReports?: DailyReportOrderByRelationAggregateInput;
  };

  export type TenantWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      slug?: string;
      AND?: TenantWhereInput | TenantWhereInput[];
      OR?: TenantWhereInput[];
      NOT?: TenantWhereInput | TenantWhereInput[];
      name?: StringFilter<'Tenant'> | string;
      status?: EnumTenantStatusFilter<'Tenant'> | $Enums.TenantStatus;
      createdAt?: DateTimeFilter<'Tenant'> | Date | string;
      updatedAt?: DateTimeFilter<'Tenant'> | Date | string;
      users?: UserListRelationFilter;
      students?: StudentListRelationFilter;
      dailyReports?: DailyReportListRelationFilter;
    },
    'id' | 'slug'
  >;

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder;
    slug?: SortOrder;
    name?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TenantCountOrderByAggregateInput;
    _max?: TenantMaxOrderByAggregateInput;
    _min?: TenantMinOrderByAggregateInput;
  };

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[];
    OR?: TenantScalarWhereWithAggregatesInput[];
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Tenant'> | string;
    slug?: StringWithAggregatesFilter<'Tenant'> | string;
    name?: StringWithAggregatesFilter<'Tenant'> | string;
    status?: EnumTenantStatusWithAggregatesFilter<'Tenant'> | $Enums.TenantStatus;
    createdAt?: DateTimeWithAggregatesFilter<'Tenant'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Tenant'> | Date | string;
  };

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<'User'> | string;
    tenantId?: StringFilter<'User'> | string;
    email?: StringFilter<'User'> | string;
    passwordHash?: StringFilter<'User'> | string;
    role?: EnumUserRoleFilter<'User'> | $Enums.UserRole;
    isActive?: BoolFilter<'User'> | boolean;
    lastLoginAt?: DateTimeNullableFilter<'User'> | Date | string | null;
    createdAt?: DateTimeFilter<'User'> | Date | string;
    updatedAt?: DateTimeFilter<'User'> | Date | string;
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    lastLoginAt?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    tenant?: TenantOrderByWithRelationInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      tenantId_email?: UserTenantIdEmailCompoundUniqueInput;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      tenantId?: StringFilter<'User'> | string;
      email?: StringFilter<'User'> | string;
      passwordHash?: StringFilter<'User'> | string;
      role?: EnumUserRoleFilter<'User'> | $Enums.UserRole;
      isActive?: BoolFilter<'User'> | boolean;
      lastLoginAt?: DateTimeNullableFilter<'User'> | Date | string | null;
      createdAt?: DateTimeFilter<'User'> | Date | string;
      updatedAt?: DateTimeFilter<'User'> | Date | string;
      tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
    },
    'id' | 'tenantId_email'
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    lastLoginAt?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'User'> | string;
    tenantId?: StringWithAggregatesFilter<'User'> | string;
    email?: StringWithAggregatesFilter<'User'> | string;
    passwordHash?: StringWithAggregatesFilter<'User'> | string;
    role?: EnumUserRoleWithAggregatesFilter<'User'> | $Enums.UserRole;
    isActive?: BoolWithAggregatesFilter<'User'> | boolean;
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<'User'> | Date | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
  };

  export type StudentWhereInput = {
    AND?: StudentWhereInput | StudentWhereInput[];
    OR?: StudentWhereInput[];
    NOT?: StudentWhereInput | StudentWhereInput[];
    id?: StringFilter<'Student'> | string;
    tenantId?: StringFilter<'Student'> | string;
    firstName?: StringFilter<'Student'> | string;
    lastName?: StringFilter<'Student'> | string;
    dateOfBirth?: DateTimeFilter<'Student'> | Date | string;
    gender?: StringNullableFilter<'Student'> | string | null;
    notes?: StringNullableFilter<'Student'> | string | null;
    passport?: JsonNullableFilter<'Student'>;
    isActive?: BoolFilter<'Student'> | boolean;
    createdAt?: DateTimeFilter<'Student'> | Date | string;
    updatedAt?: DateTimeFilter<'Student'> | Date | string;
    deletedAt?: DateTimeNullableFilter<'Student'> | Date | string | null;
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
    dailyReports?: DailyReportListRelationFilter;
  };

  export type StudentOrderByWithRelationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    dateOfBirth?: SortOrder;
    gender?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    passport?: SortOrderInput | SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    tenant?: TenantOrderByWithRelationInput;
    dailyReports?: DailyReportOrderByRelationAggregateInput;
  };

  export type StudentWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: StudentWhereInput | StudentWhereInput[];
      OR?: StudentWhereInput[];
      NOT?: StudentWhereInput | StudentWhereInput[];
      tenantId?: StringFilter<'Student'> | string;
      firstName?: StringFilter<'Student'> | string;
      lastName?: StringFilter<'Student'> | string;
      dateOfBirth?: DateTimeFilter<'Student'> | Date | string;
      gender?: StringNullableFilter<'Student'> | string | null;
      notes?: StringNullableFilter<'Student'> | string | null;
      passport?: JsonNullableFilter<'Student'>;
      isActive?: BoolFilter<'Student'> | boolean;
      createdAt?: DateTimeFilter<'Student'> | Date | string;
      updatedAt?: DateTimeFilter<'Student'> | Date | string;
      deletedAt?: DateTimeNullableFilter<'Student'> | Date | string | null;
      tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
      dailyReports?: DailyReportListRelationFilter;
    },
    'id'
  >;

  export type StudentOrderByWithAggregationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    dateOfBirth?: SortOrder;
    gender?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    passport?: SortOrderInput | SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    _count?: StudentCountOrderByAggregateInput;
    _max?: StudentMaxOrderByAggregateInput;
    _min?: StudentMinOrderByAggregateInput;
  };

  export type StudentScalarWhereWithAggregatesInput = {
    AND?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[];
    OR?: StudentScalarWhereWithAggregatesInput[];
    NOT?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Student'> | string;
    tenantId?: StringWithAggregatesFilter<'Student'> | string;
    firstName?: StringWithAggregatesFilter<'Student'> | string;
    lastName?: StringWithAggregatesFilter<'Student'> | string;
    dateOfBirth?: DateTimeWithAggregatesFilter<'Student'> | Date | string;
    gender?: StringNullableWithAggregatesFilter<'Student'> | string | null;
    notes?: StringNullableWithAggregatesFilter<'Student'> | string | null;
    passport?: JsonNullableWithAggregatesFilter<'Student'>;
    isActive?: BoolWithAggregatesFilter<'Student'> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<'Student'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Student'> | Date | string;
    deletedAt?: DateTimeNullableWithAggregatesFilter<'Student'> | Date | string | null;
  };

  export type DailyReportWhereInput = {
    AND?: DailyReportWhereInput | DailyReportWhereInput[];
    OR?: DailyReportWhereInput[];
    NOT?: DailyReportWhereInput | DailyReportWhereInput[];
    id?: StringFilter<'DailyReport'> | string;
    tenantId?: StringFilter<'DailyReport'> | string;
    studentId?: StringFilter<'DailyReport'> | string;
    date?: DateTimeFilter<'DailyReport'> | Date | string;
    mood?: StringNullableFilter<'DailyReport'> | string | null;
    meals?: JsonNullableFilter<'DailyReport'>;
    naps?: JsonNullableFilter<'DailyReport'>;
    potty?: JsonNullableFilter<'DailyReport'>;
    activities?: JsonNullableFilter<'DailyReport'>;
    medications?: JsonNullableFilter<'DailyReport'>;
    teacherNote?: StringNullableFilter<'DailyReport'> | string | null;
    createdAt?: DateTimeFilter<'DailyReport'> | Date | string;
    updatedAt?: DateTimeFilter<'DailyReport'> | Date | string;
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
    student?: XOR<StudentRelationFilter, StudentWhereInput>;
  };

  export type DailyReportOrderByWithRelationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    studentId?: SortOrder;
    date?: SortOrder;
    mood?: SortOrderInput | SortOrder;
    meals?: SortOrderInput | SortOrder;
    naps?: SortOrderInput | SortOrder;
    potty?: SortOrderInput | SortOrder;
    activities?: SortOrderInput | SortOrder;
    medications?: SortOrderInput | SortOrder;
    teacherNote?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    tenant?: TenantOrderByWithRelationInput;
    student?: StudentOrderByWithRelationInput;
  };

  export type DailyReportWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      tenantId_studentId_date?: DailyReportTenantIdStudentIdDateCompoundUniqueInput;
      AND?: DailyReportWhereInput | DailyReportWhereInput[];
      OR?: DailyReportWhereInput[];
      NOT?: DailyReportWhereInput | DailyReportWhereInput[];
      tenantId?: StringFilter<'DailyReport'> | string;
      studentId?: StringFilter<'DailyReport'> | string;
      date?: DateTimeFilter<'DailyReport'> | Date | string;
      mood?: StringNullableFilter<'DailyReport'> | string | null;
      meals?: JsonNullableFilter<'DailyReport'>;
      naps?: JsonNullableFilter<'DailyReport'>;
      potty?: JsonNullableFilter<'DailyReport'>;
      activities?: JsonNullableFilter<'DailyReport'>;
      medications?: JsonNullableFilter<'DailyReport'>;
      teacherNote?: StringNullableFilter<'DailyReport'> | string | null;
      createdAt?: DateTimeFilter<'DailyReport'> | Date | string;
      updatedAt?: DateTimeFilter<'DailyReport'> | Date | string;
      tenant?: XOR<TenantRelationFilter, TenantWhereInput>;
      student?: XOR<StudentRelationFilter, StudentWhereInput>;
    },
    'id' | 'tenantId_studentId_date'
  >;

  export type DailyReportOrderByWithAggregationInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    studentId?: SortOrder;
    date?: SortOrder;
    mood?: SortOrderInput | SortOrder;
    meals?: SortOrderInput | SortOrder;
    naps?: SortOrderInput | SortOrder;
    potty?: SortOrderInput | SortOrder;
    activities?: SortOrderInput | SortOrder;
    medications?: SortOrderInput | SortOrder;
    teacherNote?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: DailyReportCountOrderByAggregateInput;
    _max?: DailyReportMaxOrderByAggregateInput;
    _min?: DailyReportMinOrderByAggregateInput;
  };

  export type DailyReportScalarWhereWithAggregatesInput = {
    AND?: DailyReportScalarWhereWithAggregatesInput | DailyReportScalarWhereWithAggregatesInput[];
    OR?: DailyReportScalarWhereWithAggregatesInput[];
    NOT?: DailyReportScalarWhereWithAggregatesInput | DailyReportScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'DailyReport'> | string;
    tenantId?: StringWithAggregatesFilter<'DailyReport'> | string;
    studentId?: StringWithAggregatesFilter<'DailyReport'> | string;
    date?: DateTimeWithAggregatesFilter<'DailyReport'> | Date | string;
    mood?: StringNullableWithAggregatesFilter<'DailyReport'> | string | null;
    meals?: JsonNullableWithAggregatesFilter<'DailyReport'>;
    naps?: JsonNullableWithAggregatesFilter<'DailyReport'>;
    potty?: JsonNullableWithAggregatesFilter<'DailyReport'>;
    activities?: JsonNullableWithAggregatesFilter<'DailyReport'>;
    medications?: JsonNullableWithAggregatesFilter<'DailyReport'>;
    teacherNote?: StringNullableWithAggregatesFilter<'DailyReport'> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'DailyReport'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'DailyReport'> | Date | string;
  };

  export type TenantCreateInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutTenantInput;
    students?: StudentCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportCreateNestedManyWithoutTenantInput;
  };

  export type TenantUncheckedCreateInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutTenantInput;
    students?: StudentUncheckedCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportUncheckedCreateNestedManyWithoutTenantInput;
  };

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutTenantNestedInput;
    students?: StudentUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUpdateManyWithoutTenantNestedInput;
  };

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput;
    students?: StudentUncheckedUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUncheckedUpdateManyWithoutTenantNestedInput;
  };

  export type TenantCreateManyInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserCreateInput = {
    id?: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: TenantCreateNestedOneWithoutUsersInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserCreateManyInput = {
    id?: string;
    tenantId: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StudentCreateInput = {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    tenant: TenantCreateNestedOneWithoutStudentsInput;
    dailyReports?: DailyReportCreateNestedManyWithoutStudentInput;
  };

  export type StudentUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    dailyReports?: DailyReportUncheckedCreateNestedManyWithoutStudentInput;
  };

  export type StudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tenant?: TenantUpdateOneRequiredWithoutStudentsNestedInput;
    dailyReports?: DailyReportUpdateManyWithoutStudentNestedInput;
  };

  export type StudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dailyReports?: DailyReportUncheckedUpdateManyWithoutStudentNestedInput;
  };

  export type StudentCreateManyInput = {
    id?: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
  };

  export type StudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type StudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type DailyReportCreateInput = {
    id?: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: TenantCreateNestedOneWithoutDailyReportsInput;
    student: StudentCreateNestedOneWithoutDailyReportsInput;
  };

  export type DailyReportUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    studentId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DailyReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: TenantUpdateOneRequiredWithoutDailyReportsNestedInput;
    student?: StudentUpdateOneRequiredWithoutDailyReportsNestedInput;
  };

  export type DailyReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    studentId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DailyReportCreateManyInput = {
    id?: string;
    tenantId: string;
    studentId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DailyReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DailyReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    studentId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type EnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type UserListRelationFilter = {
    every?: UserWhereInput;
    some?: UserWhereInput;
    none?: UserWhereInput;
  };

  export type StudentListRelationFilter = {
    every?: StudentWhereInput;
    some?: StudentWhereInput;
    none?: StudentWhereInput;
  };

  export type DailyReportListRelationFilter = {
    every?: DailyReportWhereInput;
    some?: DailyReportWhereInput;
    none?: DailyReportWhereInput;
  };

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type StudentOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type DailyReportOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder;
    slug?: SortOrder;
    name?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder;
    slug?: SortOrder;
    name?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder;
    slug?: SortOrder;
    name?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type EnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>;
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type TenantRelationFilter = {
    is?: TenantWhereInput;
    isNot?: TenantWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type UserTenantIdEmailCompoundUniqueInput = {
    tenantId: string;
    email: string;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    lastLoginAt?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    lastLoginAt?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    lastLoginAt?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: NestedEnumUserRoleFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type StudentCountOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    dateOfBirth?: SortOrder;
    gender?: SortOrder;
    notes?: SortOrder;
    passport?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    deletedAt?: SortOrder;
  };

  export type StudentMaxOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    dateOfBirth?: SortOrder;
    gender?: SortOrder;
    notes?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    deletedAt?: SortOrder;
  };

  export type StudentMinOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    dateOfBirth?: SortOrder;
    gender?: SortOrder;
    notes?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    deletedAt?: SortOrder;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedJsonNullableFilter<$PrismaModel>;
    _max?: NestedJsonNullableFilter<$PrismaModel>;
  };

  export type StudentRelationFilter = {
    is?: StudentWhereInput;
    isNot?: StudentWhereInput;
  };

  export type DailyReportTenantIdStudentIdDateCompoundUniqueInput = {
    tenantId: string;
    studentId: string;
    date: Date | string;
  };

  export type DailyReportCountOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    studentId?: SortOrder;
    date?: SortOrder;
    mood?: SortOrder;
    meals?: SortOrder;
    naps?: SortOrder;
    potty?: SortOrder;
    activities?: SortOrder;
    medications?: SortOrder;
    teacherNote?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DailyReportMaxOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    studentId?: SortOrder;
    date?: SortOrder;
    mood?: SortOrder;
    teacherNote?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DailyReportMinOrderByAggregateInput = {
    id?: SortOrder;
    tenantId?: SortOrder;
    studentId?: SortOrder;
    date?: SortOrder;
    mood?: SortOrder;
    teacherNote?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
      | UserCreateWithoutTenantInput[]
      | UserUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[];
    createMany?: UserCreateManyTenantInputEnvelope;
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
  };

  export type StudentCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>
      | StudentCreateWithoutTenantInput[]
      | StudentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      StudentCreateOrConnectWithoutTenantInput | StudentCreateOrConnectWithoutTenantInput[];
    createMany?: StudentCreateManyTenantInputEnvelope;
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
  };

  export type DailyReportCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>
      | DailyReportCreateWithoutTenantInput[]
      | DailyReportUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      DailyReportCreateOrConnectWithoutTenantInput | DailyReportCreateOrConnectWithoutTenantInput[];
    createMany?: DailyReportCreateManyTenantInputEnvelope;
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
  };

  export type UserUncheckedCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
      | UserCreateWithoutTenantInput[]
      | UserUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[];
    createMany?: UserCreateManyTenantInputEnvelope;
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
  };

  export type StudentUncheckedCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>
      | StudentCreateWithoutTenantInput[]
      | StudentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      StudentCreateOrConnectWithoutTenantInput | StudentCreateOrConnectWithoutTenantInput[];
    createMany?: StudentCreateManyTenantInputEnvelope;
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
  };

  export type DailyReportUncheckedCreateNestedManyWithoutTenantInput = {
    create?:
      | XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>
      | DailyReportCreateWithoutTenantInput[]
      | DailyReportUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      DailyReportCreateOrConnectWithoutTenantInput | DailyReportCreateOrConnectWithoutTenantInput[];
    createMany?: DailyReportCreateManyTenantInputEnvelope;
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type EnumTenantStatusFieldUpdateOperationsInput = {
    set?: $Enums.TenantStatus;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type UserUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
      | UserCreateWithoutTenantInput[]
      | UserUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[];
    upsert?:
      UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: UserCreateManyTenantInputEnvelope;
    set?: UserWhereUniqueInput | UserWhereUniqueInput[];
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    update?:
      UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[];
  };

  export type StudentUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>
      | StudentCreateWithoutTenantInput[]
      | StudentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      StudentCreateOrConnectWithoutTenantInput | StudentCreateOrConnectWithoutTenantInput[];
    upsert?:
      | StudentUpsertWithWhereUniqueWithoutTenantInput
      | StudentUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: StudentCreateManyTenantInputEnvelope;
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    update?:
      | StudentUpdateWithWhereUniqueWithoutTenantInput
      | StudentUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      StudentUpdateManyWithWhereWithoutTenantInput | StudentUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[];
  };

  export type DailyReportUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>
      | DailyReportCreateWithoutTenantInput[]
      | DailyReportUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      DailyReportCreateOrConnectWithoutTenantInput | DailyReportCreateOrConnectWithoutTenantInput[];
    upsert?:
      | DailyReportUpsertWithWhereUniqueWithoutTenantInput
      | DailyReportUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: DailyReportCreateManyTenantInputEnvelope;
    set?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    disconnect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    delete?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    update?:
      | DailyReportUpdateWithWhereUniqueWithoutTenantInput
      | DailyReportUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      | DailyReportUpdateManyWithWhereWithoutTenantInput
      | DailyReportUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
  };

  export type UserUncheckedUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
      | UserCreateWithoutTenantInput[]
      | UserUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[];
    upsert?:
      UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: UserCreateManyTenantInputEnvelope;
    set?: UserWhereUniqueInput | UserWhereUniqueInput[];
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    update?:
      UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[];
  };

  export type StudentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>
      | StudentCreateWithoutTenantInput[]
      | StudentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      StudentCreateOrConnectWithoutTenantInput | StudentCreateOrConnectWithoutTenantInput[];
    upsert?:
      | StudentUpsertWithWhereUniqueWithoutTenantInput
      | StudentUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: StudentCreateManyTenantInputEnvelope;
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[];
    update?:
      | StudentUpdateWithWhereUniqueWithoutTenantInput
      | StudentUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      StudentUpdateManyWithWhereWithoutTenantInput | StudentUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[];
  };

  export type DailyReportUncheckedUpdateManyWithoutTenantNestedInput = {
    create?:
      | XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>
      | DailyReportCreateWithoutTenantInput[]
      | DailyReportUncheckedCreateWithoutTenantInput[];
    connectOrCreate?:
      DailyReportCreateOrConnectWithoutTenantInput | DailyReportCreateOrConnectWithoutTenantInput[];
    upsert?:
      | DailyReportUpsertWithWhereUniqueWithoutTenantInput
      | DailyReportUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: DailyReportCreateManyTenantInputEnvelope;
    set?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    disconnect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    delete?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    update?:
      | DailyReportUpdateWithWhereUniqueWithoutTenantInput
      | DailyReportUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?:
      | DailyReportUpdateManyWithWhereWithoutTenantInput
      | DailyReportUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
  };

  export type TenantCreateNestedOneWithoutUsersInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput;
    connect?: TenantWhereUniqueInput;
  };

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type TenantUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput;
    upsert?: TenantUpsertWithoutUsersInput;
    connect?: TenantWhereUniqueInput;
    update?: XOR<
      XOR<TenantUpdateToOneWithWhereWithoutUsersInput, TenantUpdateWithoutUsersInput>,
      TenantUncheckedUpdateWithoutUsersInput
    >;
  };

  export type TenantCreateNestedOneWithoutStudentsInput = {
    create?: XOR<TenantCreateWithoutStudentsInput, TenantUncheckedCreateWithoutStudentsInput>;
    connectOrCreate?: TenantCreateOrConnectWithoutStudentsInput;
    connect?: TenantWhereUniqueInput;
  };

  export type DailyReportCreateNestedManyWithoutStudentInput = {
    create?:
      | XOR<DailyReportCreateWithoutStudentInput, DailyReportUncheckedCreateWithoutStudentInput>
      | DailyReportCreateWithoutStudentInput[]
      | DailyReportUncheckedCreateWithoutStudentInput[];
    connectOrCreate?:
      | DailyReportCreateOrConnectWithoutStudentInput
      | DailyReportCreateOrConnectWithoutStudentInput[];
    createMany?: DailyReportCreateManyStudentInputEnvelope;
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
  };

  export type DailyReportUncheckedCreateNestedManyWithoutStudentInput = {
    create?:
      | XOR<DailyReportCreateWithoutStudentInput, DailyReportUncheckedCreateWithoutStudentInput>
      | DailyReportCreateWithoutStudentInput[]
      | DailyReportUncheckedCreateWithoutStudentInput[];
    connectOrCreate?:
      | DailyReportCreateOrConnectWithoutStudentInput
      | DailyReportCreateOrConnectWithoutStudentInput[];
    createMany?: DailyReportCreateManyStudentInputEnvelope;
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type TenantUpdateOneRequiredWithoutStudentsNestedInput = {
    create?: XOR<TenantCreateWithoutStudentsInput, TenantUncheckedCreateWithoutStudentsInput>;
    connectOrCreate?: TenantCreateOrConnectWithoutStudentsInput;
    upsert?: TenantUpsertWithoutStudentsInput;
    connect?: TenantWhereUniqueInput;
    update?: XOR<
      XOR<TenantUpdateToOneWithWhereWithoutStudentsInput, TenantUpdateWithoutStudentsInput>,
      TenantUncheckedUpdateWithoutStudentsInput
    >;
  };

  export type DailyReportUpdateManyWithoutStudentNestedInput = {
    create?:
      | XOR<DailyReportCreateWithoutStudentInput, DailyReportUncheckedCreateWithoutStudentInput>
      | DailyReportCreateWithoutStudentInput[]
      | DailyReportUncheckedCreateWithoutStudentInput[];
    connectOrCreate?:
      | DailyReportCreateOrConnectWithoutStudentInput
      | DailyReportCreateOrConnectWithoutStudentInput[];
    upsert?:
      | DailyReportUpsertWithWhereUniqueWithoutStudentInput
      | DailyReportUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: DailyReportCreateManyStudentInputEnvelope;
    set?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    disconnect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    delete?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    update?:
      | DailyReportUpdateWithWhereUniqueWithoutStudentInput
      | DailyReportUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?:
      | DailyReportUpdateManyWithWhereWithoutStudentInput
      | DailyReportUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
  };

  export type DailyReportUncheckedUpdateManyWithoutStudentNestedInput = {
    create?:
      | XOR<DailyReportCreateWithoutStudentInput, DailyReportUncheckedCreateWithoutStudentInput>
      | DailyReportCreateWithoutStudentInput[]
      | DailyReportUncheckedCreateWithoutStudentInput[];
    connectOrCreate?:
      | DailyReportCreateOrConnectWithoutStudentInput
      | DailyReportCreateOrConnectWithoutStudentInput[];
    upsert?:
      | DailyReportUpsertWithWhereUniqueWithoutStudentInput
      | DailyReportUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: DailyReportCreateManyStudentInputEnvelope;
    set?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    disconnect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    delete?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    connect?: DailyReportWhereUniqueInput | DailyReportWhereUniqueInput[];
    update?:
      | DailyReportUpdateWithWhereUniqueWithoutStudentInput
      | DailyReportUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?:
      | DailyReportUpdateManyWithWhereWithoutStudentInput
      | DailyReportUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
  };

  export type TenantCreateNestedOneWithoutDailyReportsInput = {
    create?: XOR<
      TenantCreateWithoutDailyReportsInput,
      TenantUncheckedCreateWithoutDailyReportsInput
    >;
    connectOrCreate?: TenantCreateOrConnectWithoutDailyReportsInput;
    connect?: TenantWhereUniqueInput;
  };

  export type StudentCreateNestedOneWithoutDailyReportsInput = {
    create?: XOR<
      StudentCreateWithoutDailyReportsInput,
      StudentUncheckedCreateWithoutDailyReportsInput
    >;
    connectOrCreate?: StudentCreateOrConnectWithoutDailyReportsInput;
    connect?: StudentWhereUniqueInput;
  };

  export type TenantUpdateOneRequiredWithoutDailyReportsNestedInput = {
    create?: XOR<
      TenantCreateWithoutDailyReportsInput,
      TenantUncheckedCreateWithoutDailyReportsInput
    >;
    connectOrCreate?: TenantCreateOrConnectWithoutDailyReportsInput;
    upsert?: TenantUpsertWithoutDailyReportsInput;
    connect?: TenantWhereUniqueInput;
    update?: XOR<
      XOR<TenantUpdateToOneWithWhereWithoutDailyReportsInput, TenantUpdateWithoutDailyReportsInput>,
      TenantUncheckedUpdateWithoutDailyReportsInput
    >;
  };

  export type StudentUpdateOneRequiredWithoutDailyReportsNestedInput = {
    create?: XOR<
      StudentCreateWithoutDailyReportsInput,
      StudentUncheckedCreateWithoutDailyReportsInput
    >;
    connectOrCreate?: StudentCreateOrConnectWithoutDailyReportsInput;
    upsert?: StudentUpsertWithoutDailyReportsInput;
    connect?: StudentWhereUniqueInput;
    update?: XOR<
      XOR<
        StudentUpdateToOneWithWhereWithoutDailyReportsInput,
        StudentUpdateWithoutDailyReportsInput
      >,
      StudentUncheckedUpdateWithoutDailyReportsInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedEnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>;
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: NestedEnumUserRoleFilter<$PrismaModel>;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>;

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type UserCreateWithoutTenantInput = {
    id?: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUncheckedCreateWithoutTenantInput = {
    id?: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserCreateOrConnectWithoutTenantInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>;
  };

  export type UserCreateManyTenantInputEnvelope = {
    data: UserCreateManyTenantInput | UserCreateManyTenantInput[];
    skipDuplicates?: boolean;
  };

  export type StudentCreateWithoutTenantInput = {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    dailyReports?: DailyReportCreateNestedManyWithoutStudentInput;
  };

  export type StudentUncheckedCreateWithoutTenantInput = {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    dailyReports?: DailyReportUncheckedCreateNestedManyWithoutStudentInput;
  };

  export type StudentCreateOrConnectWithoutTenantInput = {
    where: StudentWhereUniqueInput;
    create: XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>;
  };

  export type StudentCreateManyTenantInputEnvelope = {
    data: StudentCreateManyTenantInput | StudentCreateManyTenantInput[];
    skipDuplicates?: boolean;
  };

  export type DailyReportCreateWithoutTenantInput = {
    id?: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    student: StudentCreateNestedOneWithoutDailyReportsInput;
  };

  export type DailyReportUncheckedCreateWithoutTenantInput = {
    id?: string;
    studentId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DailyReportCreateOrConnectWithoutTenantInput = {
    where: DailyReportWhereUniqueInput;
    create: XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>;
  };

  export type DailyReportCreateManyTenantInputEnvelope = {
    data: DailyReportCreateManyTenantInput | DailyReportCreateManyTenantInput[];
    skipDuplicates?: boolean;
  };

  export type UserUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput;
    update: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>;
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>;
  };

  export type UserUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput;
    data: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>;
  };

  export type UserUpdateManyWithWhereWithoutTenantInput = {
    where: UserScalarWhereInput;
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTenantInput>;
  };

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[];
    OR?: UserScalarWhereInput[];
    NOT?: UserScalarWhereInput | UserScalarWhereInput[];
    id?: StringFilter<'User'> | string;
    tenantId?: StringFilter<'User'> | string;
    email?: StringFilter<'User'> | string;
    passwordHash?: StringFilter<'User'> | string;
    role?: EnumUserRoleFilter<'User'> | $Enums.UserRole;
    isActive?: BoolFilter<'User'> | boolean;
    lastLoginAt?: DateTimeNullableFilter<'User'> | Date | string | null;
    createdAt?: DateTimeFilter<'User'> | Date | string;
    updatedAt?: DateTimeFilter<'User'> | Date | string;
  };

  export type StudentUpsertWithWhereUniqueWithoutTenantInput = {
    where: StudentWhereUniqueInput;
    update: XOR<StudentUpdateWithoutTenantInput, StudentUncheckedUpdateWithoutTenantInput>;
    create: XOR<StudentCreateWithoutTenantInput, StudentUncheckedCreateWithoutTenantInput>;
  };

  export type StudentUpdateWithWhereUniqueWithoutTenantInput = {
    where: StudentWhereUniqueInput;
    data: XOR<StudentUpdateWithoutTenantInput, StudentUncheckedUpdateWithoutTenantInput>;
  };

  export type StudentUpdateManyWithWhereWithoutTenantInput = {
    where: StudentScalarWhereInput;
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyWithoutTenantInput>;
  };

  export type StudentScalarWhereInput = {
    AND?: StudentScalarWhereInput | StudentScalarWhereInput[];
    OR?: StudentScalarWhereInput[];
    NOT?: StudentScalarWhereInput | StudentScalarWhereInput[];
    id?: StringFilter<'Student'> | string;
    tenantId?: StringFilter<'Student'> | string;
    firstName?: StringFilter<'Student'> | string;
    lastName?: StringFilter<'Student'> | string;
    dateOfBirth?: DateTimeFilter<'Student'> | Date | string;
    gender?: StringNullableFilter<'Student'> | string | null;
    notes?: StringNullableFilter<'Student'> | string | null;
    passport?: JsonNullableFilter<'Student'>;
    isActive?: BoolFilter<'Student'> | boolean;
    createdAt?: DateTimeFilter<'Student'> | Date | string;
    updatedAt?: DateTimeFilter<'Student'> | Date | string;
    deletedAt?: DateTimeNullableFilter<'Student'> | Date | string | null;
  };

  export type DailyReportUpsertWithWhereUniqueWithoutTenantInput = {
    where: DailyReportWhereUniqueInput;
    update: XOR<DailyReportUpdateWithoutTenantInput, DailyReportUncheckedUpdateWithoutTenantInput>;
    create: XOR<DailyReportCreateWithoutTenantInput, DailyReportUncheckedCreateWithoutTenantInput>;
  };

  export type DailyReportUpdateWithWhereUniqueWithoutTenantInput = {
    where: DailyReportWhereUniqueInput;
    data: XOR<DailyReportUpdateWithoutTenantInput, DailyReportUncheckedUpdateWithoutTenantInput>;
  };

  export type DailyReportUpdateManyWithWhereWithoutTenantInput = {
    where: DailyReportScalarWhereInput;
    data: XOR<DailyReportUpdateManyMutationInput, DailyReportUncheckedUpdateManyWithoutTenantInput>;
  };

  export type DailyReportScalarWhereInput = {
    AND?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
    OR?: DailyReportScalarWhereInput[];
    NOT?: DailyReportScalarWhereInput | DailyReportScalarWhereInput[];
    id?: StringFilter<'DailyReport'> | string;
    tenantId?: StringFilter<'DailyReport'> | string;
    studentId?: StringFilter<'DailyReport'> | string;
    date?: DateTimeFilter<'DailyReport'> | Date | string;
    mood?: StringNullableFilter<'DailyReport'> | string | null;
    meals?: JsonNullableFilter<'DailyReport'>;
    naps?: JsonNullableFilter<'DailyReport'>;
    potty?: JsonNullableFilter<'DailyReport'>;
    activities?: JsonNullableFilter<'DailyReport'>;
    medications?: JsonNullableFilter<'DailyReport'>;
    teacherNote?: StringNullableFilter<'DailyReport'> | string | null;
    createdAt?: DateTimeFilter<'DailyReport'> | Date | string;
    updatedAt?: DateTimeFilter<'DailyReport'> | Date | string;
  };

  export type TenantCreateWithoutUsersInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    students?: StudentCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportCreateNestedManyWithoutTenantInput;
  };

  export type TenantUncheckedCreateWithoutUsersInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    students?: StudentUncheckedCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportUncheckedCreateNestedManyWithoutTenantInput;
  };

  export type TenantCreateOrConnectWithoutUsersInput = {
    where: TenantWhereUniqueInput;
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>;
  };

  export type TenantUpsertWithoutUsersInput = {
    update: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>;
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>;
    where?: TenantWhereInput;
  };

  export type TenantUpdateToOneWithWhereWithoutUsersInput = {
    where?: TenantWhereInput;
    data: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>;
  };

  export type TenantUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    students?: StudentUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUpdateManyWithoutTenantNestedInput;
  };

  export type TenantUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    students?: StudentUncheckedUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUncheckedUpdateManyWithoutTenantNestedInput;
  };

  export type TenantCreateWithoutStudentsInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportCreateNestedManyWithoutTenantInput;
  };

  export type TenantUncheckedCreateWithoutStudentsInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutTenantInput;
    dailyReports?: DailyReportUncheckedCreateNestedManyWithoutTenantInput;
  };

  export type TenantCreateOrConnectWithoutStudentsInput = {
    where: TenantWhereUniqueInput;
    create: XOR<TenantCreateWithoutStudentsInput, TenantUncheckedCreateWithoutStudentsInput>;
  };

  export type DailyReportCreateWithoutStudentInput = {
    id?: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: TenantCreateNestedOneWithoutDailyReportsInput;
  };

  export type DailyReportUncheckedCreateWithoutStudentInput = {
    id?: string;
    tenantId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DailyReportCreateOrConnectWithoutStudentInput = {
    where: DailyReportWhereUniqueInput;
    create: XOR<
      DailyReportCreateWithoutStudentInput,
      DailyReportUncheckedCreateWithoutStudentInput
    >;
  };

  export type DailyReportCreateManyStudentInputEnvelope = {
    data: DailyReportCreateManyStudentInput | DailyReportCreateManyStudentInput[];
    skipDuplicates?: boolean;
  };

  export type TenantUpsertWithoutStudentsInput = {
    update: XOR<TenantUpdateWithoutStudentsInput, TenantUncheckedUpdateWithoutStudentsInput>;
    create: XOR<TenantCreateWithoutStudentsInput, TenantUncheckedCreateWithoutStudentsInput>;
    where?: TenantWhereInput;
  };

  export type TenantUpdateToOneWithWhereWithoutStudentsInput = {
    where?: TenantWhereInput;
    data: XOR<TenantUpdateWithoutStudentsInput, TenantUncheckedUpdateWithoutStudentsInput>;
  };

  export type TenantUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUpdateManyWithoutTenantNestedInput;
  };

  export type TenantUncheckedUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput;
    dailyReports?: DailyReportUncheckedUpdateManyWithoutTenantNestedInput;
  };

  export type DailyReportUpsertWithWhereUniqueWithoutStudentInput = {
    where: DailyReportWhereUniqueInput;
    update: XOR<
      DailyReportUpdateWithoutStudentInput,
      DailyReportUncheckedUpdateWithoutStudentInput
    >;
    create: XOR<
      DailyReportCreateWithoutStudentInput,
      DailyReportUncheckedCreateWithoutStudentInput
    >;
  };

  export type DailyReportUpdateWithWhereUniqueWithoutStudentInput = {
    where: DailyReportWhereUniqueInput;
    data: XOR<DailyReportUpdateWithoutStudentInput, DailyReportUncheckedUpdateWithoutStudentInput>;
  };

  export type DailyReportUpdateManyWithWhereWithoutStudentInput = {
    where: DailyReportScalarWhereInput;
    data: XOR<
      DailyReportUpdateManyMutationInput,
      DailyReportUncheckedUpdateManyWithoutStudentInput
    >;
  };

  export type TenantCreateWithoutDailyReportsInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutTenantInput;
    students?: StudentCreateNestedManyWithoutTenantInput;
  };

  export type TenantUncheckedCreateWithoutDailyReportsInput = {
    id?: string;
    slug: string;
    name: string;
    status?: $Enums.TenantStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutTenantInput;
    students?: StudentUncheckedCreateNestedManyWithoutTenantInput;
  };

  export type TenantCreateOrConnectWithoutDailyReportsInput = {
    where: TenantWhereUniqueInput;
    create: XOR<
      TenantCreateWithoutDailyReportsInput,
      TenantUncheckedCreateWithoutDailyReportsInput
    >;
  };

  export type StudentCreateWithoutDailyReportsInput = {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    tenant: TenantCreateNestedOneWithoutStudentsInput;
  };

  export type StudentUncheckedCreateWithoutDailyReportsInput = {
    id?: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
  };

  export type StudentCreateOrConnectWithoutDailyReportsInput = {
    where: StudentWhereUniqueInput;
    create: XOR<
      StudentCreateWithoutDailyReportsInput,
      StudentUncheckedCreateWithoutDailyReportsInput
    >;
  };

  export type TenantUpsertWithoutDailyReportsInput = {
    update: XOR<
      TenantUpdateWithoutDailyReportsInput,
      TenantUncheckedUpdateWithoutDailyReportsInput
    >;
    create: XOR<
      TenantCreateWithoutDailyReportsInput,
      TenantUncheckedCreateWithoutDailyReportsInput
    >;
    where?: TenantWhereInput;
  };

  export type TenantUpdateToOneWithWhereWithoutDailyReportsInput = {
    where?: TenantWhereInput;
    data: XOR<TenantUpdateWithoutDailyReportsInput, TenantUncheckedUpdateWithoutDailyReportsInput>;
  };

  export type TenantUpdateWithoutDailyReportsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutTenantNestedInput;
    students?: StudentUpdateManyWithoutTenantNestedInput;
  };

  export type TenantUncheckedUpdateWithoutDailyReportsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    slug?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput;
    students?: StudentUncheckedUpdateManyWithoutTenantNestedInput;
  };

  export type StudentUpsertWithoutDailyReportsInput = {
    update: XOR<
      StudentUpdateWithoutDailyReportsInput,
      StudentUncheckedUpdateWithoutDailyReportsInput
    >;
    create: XOR<
      StudentCreateWithoutDailyReportsInput,
      StudentUncheckedCreateWithoutDailyReportsInput
    >;
    where?: StudentWhereInput;
  };

  export type StudentUpdateToOneWithWhereWithoutDailyReportsInput = {
    where?: StudentWhereInput;
    data: XOR<
      StudentUpdateWithoutDailyReportsInput,
      StudentUncheckedUpdateWithoutDailyReportsInput
    >;
  };

  export type StudentUpdateWithoutDailyReportsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tenant?: TenantUpdateOneRequiredWithoutStudentsNestedInput;
  };

  export type StudentUncheckedUpdateWithoutDailyReportsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type UserCreateManyTenantInput = {
    id?: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    isActive?: boolean;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type StudentCreateManyTenantInput = {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender?: string | null;
    notes?: string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
  };

  export type DailyReportCreateManyTenantInput = {
    id?: string;
    studentId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StudentUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dailyReports?: DailyReportUpdateManyWithoutStudentNestedInput;
  };

  export type StudentUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dailyReports?: DailyReportUncheckedUpdateManyWithoutStudentNestedInput;
  };

  export type StudentUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    dateOfBirth?: DateTimeFieldUpdateOperationsInput | Date | string;
    gender?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    passport?: NullableJsonNullValueInput | InputJsonValue;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type DailyReportUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    student?: StudentUpdateOneRequiredWithoutDailyReportsNestedInput;
  };

  export type DailyReportUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    studentId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DailyReportUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string;
    studentId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DailyReportCreateManyStudentInput = {
    id?: string;
    tenantId: string;
    date: Date | string;
    mood?: string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DailyReportUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: TenantUpdateOneRequiredWithoutDailyReportsNestedInput;
  };

  export type DailyReportUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DailyReportUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tenantId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    mood?: NullableStringFieldUpdateOperationsInput | string | null;
    meals?: NullableJsonNullValueInput | InputJsonValue;
    naps?: NullableJsonNullValueInput | InputJsonValue;
    potty?: NullableJsonNullValueInput | InputJsonValue;
    activities?: NullableJsonNullValueInput | InputJsonValue;
    medications?: NullableJsonNullValueInput | InputJsonValue;
    teacherNote?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Aliases for legacy arg types
   */
  /**
   * @deprecated Use TenantCountOutputTypeDefaultArgs instead
   */
  export type TenantCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = TenantCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use StudentCountOutputTypeDefaultArgs instead
   */
  export type StudentCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = StudentCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use TenantDefaultArgs instead
   */
  export type TenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    TenantDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use UserDefaultArgs instead
   */
  export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    UserDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use StudentDefaultArgs instead
   */
  export type StudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    StudentDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use DailyReportDefaultArgs instead
   */
  export type DailyReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    DailyReportDefaultArgs<ExtArgs>;

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
