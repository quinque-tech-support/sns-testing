
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model ConnectedAccount
 * 
 */
export type ConnectedAccount = $Result.DefaultSelection<Prisma.$ConnectedAccountPayload>
/**
 * Model Post
 * 
 */
export type Post = $Result.DefaultSelection<Prisma.$PostPayload>
/**
 * Model Schedule
 * 
 */
export type Schedule = $Result.DefaultSelection<Prisma.$SchedulePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ScheduleStatus: {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

export type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus]


export const MediaType: {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO'
};

export type MediaType = (typeof MediaType)[keyof typeof MediaType]

}

export type ScheduleStatus = $Enums.ScheduleStatus

export const ScheduleStatus: typeof $Enums.ScheduleStatus

export type MediaType = $Enums.MediaType

export const MediaType: typeof $Enums.MediaType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.connectedAccount`: Exposes CRUD operations for the **ConnectedAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConnectedAccounts
    * const connectedAccounts = await prisma.connectedAccount.findMany()
    * ```
    */
  get connectedAccount(): Prisma.ConnectedAccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.post`: Exposes CRUD operations for the **Post** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Posts
    * const posts = await prisma.post.findMany()
    * ```
    */
  get post(): Prisma.PostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.schedule`: Exposes CRUD operations for the **Schedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Schedules
    * const schedules = await prisma.schedule.findMany()
    * ```
    */
  get schedule(): Prisma.ScheduleDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.0
   * Query Engine version: ab56fe763f921d033a6c195e7ddeb3e255bdbb57
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

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
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
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
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    ConnectedAccount: 'ConnectedAccount',
    Post: 'Post',
    Schedule: 'Schedule'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "connectedAccount" | "post" | "schedule"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      ConnectedAccount: {
        payload: Prisma.$ConnectedAccountPayload<ExtArgs>
        fields: Prisma.ConnectedAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConnectedAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConnectedAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          findFirst: {
            args: Prisma.ConnectedAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConnectedAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          findMany: {
            args: Prisma.ConnectedAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>[]
          }
          create: {
            args: Prisma.ConnectedAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          createMany: {
            args: Prisma.ConnectedAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConnectedAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>[]
          }
          delete: {
            args: Prisma.ConnectedAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          update: {
            args: Prisma.ConnectedAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          deleteMany: {
            args: Prisma.ConnectedAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConnectedAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConnectedAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>[]
          }
          upsert: {
            args: Prisma.ConnectedAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectedAccountPayload>
          }
          aggregate: {
            args: Prisma.ConnectedAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConnectedAccount>
          }
          groupBy: {
            args: Prisma.ConnectedAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConnectedAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConnectedAccountCountArgs<ExtArgs>
            result: $Utils.Optional<ConnectedAccountCountAggregateOutputType> | number
          }
        }
      }
      Post: {
        payload: Prisma.$PostPayload<ExtArgs>
        fields: Prisma.PostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findFirst: {
            args: Prisma.PostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findMany: {
            args: Prisma.PostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          create: {
            args: Prisma.PostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          createMany: {
            args: Prisma.PostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          delete: {
            args: Prisma.PostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          update: {
            args: Prisma.PostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          deleteMany: {
            args: Prisma.PostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          upsert: {
            args: Prisma.PostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          aggregate: {
            args: Prisma.PostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePost>
          }
          groupBy: {
            args: Prisma.PostGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostCountArgs<ExtArgs>
            result: $Utils.Optional<PostCountAggregateOutputType> | number
          }
        }
      }
      Schedule: {
        payload: Prisma.$SchedulePayload<ExtArgs>
        fields: Prisma.ScheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          findFirst: {
            args: Prisma.ScheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          findMany: {
            args: Prisma.ScheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>[]
          }
          create: {
            args: Prisma.ScheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          createMany: {
            args: Prisma.ScheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>[]
          }
          delete: {
            args: Prisma.ScheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          update: {
            args: Prisma.ScheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          deleteMany: {
            args: Prisma.ScheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>[]
          }
          upsert: {
            args: Prisma.ScheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchedulePayload>
          }
          aggregate: {
            args: Prisma.ScheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSchedule>
          }
          groupBy: {
            args: Prisma.ScheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScheduleCountArgs<ExtArgs>
            result: $Utils.Optional<ScheduleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    connectedAccount?: ConnectedAccountOmit
    post?: PostOmit
    schedule?: ScheduleOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
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
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    posts: number
    connectedAccounts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | UserCountOutputTypeCountPostsArgs
    connectedAccounts?: boolean | UserCountOutputTypeCountConnectedAccountsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountConnectedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectedAccountWhereInput
  }


  /**
   * Count Type ConnectedAccountCountOutputType
   */

  export type ConnectedAccountCountOutputType = {
    posts: number
  }

  export type ConnectedAccountCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | ConnectedAccountCountOutputTypeCountPostsArgs
  }

  // Custom InputTypes
  /**
   * ConnectedAccountCountOutputType without action
   */
  export type ConnectedAccountCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccountCountOutputType
     */
    select?: ConnectedAccountCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConnectedAccountCountOutputType without action
   */
  export type ConnectedAccountCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }


  /**
   * Count Type PostCountOutputType
   */

  export type PostCountOutputType = {
    schedules: number
  }

  export type PostCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedules?: boolean | PostCountOutputTypeCountSchedulesArgs
  }

  // Custom InputTypes
  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostCountOutputType
     */
    select?: PostCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountSchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password_hash: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password_hash: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password_hash: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string | null
    email: string
    password_hash: string | null
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    createdAt?: boolean
    posts?: boolean | User$postsArgs<ExtArgs>
    connectedAccounts?: boolean | User$connectedAccountsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password_hash" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | User$postsArgs<ExtArgs>
    connectedAccounts?: boolean | User$connectedAccountsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      posts: Prisma.$PostPayload<ExtArgs>[]
      connectedAccounts: Prisma.$ConnectedAccountPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string
      password_hash: string | null
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
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
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

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
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

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
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

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
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


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
    >

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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

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
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
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
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    posts<T extends User$postsArgs<ExtArgs> = {}>(args?: Subset<T, User$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    connectedAccounts<T extends User$connectedAccountsArgs<ExtArgs> = {}>(args?: Subset<T, User$connectedAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password_hash: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.posts
   */
  export type User$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * User.connectedAccounts
   */
  export type User$connectedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    where?: ConnectedAccountWhereInput
    orderBy?: ConnectedAccountOrderByWithRelationInput | ConnectedAccountOrderByWithRelationInput[]
    cursor?: ConnectedAccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConnectedAccountScalarFieldEnum | ConnectedAccountScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model ConnectedAccount
   */

  export type AggregateConnectedAccount = {
    _count: ConnectedAccountCountAggregateOutputType | null
    _min: ConnectedAccountMinAggregateOutputType | null
    _max: ConnectedAccountMaxAggregateOutputType | null
  }

  export type ConnectedAccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    facebookUserId: string | null
    pageId: string | null
    username: string | null
    profilePictureUrl: string | null
    pageAccessToken: string | null
    instagramBusinessId: string | null
    longLivedUserToken: string | null
    tokenExpiry: Date | null
    createdAt: Date | null
  }

  export type ConnectedAccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    facebookUserId: string | null
    pageId: string | null
    username: string | null
    profilePictureUrl: string | null
    pageAccessToken: string | null
    instagramBusinessId: string | null
    longLivedUserToken: string | null
    tokenExpiry: Date | null
    createdAt: Date | null
  }

  export type ConnectedAccountCountAggregateOutputType = {
    id: number
    userId: number
    facebookUserId: number
    pageId: number
    username: number
    profilePictureUrl: number
    pageAccessToken: number
    instagramBusinessId: number
    longLivedUserToken: number
    tokenExpiry: number
    createdAt: number
    _all: number
  }


  export type ConnectedAccountMinAggregateInputType = {
    id?: true
    userId?: true
    facebookUserId?: true
    pageId?: true
    username?: true
    profilePictureUrl?: true
    pageAccessToken?: true
    instagramBusinessId?: true
    longLivedUserToken?: true
    tokenExpiry?: true
    createdAt?: true
  }

  export type ConnectedAccountMaxAggregateInputType = {
    id?: true
    userId?: true
    facebookUserId?: true
    pageId?: true
    username?: true
    profilePictureUrl?: true
    pageAccessToken?: true
    instagramBusinessId?: true
    longLivedUserToken?: true
    tokenExpiry?: true
    createdAt?: true
  }

  export type ConnectedAccountCountAggregateInputType = {
    id?: true
    userId?: true
    facebookUserId?: true
    pageId?: true
    username?: true
    profilePictureUrl?: true
    pageAccessToken?: true
    instagramBusinessId?: true
    longLivedUserToken?: true
    tokenExpiry?: true
    createdAt?: true
    _all?: true
  }

  export type ConnectedAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectedAccount to aggregate.
     */
    where?: ConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectedAccounts to fetch.
     */
    orderBy?: ConnectedAccountOrderByWithRelationInput | ConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConnectedAccounts
    **/
    _count?: true | ConnectedAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConnectedAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConnectedAccountMaxAggregateInputType
  }

  export type GetConnectedAccountAggregateType<T extends ConnectedAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateConnectedAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConnectedAccount[P]>
      : GetScalarType<T[P], AggregateConnectedAccount[P]>
  }




  export type ConnectedAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectedAccountWhereInput
    orderBy?: ConnectedAccountOrderByWithAggregationInput | ConnectedAccountOrderByWithAggregationInput[]
    by: ConnectedAccountScalarFieldEnum[] | ConnectedAccountScalarFieldEnum
    having?: ConnectedAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConnectedAccountCountAggregateInputType | true
    _min?: ConnectedAccountMinAggregateInputType
    _max?: ConnectedAccountMaxAggregateInputType
  }

  export type ConnectedAccountGroupByOutputType = {
    id: string
    userId: string
    facebookUserId: string
    pageId: string
    username: string | null
    profilePictureUrl: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date
    createdAt: Date
    _count: ConnectedAccountCountAggregateOutputType | null
    _min: ConnectedAccountMinAggregateOutputType | null
    _max: ConnectedAccountMaxAggregateOutputType | null
  }

  type GetConnectedAccountGroupByPayload<T extends ConnectedAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConnectedAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConnectedAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConnectedAccountGroupByOutputType[P]>
            : GetScalarType<T[P], ConnectedAccountGroupByOutputType[P]>
        }
      >
    >


  export type ConnectedAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    facebookUserId?: boolean
    pageId?: boolean
    username?: boolean
    profilePictureUrl?: boolean
    pageAccessToken?: boolean
    instagramBusinessId?: boolean
    longLivedUserToken?: boolean
    tokenExpiry?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    posts?: boolean | ConnectedAccount$postsArgs<ExtArgs>
    _count?: boolean | ConnectedAccountCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectedAccount"]>

  export type ConnectedAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    facebookUserId?: boolean
    pageId?: boolean
    username?: boolean
    profilePictureUrl?: boolean
    pageAccessToken?: boolean
    instagramBusinessId?: boolean
    longLivedUserToken?: boolean
    tokenExpiry?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectedAccount"]>

  export type ConnectedAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    facebookUserId?: boolean
    pageId?: boolean
    username?: boolean
    profilePictureUrl?: boolean
    pageAccessToken?: boolean
    instagramBusinessId?: boolean
    longLivedUserToken?: boolean
    tokenExpiry?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectedAccount"]>

  export type ConnectedAccountSelectScalar = {
    id?: boolean
    userId?: boolean
    facebookUserId?: boolean
    pageId?: boolean
    username?: boolean
    profilePictureUrl?: boolean
    pageAccessToken?: boolean
    instagramBusinessId?: boolean
    longLivedUserToken?: boolean
    tokenExpiry?: boolean
    createdAt?: boolean
  }

  export type ConnectedAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "facebookUserId" | "pageId" | "username" | "profilePictureUrl" | "pageAccessToken" | "instagramBusinessId" | "longLivedUserToken" | "tokenExpiry" | "createdAt", ExtArgs["result"]["connectedAccount"]>
  export type ConnectedAccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    posts?: boolean | ConnectedAccount$postsArgs<ExtArgs>
    _count?: boolean | ConnectedAccountCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConnectedAccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ConnectedAccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ConnectedAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConnectedAccount"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      posts: Prisma.$PostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      facebookUserId: string
      pageId: string
      username: string | null
      profilePictureUrl: string | null
      pageAccessToken: string
      instagramBusinessId: string
      longLivedUserToken: string
      tokenExpiry: Date
      createdAt: Date
    }, ExtArgs["result"]["connectedAccount"]>
    composites: {}
  }

  type ConnectedAccountGetPayload<S extends boolean | null | undefined | ConnectedAccountDefaultArgs> = $Result.GetResult<Prisma.$ConnectedAccountPayload, S>

  type ConnectedAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConnectedAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConnectedAccountCountAggregateInputType | true
    }

  export interface ConnectedAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConnectedAccount'], meta: { name: 'ConnectedAccount' } }
    /**
     * Find zero or one ConnectedAccount that matches the filter.
     * @param {ConnectedAccountFindUniqueArgs} args - Arguments to find a ConnectedAccount
     * @example
     * // Get one ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConnectedAccountFindUniqueArgs>(args: SelectSubset<T, ConnectedAccountFindUniqueArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConnectedAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConnectedAccountFindUniqueOrThrowArgs} args - Arguments to find a ConnectedAccount
     * @example
     * // Get one ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConnectedAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, ConnectedAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectedAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountFindFirstArgs} args - Arguments to find a ConnectedAccount
     * @example
     * // Get one ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConnectedAccountFindFirstArgs>(args?: SelectSubset<T, ConnectedAccountFindFirstArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectedAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountFindFirstOrThrowArgs} args - Arguments to find a ConnectedAccount
     * @example
     * // Get one ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConnectedAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, ConnectedAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConnectedAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConnectedAccounts
     * const connectedAccounts = await prisma.connectedAccount.findMany()
     * 
     * // Get first 10 ConnectedAccounts
     * const connectedAccounts = await prisma.connectedAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const connectedAccountWithIdOnly = await prisma.connectedAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConnectedAccountFindManyArgs>(args?: SelectSubset<T, ConnectedAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConnectedAccount.
     * @param {ConnectedAccountCreateArgs} args - Arguments to create a ConnectedAccount.
     * @example
     * // Create one ConnectedAccount
     * const ConnectedAccount = await prisma.connectedAccount.create({
     *   data: {
     *     // ... data to create a ConnectedAccount
     *   }
     * })
     * 
     */
    create<T extends ConnectedAccountCreateArgs>(args: SelectSubset<T, ConnectedAccountCreateArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConnectedAccounts.
     * @param {ConnectedAccountCreateManyArgs} args - Arguments to create many ConnectedAccounts.
     * @example
     * // Create many ConnectedAccounts
     * const connectedAccount = await prisma.connectedAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConnectedAccountCreateManyArgs>(args?: SelectSubset<T, ConnectedAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConnectedAccounts and returns the data saved in the database.
     * @param {ConnectedAccountCreateManyAndReturnArgs} args - Arguments to create many ConnectedAccounts.
     * @example
     * // Create many ConnectedAccounts
     * const connectedAccount = await prisma.connectedAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConnectedAccounts and only return the `id`
     * const connectedAccountWithIdOnly = await prisma.connectedAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConnectedAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, ConnectedAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConnectedAccount.
     * @param {ConnectedAccountDeleteArgs} args - Arguments to delete one ConnectedAccount.
     * @example
     * // Delete one ConnectedAccount
     * const ConnectedAccount = await prisma.connectedAccount.delete({
     *   where: {
     *     // ... filter to delete one ConnectedAccount
     *   }
     * })
     * 
     */
    delete<T extends ConnectedAccountDeleteArgs>(args: SelectSubset<T, ConnectedAccountDeleteArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConnectedAccount.
     * @param {ConnectedAccountUpdateArgs} args - Arguments to update one ConnectedAccount.
     * @example
     * // Update one ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConnectedAccountUpdateArgs>(args: SelectSubset<T, ConnectedAccountUpdateArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConnectedAccounts.
     * @param {ConnectedAccountDeleteManyArgs} args - Arguments to filter ConnectedAccounts to delete.
     * @example
     * // Delete a few ConnectedAccounts
     * const { count } = await prisma.connectedAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConnectedAccountDeleteManyArgs>(args?: SelectSubset<T, ConnectedAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConnectedAccounts
     * const connectedAccount = await prisma.connectedAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConnectedAccountUpdateManyArgs>(args: SelectSubset<T, ConnectedAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectedAccounts and returns the data updated in the database.
     * @param {ConnectedAccountUpdateManyAndReturnArgs} args - Arguments to update many ConnectedAccounts.
     * @example
     * // Update many ConnectedAccounts
     * const connectedAccount = await prisma.connectedAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConnectedAccounts and only return the `id`
     * const connectedAccountWithIdOnly = await prisma.connectedAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConnectedAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, ConnectedAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConnectedAccount.
     * @param {ConnectedAccountUpsertArgs} args - Arguments to update or create a ConnectedAccount.
     * @example
     * // Update or create a ConnectedAccount
     * const connectedAccount = await prisma.connectedAccount.upsert({
     *   create: {
     *     // ... data to create a ConnectedAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConnectedAccount we want to update
     *   }
     * })
     */
    upsert<T extends ConnectedAccountUpsertArgs>(args: SelectSubset<T, ConnectedAccountUpsertArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConnectedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountCountArgs} args - Arguments to filter ConnectedAccounts to count.
     * @example
     * // Count the number of ConnectedAccounts
     * const count = await prisma.connectedAccount.count({
     *   where: {
     *     // ... the filter for the ConnectedAccounts we want to count
     *   }
     * })
    **/
    count<T extends ConnectedAccountCountArgs>(
      args?: Subset<T, ConnectedAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConnectedAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConnectedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConnectedAccountAggregateArgs>(args: Subset<T, ConnectedAccountAggregateArgs>): Prisma.PrismaPromise<GetConnectedAccountAggregateType<T>>

    /**
     * Group by ConnectedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectedAccountGroupByArgs} args - Group by arguments.
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
      T extends ConnectedAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConnectedAccountGroupByArgs['orderBy'] }
        : { orderBy?: ConnectedAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConnectedAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConnectedAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConnectedAccount model
   */
  readonly fields: ConnectedAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConnectedAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConnectedAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    posts<T extends ConnectedAccount$postsArgs<ExtArgs> = {}>(args?: Subset<T, ConnectedAccount$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ConnectedAccount model
   */
  interface ConnectedAccountFieldRefs {
    readonly id: FieldRef<"ConnectedAccount", 'String'>
    readonly userId: FieldRef<"ConnectedAccount", 'String'>
    readonly facebookUserId: FieldRef<"ConnectedAccount", 'String'>
    readonly pageId: FieldRef<"ConnectedAccount", 'String'>
    readonly username: FieldRef<"ConnectedAccount", 'String'>
    readonly profilePictureUrl: FieldRef<"ConnectedAccount", 'String'>
    readonly pageAccessToken: FieldRef<"ConnectedAccount", 'String'>
    readonly instagramBusinessId: FieldRef<"ConnectedAccount", 'String'>
    readonly longLivedUserToken: FieldRef<"ConnectedAccount", 'String'>
    readonly tokenExpiry: FieldRef<"ConnectedAccount", 'DateTime'>
    readonly createdAt: FieldRef<"ConnectedAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConnectedAccount findUnique
   */
  export type ConnectedAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which ConnectedAccount to fetch.
     */
    where: ConnectedAccountWhereUniqueInput
  }

  /**
   * ConnectedAccount findUniqueOrThrow
   */
  export type ConnectedAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which ConnectedAccount to fetch.
     */
    where: ConnectedAccountWhereUniqueInput
  }

  /**
   * ConnectedAccount findFirst
   */
  export type ConnectedAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which ConnectedAccount to fetch.
     */
    where?: ConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectedAccounts to fetch.
     */
    orderBy?: ConnectedAccountOrderByWithRelationInput | ConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectedAccounts.
     */
    cursor?: ConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectedAccounts.
     */
    distinct?: ConnectedAccountScalarFieldEnum | ConnectedAccountScalarFieldEnum[]
  }

  /**
   * ConnectedAccount findFirstOrThrow
   */
  export type ConnectedAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which ConnectedAccount to fetch.
     */
    where?: ConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectedAccounts to fetch.
     */
    orderBy?: ConnectedAccountOrderByWithRelationInput | ConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectedAccounts.
     */
    cursor?: ConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectedAccounts.
     */
    distinct?: ConnectedAccountScalarFieldEnum | ConnectedAccountScalarFieldEnum[]
  }

  /**
   * ConnectedAccount findMany
   */
  export type ConnectedAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which ConnectedAccounts to fetch.
     */
    where?: ConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectedAccounts to fetch.
     */
    orderBy?: ConnectedAccountOrderByWithRelationInput | ConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConnectedAccounts.
     */
    cursor?: ConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectedAccounts.
     */
    skip?: number
    distinct?: ConnectedAccountScalarFieldEnum | ConnectedAccountScalarFieldEnum[]
  }

  /**
   * ConnectedAccount create
   */
  export type ConnectedAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * The data needed to create a ConnectedAccount.
     */
    data: XOR<ConnectedAccountCreateInput, ConnectedAccountUncheckedCreateInput>
  }

  /**
   * ConnectedAccount createMany
   */
  export type ConnectedAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConnectedAccounts.
     */
    data: ConnectedAccountCreateManyInput | ConnectedAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConnectedAccount createManyAndReturn
   */
  export type ConnectedAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * The data used to create many ConnectedAccounts.
     */
    data: ConnectedAccountCreateManyInput | ConnectedAccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConnectedAccount update
   */
  export type ConnectedAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * The data needed to update a ConnectedAccount.
     */
    data: XOR<ConnectedAccountUpdateInput, ConnectedAccountUncheckedUpdateInput>
    /**
     * Choose, which ConnectedAccount to update.
     */
    where: ConnectedAccountWhereUniqueInput
  }

  /**
   * ConnectedAccount updateMany
   */
  export type ConnectedAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConnectedAccounts.
     */
    data: XOR<ConnectedAccountUpdateManyMutationInput, ConnectedAccountUncheckedUpdateManyInput>
    /**
     * Filter which ConnectedAccounts to update
     */
    where?: ConnectedAccountWhereInput
    /**
     * Limit how many ConnectedAccounts to update.
     */
    limit?: number
  }

  /**
   * ConnectedAccount updateManyAndReturn
   */
  export type ConnectedAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * The data used to update ConnectedAccounts.
     */
    data: XOR<ConnectedAccountUpdateManyMutationInput, ConnectedAccountUncheckedUpdateManyInput>
    /**
     * Filter which ConnectedAccounts to update
     */
    where?: ConnectedAccountWhereInput
    /**
     * Limit how many ConnectedAccounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConnectedAccount upsert
   */
  export type ConnectedAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * The filter to search for the ConnectedAccount to update in case it exists.
     */
    where: ConnectedAccountWhereUniqueInput
    /**
     * In case the ConnectedAccount found by the `where` argument doesn't exist, create a new ConnectedAccount with this data.
     */
    create: XOR<ConnectedAccountCreateInput, ConnectedAccountUncheckedCreateInput>
    /**
     * In case the ConnectedAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConnectedAccountUpdateInput, ConnectedAccountUncheckedUpdateInput>
  }

  /**
   * ConnectedAccount delete
   */
  export type ConnectedAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter which ConnectedAccount to delete.
     */
    where: ConnectedAccountWhereUniqueInput
  }

  /**
   * ConnectedAccount deleteMany
   */
  export type ConnectedAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectedAccounts to delete
     */
    where?: ConnectedAccountWhereInput
    /**
     * Limit how many ConnectedAccounts to delete.
     */
    limit?: number
  }

  /**
   * ConnectedAccount.posts
   */
  export type ConnectedAccount$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * ConnectedAccount without action
   */
  export type ConnectedAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectedAccount
     */
    select?: ConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectedAccount
     */
    omit?: ConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectedAccountInclude<ExtArgs> | null
  }


  /**
   * Model Post
   */

  export type AggregatePost = {
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  export type PostAvgAggregateOutputType = {
    views: number | null
    reach: number | null
    saves: number | null
  }

  export type PostSumAggregateOutputType = {
    views: number | null
    reach: number | null
    saves: number | null
  }

  export type PostMinAggregateOutputType = {
    id: string | null
    userId: string | null
    connectedAccountId: string | null
    caption: string | null
    imageUrl: string | null
    mediaType: $Enums.MediaType | null
    instagramMediaId: string | null
    views: number | null
    reach: number | null
    saves: number | null
    createdAt: Date | null
  }

  export type PostMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    connectedAccountId: string | null
    caption: string | null
    imageUrl: string | null
    mediaType: $Enums.MediaType | null
    instagramMediaId: string | null
    views: number | null
    reach: number | null
    saves: number | null
    createdAt: Date | null
  }

  export type PostCountAggregateOutputType = {
    id: number
    userId: number
    connectedAccountId: number
    caption: number
    imageUrl: number
    mediaType: number
    instagramMediaId: number
    views: number
    reach: number
    saves: number
    createdAt: number
    _all: number
  }


  export type PostAvgAggregateInputType = {
    views?: true
    reach?: true
    saves?: true
  }

  export type PostSumAggregateInputType = {
    views?: true
    reach?: true
    saves?: true
  }

  export type PostMinAggregateInputType = {
    id?: true
    userId?: true
    connectedAccountId?: true
    caption?: true
    imageUrl?: true
    mediaType?: true
    instagramMediaId?: true
    views?: true
    reach?: true
    saves?: true
    createdAt?: true
  }

  export type PostMaxAggregateInputType = {
    id?: true
    userId?: true
    connectedAccountId?: true
    caption?: true
    imageUrl?: true
    mediaType?: true
    instagramMediaId?: true
    views?: true
    reach?: true
    saves?: true
    createdAt?: true
  }

  export type PostCountAggregateInputType = {
    id?: true
    userId?: true
    connectedAccountId?: true
    caption?: true
    imageUrl?: true
    mediaType?: true
    instagramMediaId?: true
    views?: true
    reach?: true
    saves?: true
    createdAt?: true
    _all?: true
  }

  export type PostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Post to aggregate.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Posts
    **/
    _count?: true | PostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostMaxAggregateInputType
  }

  export type GetPostAggregateType<T extends PostAggregateArgs> = {
        [P in keyof T & keyof AggregatePost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePost[P]>
      : GetScalarType<T[P], AggregatePost[P]>
  }




  export type PostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
    orderBy?: PostOrderByWithAggregationInput | PostOrderByWithAggregationInput[]
    by: PostScalarFieldEnum[] | PostScalarFieldEnum
    having?: PostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostCountAggregateInputType | true
    _avg?: PostAvgAggregateInputType
    _sum?: PostSumAggregateInputType
    _min?: PostMinAggregateInputType
    _max?: PostMaxAggregateInputType
  }

  export type PostGroupByOutputType = {
    id: string
    userId: string
    connectedAccountId: string
    caption: string | null
    imageUrl: string
    mediaType: $Enums.MediaType
    instagramMediaId: string | null
    views: number
    reach: number
    saves: number
    createdAt: Date
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  type GetPostGroupByPayload<T extends PostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostGroupByOutputType[P]>
            : GetScalarType<T[P], PostGroupByOutputType[P]>
        }
      >
    >


  export type PostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    connectedAccountId?: boolean
    caption?: boolean
    imageUrl?: boolean
    mediaType?: boolean
    instagramMediaId?: boolean
    views?: boolean
    reach?: boolean
    saves?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
    schedules?: boolean | Post$schedulesArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    connectedAccountId?: boolean
    caption?: boolean
    imageUrl?: boolean
    mediaType?: boolean
    instagramMediaId?: boolean
    views?: boolean
    reach?: boolean
    saves?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    connectedAccountId?: boolean
    caption?: boolean
    imageUrl?: boolean
    mediaType?: boolean
    instagramMediaId?: boolean
    views?: boolean
    reach?: boolean
    saves?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectScalar = {
    id?: boolean
    userId?: boolean
    connectedAccountId?: boolean
    caption?: boolean
    imageUrl?: boolean
    mediaType?: boolean
    instagramMediaId?: boolean
    views?: boolean
    reach?: boolean
    saves?: boolean
    createdAt?: boolean
  }

  export type PostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "connectedAccountId" | "caption" | "imageUrl" | "mediaType" | "instagramMediaId" | "views" | "reach" | "saves" | "createdAt", ExtArgs["result"]["post"]>
  export type PostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
    schedules?: boolean | Post$schedulesArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
  }
  export type PostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    connectedAccount?: boolean | ConnectedAccountDefaultArgs<ExtArgs>
  }

  export type $PostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Post"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      connectedAccount: Prisma.$ConnectedAccountPayload<ExtArgs>
      schedules: Prisma.$SchedulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      connectedAccountId: string
      caption: string | null
      imageUrl: string
      mediaType: $Enums.MediaType
      instagramMediaId: string | null
      views: number
      reach: number
      saves: number
      createdAt: Date
    }, ExtArgs["result"]["post"]>
    composites: {}
  }

  type PostGetPayload<S extends boolean | null | undefined | PostDefaultArgs> = $Result.GetResult<Prisma.$PostPayload, S>

  type PostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostCountAggregateInputType | true
    }

  export interface PostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Post'], meta: { name: 'Post' } }
    /**
     * Find zero or one Post that matches the filter.
     * @param {PostFindUniqueArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostFindUniqueArgs>(args: SelectSubset<T, PostFindUniqueArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Post that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostFindUniqueOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostFindUniqueOrThrowArgs>(args: SelectSubset<T, PostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostFindFirstArgs>(args?: SelectSubset<T, PostFindFirstArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostFindFirstOrThrowArgs>(args?: SelectSubset<T, PostFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Posts
     * const posts = await prisma.post.findMany()
     * 
     * // Get first 10 Posts
     * const posts = await prisma.post.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postWithIdOnly = await prisma.post.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostFindManyArgs>(args?: SelectSubset<T, PostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Post.
     * @param {PostCreateArgs} args - Arguments to create a Post.
     * @example
     * // Create one Post
     * const Post = await prisma.post.create({
     *   data: {
     *     // ... data to create a Post
     *   }
     * })
     * 
     */
    create<T extends PostCreateArgs>(args: SelectSubset<T, PostCreateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Posts.
     * @param {PostCreateManyArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostCreateManyArgs>(args?: SelectSubset<T, PostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Posts and returns the data saved in the database.
     * @param {PostCreateManyAndReturnArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PostCreateManyAndReturnArgs>(args?: SelectSubset<T, PostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Post.
     * @param {PostDeleteArgs} args - Arguments to delete one Post.
     * @example
     * // Delete one Post
     * const Post = await prisma.post.delete({
     *   where: {
     *     // ... filter to delete one Post
     *   }
     * })
     * 
     */
    delete<T extends PostDeleteArgs>(args: SelectSubset<T, PostDeleteArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Post.
     * @param {PostUpdateArgs} args - Arguments to update one Post.
     * @example
     * // Update one Post
     * const post = await prisma.post.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostUpdateArgs>(args: SelectSubset<T, PostUpdateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Posts.
     * @param {PostDeleteManyArgs} args - Arguments to filter Posts to delete.
     * @example
     * // Delete a few Posts
     * const { count } = await prisma.post.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostDeleteManyArgs>(args?: SelectSubset<T, PostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostUpdateManyArgs>(args: SelectSubset<T, PostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts and returns the data updated in the database.
     * @param {PostUpdateManyAndReturnArgs} args - Arguments to update many Posts.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PostUpdateManyAndReturnArgs>(args: SelectSubset<T, PostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Post.
     * @param {PostUpsertArgs} args - Arguments to update or create a Post.
     * @example
     * // Update or create a Post
     * const post = await prisma.post.upsert({
     *   create: {
     *     // ... data to create a Post
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Post we want to update
     *   }
     * })
     */
    upsert<T extends PostUpsertArgs>(args: SelectSubset<T, PostUpsertArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostCountArgs} args - Arguments to filter Posts to count.
     * @example
     * // Count the number of Posts
     * const count = await prisma.post.count({
     *   where: {
     *     // ... the filter for the Posts we want to count
     *   }
     * })
    **/
    count<T extends PostCountArgs>(
      args?: Subset<T, PostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PostAggregateArgs>(args: Subset<T, PostAggregateArgs>): Prisma.PrismaPromise<GetPostAggregateType<T>>

    /**
     * Group by Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostGroupByArgs} args - Group by arguments.
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
      T extends PostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostGroupByArgs['orderBy'] }
        : { orderBy?: PostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Post model
   */
  readonly fields: PostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Post.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    connectedAccount<T extends ConnectedAccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConnectedAccountDefaultArgs<ExtArgs>>): Prisma__ConnectedAccountClient<$Result.GetResult<Prisma.$ConnectedAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    schedules<T extends Post$schedulesArgs<ExtArgs> = {}>(args?: Subset<T, Post$schedulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Post model
   */
  interface PostFieldRefs {
    readonly id: FieldRef<"Post", 'String'>
    readonly userId: FieldRef<"Post", 'String'>
    readonly connectedAccountId: FieldRef<"Post", 'String'>
    readonly caption: FieldRef<"Post", 'String'>
    readonly imageUrl: FieldRef<"Post", 'String'>
    readonly mediaType: FieldRef<"Post", 'MediaType'>
    readonly instagramMediaId: FieldRef<"Post", 'String'>
    readonly views: FieldRef<"Post", 'Int'>
    readonly reach: FieldRef<"Post", 'Int'>
    readonly saves: FieldRef<"Post", 'Int'>
    readonly createdAt: FieldRef<"Post", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Post findUnique
   */
  export type PostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findUniqueOrThrow
   */
  export type PostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findFirst
   */
  export type PostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findFirstOrThrow
   */
  export type PostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findMany
   */
  export type PostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Posts to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post create
   */
  export type PostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to create a Post.
     */
    data: XOR<PostCreateInput, PostUncheckedCreateInput>
  }

  /**
   * Post createMany
   */
  export type PostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Post createManyAndReturn
   */
  export type PostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post update
   */
  export type PostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to update a Post.
     */
    data: XOR<PostUpdateInput, PostUncheckedUpdateInput>
    /**
     * Choose, which Post to update.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post updateMany
   */
  export type PostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
  }

  /**
   * Post updateManyAndReturn
   */
  export type PostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post upsert
   */
  export type PostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The filter to search for the Post to update in case it exists.
     */
    where: PostWhereUniqueInput
    /**
     * In case the Post found by the `where` argument doesn't exist, create a new Post with this data.
     */
    create: XOR<PostCreateInput, PostUncheckedCreateInput>
    /**
     * In case the Post was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostUpdateInput, PostUncheckedUpdateInput>
  }

  /**
   * Post delete
   */
  export type PostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter which Post to delete.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post deleteMany
   */
  export type PostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Posts to delete
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to delete.
     */
    limit?: number
  }

  /**
   * Post.schedules
   */
  export type Post$schedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    where?: ScheduleWhereInput
    orderBy?: ScheduleOrderByWithRelationInput | ScheduleOrderByWithRelationInput[]
    cursor?: ScheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScheduleScalarFieldEnum | ScheduleScalarFieldEnum[]
  }

  /**
   * Post without action
   */
  export type PostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
  }


  /**
   * Model Schedule
   */

  export type AggregateSchedule = {
    _count: ScheduleCountAggregateOutputType | null
    _min: ScheduleMinAggregateOutputType | null
    _max: ScheduleMaxAggregateOutputType | null
  }

  export type ScheduleMinAggregateOutputType = {
    id: string | null
    postId: string | null
    scheduledFor: Date | null
    status: $Enums.ScheduleStatus | null
    createdAt: Date | null
  }

  export type ScheduleMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    scheduledFor: Date | null
    status: $Enums.ScheduleStatus | null
    createdAt: Date | null
  }

  export type ScheduleCountAggregateOutputType = {
    id: number
    postId: number
    scheduledFor: number
    status: number
    createdAt: number
    _all: number
  }


  export type ScheduleMinAggregateInputType = {
    id?: true
    postId?: true
    scheduledFor?: true
    status?: true
    createdAt?: true
  }

  export type ScheduleMaxAggregateInputType = {
    id?: true
    postId?: true
    scheduledFor?: true
    status?: true
    createdAt?: true
  }

  export type ScheduleCountAggregateInputType = {
    id?: true
    postId?: true
    scheduledFor?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type ScheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schedule to aggregate.
     */
    where?: ScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schedules to fetch.
     */
    orderBy?: ScheduleOrderByWithRelationInput | ScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Schedules
    **/
    _count?: true | ScheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScheduleMaxAggregateInputType
  }

  export type GetScheduleAggregateType<T extends ScheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateSchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSchedule[P]>
      : GetScalarType<T[P], AggregateSchedule[P]>
  }




  export type ScheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScheduleWhereInput
    orderBy?: ScheduleOrderByWithAggregationInput | ScheduleOrderByWithAggregationInput[]
    by: ScheduleScalarFieldEnum[] | ScheduleScalarFieldEnum
    having?: ScheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScheduleCountAggregateInputType | true
    _min?: ScheduleMinAggregateInputType
    _max?: ScheduleMaxAggregateInputType
  }

  export type ScheduleGroupByOutputType = {
    id: string
    postId: string
    scheduledFor: Date
    status: $Enums.ScheduleStatus
    createdAt: Date
    _count: ScheduleCountAggregateOutputType | null
    _min: ScheduleMinAggregateOutputType | null
    _max: ScheduleMaxAggregateOutputType | null
  }

  type GetScheduleGroupByPayload<T extends ScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScheduleGroupByOutputType[P]>
            : GetScalarType<T[P], ScheduleGroupByOutputType[P]>
        }
      >
    >


  export type ScheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    scheduledFor?: boolean
    status?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schedule"]>

  export type ScheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    scheduledFor?: boolean
    status?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schedule"]>

  export type ScheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    scheduledFor?: boolean
    status?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schedule"]>

  export type ScheduleSelectScalar = {
    id?: boolean
    postId?: boolean
    scheduledFor?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type ScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "scheduledFor" | "status" | "createdAt", ExtArgs["result"]["schedule"]>
  export type ScheduleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }
  export type ScheduleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }
  export type ScheduleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }

  export type $SchedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Schedule"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      scheduledFor: Date
      status: $Enums.ScheduleStatus
      createdAt: Date
    }, ExtArgs["result"]["schedule"]>
    composites: {}
  }

  type ScheduleGetPayload<S extends boolean | null | undefined | ScheduleDefaultArgs> = $Result.GetResult<Prisma.$SchedulePayload, S>

  type ScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScheduleCountAggregateInputType | true
    }

  export interface ScheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Schedule'], meta: { name: 'Schedule' } }
    /**
     * Find zero or one Schedule that matches the filter.
     * @param {ScheduleFindUniqueArgs} args - Arguments to find a Schedule
     * @example
     * // Get one Schedule
     * const schedule = await prisma.schedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScheduleFindUniqueArgs>(args: SelectSubset<T, ScheduleFindUniqueArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Schedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScheduleFindUniqueOrThrowArgs} args - Arguments to find a Schedule
     * @example
     * // Get one Schedule
     * const schedule = await prisma.schedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, ScheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Schedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleFindFirstArgs} args - Arguments to find a Schedule
     * @example
     * // Get one Schedule
     * const schedule = await prisma.schedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScheduleFindFirstArgs>(args?: SelectSubset<T, ScheduleFindFirstArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Schedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleFindFirstOrThrowArgs} args - Arguments to find a Schedule
     * @example
     * // Get one Schedule
     * const schedule = await prisma.schedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, ScheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Schedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Schedules
     * const schedules = await prisma.schedule.findMany()
     * 
     * // Get first 10 Schedules
     * const schedules = await prisma.schedule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scheduleWithIdOnly = await prisma.schedule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScheduleFindManyArgs>(args?: SelectSubset<T, ScheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Schedule.
     * @param {ScheduleCreateArgs} args - Arguments to create a Schedule.
     * @example
     * // Create one Schedule
     * const Schedule = await prisma.schedule.create({
     *   data: {
     *     // ... data to create a Schedule
     *   }
     * })
     * 
     */
    create<T extends ScheduleCreateArgs>(args: SelectSubset<T, ScheduleCreateArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Schedules.
     * @param {ScheduleCreateManyArgs} args - Arguments to create many Schedules.
     * @example
     * // Create many Schedules
     * const schedule = await prisma.schedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScheduleCreateManyArgs>(args?: SelectSubset<T, ScheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Schedules and returns the data saved in the database.
     * @param {ScheduleCreateManyAndReturnArgs} args - Arguments to create many Schedules.
     * @example
     * // Create many Schedules
     * const schedule = await prisma.schedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Schedules and only return the `id`
     * const scheduleWithIdOnly = await prisma.schedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, ScheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Schedule.
     * @param {ScheduleDeleteArgs} args - Arguments to delete one Schedule.
     * @example
     * // Delete one Schedule
     * const Schedule = await prisma.schedule.delete({
     *   where: {
     *     // ... filter to delete one Schedule
     *   }
     * })
     * 
     */
    delete<T extends ScheduleDeleteArgs>(args: SelectSubset<T, ScheduleDeleteArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Schedule.
     * @param {ScheduleUpdateArgs} args - Arguments to update one Schedule.
     * @example
     * // Update one Schedule
     * const schedule = await prisma.schedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScheduleUpdateArgs>(args: SelectSubset<T, ScheduleUpdateArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Schedules.
     * @param {ScheduleDeleteManyArgs} args - Arguments to filter Schedules to delete.
     * @example
     * // Delete a few Schedules
     * const { count } = await prisma.schedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScheduleDeleteManyArgs>(args?: SelectSubset<T, ScheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Schedules
     * const schedule = await prisma.schedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScheduleUpdateManyArgs>(args: SelectSubset<T, ScheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schedules and returns the data updated in the database.
     * @param {ScheduleUpdateManyAndReturnArgs} args - Arguments to update many Schedules.
     * @example
     * // Update many Schedules
     * const schedule = await prisma.schedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Schedules and only return the `id`
     * const scheduleWithIdOnly = await prisma.schedule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, ScheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Schedule.
     * @param {ScheduleUpsertArgs} args - Arguments to update or create a Schedule.
     * @example
     * // Update or create a Schedule
     * const schedule = await prisma.schedule.upsert({
     *   create: {
     *     // ... data to create a Schedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Schedule we want to update
     *   }
     * })
     */
    upsert<T extends ScheduleUpsertArgs>(args: SelectSubset<T, ScheduleUpsertArgs<ExtArgs>>): Prisma__ScheduleClient<$Result.GetResult<Prisma.$SchedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Schedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleCountArgs} args - Arguments to filter Schedules to count.
     * @example
     * // Count the number of Schedules
     * const count = await prisma.schedule.count({
     *   where: {
     *     // ... the filter for the Schedules we want to count
     *   }
     * })
    **/
    count<T extends ScheduleCountArgs>(
      args?: Subset<T, ScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Schedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ScheduleAggregateArgs>(args: Subset<T, ScheduleAggregateArgs>): Prisma.PrismaPromise<GetScheduleAggregateType<T>>

    /**
     * Group by Schedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleGroupByArgs} args - Group by arguments.
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
      T extends ScheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScheduleGroupByArgs['orderBy'] }
        : { orderBy?: ScheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Schedule model
   */
  readonly fields: ScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Schedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Schedule model
   */
  interface ScheduleFieldRefs {
    readonly id: FieldRef<"Schedule", 'String'>
    readonly postId: FieldRef<"Schedule", 'String'>
    readonly scheduledFor: FieldRef<"Schedule", 'DateTime'>
    readonly status: FieldRef<"Schedule", 'ScheduleStatus'>
    readonly createdAt: FieldRef<"Schedule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Schedule findUnique
   */
  export type ScheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter, which Schedule to fetch.
     */
    where: ScheduleWhereUniqueInput
  }

  /**
   * Schedule findUniqueOrThrow
   */
  export type ScheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter, which Schedule to fetch.
     */
    where: ScheduleWhereUniqueInput
  }

  /**
   * Schedule findFirst
   */
  export type ScheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter, which Schedule to fetch.
     */
    where?: ScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schedules to fetch.
     */
    orderBy?: ScheduleOrderByWithRelationInput | ScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schedules.
     */
    cursor?: ScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schedules.
     */
    distinct?: ScheduleScalarFieldEnum | ScheduleScalarFieldEnum[]
  }

  /**
   * Schedule findFirstOrThrow
   */
  export type ScheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter, which Schedule to fetch.
     */
    where?: ScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schedules to fetch.
     */
    orderBy?: ScheduleOrderByWithRelationInput | ScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schedules.
     */
    cursor?: ScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schedules.
     */
    distinct?: ScheduleScalarFieldEnum | ScheduleScalarFieldEnum[]
  }

  /**
   * Schedule findMany
   */
  export type ScheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter, which Schedules to fetch.
     */
    where?: ScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schedules to fetch.
     */
    orderBy?: ScheduleOrderByWithRelationInput | ScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Schedules.
     */
    cursor?: ScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schedules.
     */
    skip?: number
    distinct?: ScheduleScalarFieldEnum | ScheduleScalarFieldEnum[]
  }

  /**
   * Schedule create
   */
  export type ScheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * The data needed to create a Schedule.
     */
    data: XOR<ScheduleCreateInput, ScheduleUncheckedCreateInput>
  }

  /**
   * Schedule createMany
   */
  export type ScheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Schedules.
     */
    data: ScheduleCreateManyInput | ScheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Schedule createManyAndReturn
   */
  export type ScheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * The data used to create many Schedules.
     */
    data: ScheduleCreateManyInput | ScheduleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Schedule update
   */
  export type ScheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * The data needed to update a Schedule.
     */
    data: XOR<ScheduleUpdateInput, ScheduleUncheckedUpdateInput>
    /**
     * Choose, which Schedule to update.
     */
    where: ScheduleWhereUniqueInput
  }

  /**
   * Schedule updateMany
   */
  export type ScheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Schedules.
     */
    data: XOR<ScheduleUpdateManyMutationInput, ScheduleUncheckedUpdateManyInput>
    /**
     * Filter which Schedules to update
     */
    where?: ScheduleWhereInput
    /**
     * Limit how many Schedules to update.
     */
    limit?: number
  }

  /**
   * Schedule updateManyAndReturn
   */
  export type ScheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * The data used to update Schedules.
     */
    data: XOR<ScheduleUpdateManyMutationInput, ScheduleUncheckedUpdateManyInput>
    /**
     * Filter which Schedules to update
     */
    where?: ScheduleWhereInput
    /**
     * Limit how many Schedules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Schedule upsert
   */
  export type ScheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * The filter to search for the Schedule to update in case it exists.
     */
    where: ScheduleWhereUniqueInput
    /**
     * In case the Schedule found by the `where` argument doesn't exist, create a new Schedule with this data.
     */
    create: XOR<ScheduleCreateInput, ScheduleUncheckedCreateInput>
    /**
     * In case the Schedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScheduleUpdateInput, ScheduleUncheckedUpdateInput>
  }

  /**
   * Schedule delete
   */
  export type ScheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
    /**
     * Filter which Schedule to delete.
     */
    where: ScheduleWhereUniqueInput
  }

  /**
   * Schedule deleteMany
   */
  export type ScheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schedules to delete
     */
    where?: ScheduleWhereInput
    /**
     * Limit how many Schedules to delete.
     */
    limit?: number
  }

  /**
   * Schedule without action
   */
  export type ScheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schedule
     */
    select?: ScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Schedule
     */
    omit?: ScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScheduleInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password_hash: 'password_hash',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ConnectedAccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    facebookUserId: 'facebookUserId',
    pageId: 'pageId',
    username: 'username',
    profilePictureUrl: 'profilePictureUrl',
    pageAccessToken: 'pageAccessToken',
    instagramBusinessId: 'instagramBusinessId',
    longLivedUserToken: 'longLivedUserToken',
    tokenExpiry: 'tokenExpiry',
    createdAt: 'createdAt'
  };

  export type ConnectedAccountScalarFieldEnum = (typeof ConnectedAccountScalarFieldEnum)[keyof typeof ConnectedAccountScalarFieldEnum]


  export const PostScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    connectedAccountId: 'connectedAccountId',
    caption: 'caption',
    imageUrl: 'imageUrl',
    mediaType: 'mediaType',
    instagramMediaId: 'instagramMediaId',
    views: 'views',
    reach: 'reach',
    saves: 'saves',
    createdAt: 'createdAt'
  };

  export type PostScalarFieldEnum = (typeof PostScalarFieldEnum)[keyof typeof PostScalarFieldEnum]


  export const ScheduleScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    scheduledFor: 'scheduledFor',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type ScheduleScalarFieldEnum = (typeof ScheduleScalarFieldEnum)[keyof typeof ScheduleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'MediaType'
   */
  export type EnumMediaTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaType'>
    


  /**
   * Reference to a field of type 'MediaType[]'
   */
  export type ListEnumMediaTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'ScheduleStatus'
   */
  export type EnumScheduleStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduleStatus'>
    


  /**
   * Reference to a field of type 'ScheduleStatus[]'
   */
  export type ListEnumScheduleStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduleStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    password_hash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    posts?: PostListRelationFilter
    connectedAccounts?: ConnectedAccountListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    password_hash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    posts?: PostOrderByRelationAggregateInput
    connectedAccounts?: ConnectedAccountOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password_hash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    posts?: PostListRelationFilter
    connectedAccounts?: ConnectedAccountListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    password_hash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    password_hash?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ConnectedAccountWhereInput = {
    AND?: ConnectedAccountWhereInput | ConnectedAccountWhereInput[]
    OR?: ConnectedAccountWhereInput[]
    NOT?: ConnectedAccountWhereInput | ConnectedAccountWhereInput[]
    id?: StringFilter<"ConnectedAccount"> | string
    userId?: StringFilter<"ConnectedAccount"> | string
    facebookUserId?: StringFilter<"ConnectedAccount"> | string
    pageId?: StringFilter<"ConnectedAccount"> | string
    username?: StringNullableFilter<"ConnectedAccount"> | string | null
    profilePictureUrl?: StringNullableFilter<"ConnectedAccount"> | string | null
    pageAccessToken?: StringFilter<"ConnectedAccount"> | string
    instagramBusinessId?: StringFilter<"ConnectedAccount"> | string
    longLivedUserToken?: StringFilter<"ConnectedAccount"> | string
    tokenExpiry?: DateTimeFilter<"ConnectedAccount"> | Date | string
    createdAt?: DateTimeFilter<"ConnectedAccount"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    posts?: PostListRelationFilter
  }

  export type ConnectedAccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    facebookUserId?: SortOrder
    pageId?: SortOrder
    username?: SortOrderInput | SortOrder
    profilePictureUrl?: SortOrderInput | SortOrder
    pageAccessToken?: SortOrder
    instagramBusinessId?: SortOrder
    longLivedUserToken?: SortOrder
    tokenExpiry?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    posts?: PostOrderByRelationAggregateInput
  }

  export type ConnectedAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_pageId?: ConnectedAccountUserIdPageIdCompoundUniqueInput
    AND?: ConnectedAccountWhereInput | ConnectedAccountWhereInput[]
    OR?: ConnectedAccountWhereInput[]
    NOT?: ConnectedAccountWhereInput | ConnectedAccountWhereInput[]
    userId?: StringFilter<"ConnectedAccount"> | string
    facebookUserId?: StringFilter<"ConnectedAccount"> | string
    pageId?: StringFilter<"ConnectedAccount"> | string
    username?: StringNullableFilter<"ConnectedAccount"> | string | null
    profilePictureUrl?: StringNullableFilter<"ConnectedAccount"> | string | null
    pageAccessToken?: StringFilter<"ConnectedAccount"> | string
    instagramBusinessId?: StringFilter<"ConnectedAccount"> | string
    longLivedUserToken?: StringFilter<"ConnectedAccount"> | string
    tokenExpiry?: DateTimeFilter<"ConnectedAccount"> | Date | string
    createdAt?: DateTimeFilter<"ConnectedAccount"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    posts?: PostListRelationFilter
  }, "id" | "userId_pageId">

  export type ConnectedAccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    facebookUserId?: SortOrder
    pageId?: SortOrder
    username?: SortOrderInput | SortOrder
    profilePictureUrl?: SortOrderInput | SortOrder
    pageAccessToken?: SortOrder
    instagramBusinessId?: SortOrder
    longLivedUserToken?: SortOrder
    tokenExpiry?: SortOrder
    createdAt?: SortOrder
    _count?: ConnectedAccountCountOrderByAggregateInput
    _max?: ConnectedAccountMaxOrderByAggregateInput
    _min?: ConnectedAccountMinOrderByAggregateInput
  }

  export type ConnectedAccountScalarWhereWithAggregatesInput = {
    AND?: ConnectedAccountScalarWhereWithAggregatesInput | ConnectedAccountScalarWhereWithAggregatesInput[]
    OR?: ConnectedAccountScalarWhereWithAggregatesInput[]
    NOT?: ConnectedAccountScalarWhereWithAggregatesInput | ConnectedAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    userId?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    facebookUserId?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    pageId?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    username?: StringNullableWithAggregatesFilter<"ConnectedAccount"> | string | null
    profilePictureUrl?: StringNullableWithAggregatesFilter<"ConnectedAccount"> | string | null
    pageAccessToken?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    instagramBusinessId?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    longLivedUserToken?: StringWithAggregatesFilter<"ConnectedAccount"> | string
    tokenExpiry?: DateTimeWithAggregatesFilter<"ConnectedAccount"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"ConnectedAccount"> | Date | string
  }

  export type PostWhereInput = {
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    id?: StringFilter<"Post"> | string
    userId?: StringFilter<"Post"> | string
    connectedAccountId?: StringFilter<"Post"> | string
    caption?: StringNullableFilter<"Post"> | string | null
    imageUrl?: StringFilter<"Post"> | string
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    instagramMediaId?: StringNullableFilter<"Post"> | string | null
    views?: IntFilter<"Post"> | number
    reach?: IntFilter<"Post"> | number
    saves?: IntFilter<"Post"> | number
    createdAt?: DateTimeFilter<"Post"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    connectedAccount?: XOR<ConnectedAccountScalarRelationFilter, ConnectedAccountWhereInput>
    schedules?: ScheduleListRelationFilter
  }

  export type PostOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    connectedAccountId?: SortOrder
    caption?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    mediaType?: SortOrder
    instagramMediaId?: SortOrderInput | SortOrder
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    connectedAccount?: ConnectedAccountOrderByWithRelationInput
    schedules?: ScheduleOrderByRelationAggregateInput
  }

  export type PostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    userId?: StringFilter<"Post"> | string
    connectedAccountId?: StringFilter<"Post"> | string
    caption?: StringNullableFilter<"Post"> | string | null
    imageUrl?: StringFilter<"Post"> | string
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    instagramMediaId?: StringNullableFilter<"Post"> | string | null
    views?: IntFilter<"Post"> | number
    reach?: IntFilter<"Post"> | number
    saves?: IntFilter<"Post"> | number
    createdAt?: DateTimeFilter<"Post"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    connectedAccount?: XOR<ConnectedAccountScalarRelationFilter, ConnectedAccountWhereInput>
    schedules?: ScheduleListRelationFilter
  }, "id">

  export type PostOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    connectedAccountId?: SortOrder
    caption?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    mediaType?: SortOrder
    instagramMediaId?: SortOrderInput | SortOrder
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
    createdAt?: SortOrder
    _count?: PostCountOrderByAggregateInput
    _avg?: PostAvgOrderByAggregateInput
    _max?: PostMaxOrderByAggregateInput
    _min?: PostMinOrderByAggregateInput
    _sum?: PostSumOrderByAggregateInput
  }

  export type PostScalarWhereWithAggregatesInput = {
    AND?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    OR?: PostScalarWhereWithAggregatesInput[]
    NOT?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Post"> | string
    userId?: StringWithAggregatesFilter<"Post"> | string
    connectedAccountId?: StringWithAggregatesFilter<"Post"> | string
    caption?: StringNullableWithAggregatesFilter<"Post"> | string | null
    imageUrl?: StringWithAggregatesFilter<"Post"> | string
    mediaType?: EnumMediaTypeWithAggregatesFilter<"Post"> | $Enums.MediaType
    instagramMediaId?: StringNullableWithAggregatesFilter<"Post"> | string | null
    views?: IntWithAggregatesFilter<"Post"> | number
    reach?: IntWithAggregatesFilter<"Post"> | number
    saves?: IntWithAggregatesFilter<"Post"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
  }

  export type ScheduleWhereInput = {
    AND?: ScheduleWhereInput | ScheduleWhereInput[]
    OR?: ScheduleWhereInput[]
    NOT?: ScheduleWhereInput | ScheduleWhereInput[]
    id?: StringFilter<"Schedule"> | string
    postId?: StringFilter<"Schedule"> | string
    scheduledFor?: DateTimeFilter<"Schedule"> | Date | string
    status?: EnumScheduleStatusFilter<"Schedule"> | $Enums.ScheduleStatus
    createdAt?: DateTimeFilter<"Schedule"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }

  export type ScheduleOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    scheduledFor?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    post?: PostOrderByWithRelationInput
  }

  export type ScheduleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScheduleWhereInput | ScheduleWhereInput[]
    OR?: ScheduleWhereInput[]
    NOT?: ScheduleWhereInput | ScheduleWhereInput[]
    postId?: StringFilter<"Schedule"> | string
    scheduledFor?: DateTimeFilter<"Schedule"> | Date | string
    status?: EnumScheduleStatusFilter<"Schedule"> | $Enums.ScheduleStatus
    createdAt?: DateTimeFilter<"Schedule"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }, "id">

  export type ScheduleOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    scheduledFor?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: ScheduleCountOrderByAggregateInput
    _max?: ScheduleMaxOrderByAggregateInput
    _min?: ScheduleMinOrderByAggregateInput
  }

  export type ScheduleScalarWhereWithAggregatesInput = {
    AND?: ScheduleScalarWhereWithAggregatesInput | ScheduleScalarWhereWithAggregatesInput[]
    OR?: ScheduleScalarWhereWithAggregatesInput[]
    NOT?: ScheduleScalarWhereWithAggregatesInput | ScheduleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Schedule"> | string
    postId?: StringWithAggregatesFilter<"Schedule"> | string
    scheduledFor?: DateTimeWithAggregatesFilter<"Schedule"> | Date | string
    status?: EnumScheduleStatusWithAggregatesFilter<"Schedule"> | $Enums.ScheduleStatus
    createdAt?: DateTimeWithAggregatesFilter<"Schedule"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    posts?: PostCreateNestedManyWithoutUserInput
    connectedAccounts?: ConnectedAccountCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    posts?: PostUncheckedCreateNestedManyWithoutUserInput
    connectedAccounts?: ConnectedAccountUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUpdateManyWithoutUserNestedInput
    connectedAccounts?: ConnectedAccountUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUncheckedUpdateManyWithoutUserNestedInput
    connectedAccounts?: ConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConnectedAccountCreateInput = {
    id?: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutConnectedAccountsInput
    posts?: PostCreateNestedManyWithoutConnectedAccountInput
  }

  export type ConnectedAccountUncheckedCreateInput = {
    id?: string
    userId: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
    posts?: PostUncheckedCreateNestedManyWithoutConnectedAccountInput
  }

  export type ConnectedAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutConnectedAccountsNestedInput
    posts?: PostUpdateManyWithoutConnectedAccountNestedInput
  }

  export type ConnectedAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUncheckedUpdateManyWithoutConnectedAccountNestedInput
  }

  export type ConnectedAccountCreateManyInput = {
    id?: string
    userId: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
  }

  export type ConnectedAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConnectedAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateInput = {
    id?: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPostsInput
    connectedAccount: ConnectedAccountCreateNestedOneWithoutPostsInput
    schedules?: ScheduleCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateInput = {
    id?: string
    userId: string
    connectedAccountId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    schedules?: ScheduleUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPostsNestedInput
    connectedAccount?: ConnectedAccountUpdateOneRequiredWithoutPostsNestedInput
    schedules?: ScheduleUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    connectedAccountId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedules?: ScheduleUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateManyInput = {
    id?: string
    userId: string
    connectedAccountId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
  }

  export type PostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    connectedAccountId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleCreateInput = {
    id?: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutSchedulesInput
  }

  export type ScheduleUncheckedCreateInput = {
    id?: string
    postId: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
  }

  export type ScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutSchedulesNestedInput
  }

  export type ScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleCreateManyInput = {
    id?: string
    postId: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
  }

  export type ScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PostListRelationFilter = {
    every?: PostWhereInput
    some?: PostWhereInput
    none?: PostWhereInput
  }

  export type ConnectedAccountListRelationFilter = {
    every?: ConnectedAccountWhereInput
    some?: ConnectedAccountWhereInput
    none?: ConnectedAccountWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConnectedAccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ConnectedAccountUserIdPageIdCompoundUniqueInput = {
    userId: string
    pageId: string
  }

  export type ConnectedAccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    facebookUserId?: SortOrder
    pageId?: SortOrder
    username?: SortOrder
    profilePictureUrl?: SortOrder
    pageAccessToken?: SortOrder
    instagramBusinessId?: SortOrder
    longLivedUserToken?: SortOrder
    tokenExpiry?: SortOrder
    createdAt?: SortOrder
  }

  export type ConnectedAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    facebookUserId?: SortOrder
    pageId?: SortOrder
    username?: SortOrder
    profilePictureUrl?: SortOrder
    pageAccessToken?: SortOrder
    instagramBusinessId?: SortOrder
    longLivedUserToken?: SortOrder
    tokenExpiry?: SortOrder
    createdAt?: SortOrder
  }

  export type ConnectedAccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    facebookUserId?: SortOrder
    pageId?: SortOrder
    username?: SortOrder
    profilePictureUrl?: SortOrder
    pageAccessToken?: SortOrder
    instagramBusinessId?: SortOrder
    longLivedUserToken?: SortOrder
    tokenExpiry?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumMediaTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeFilter<$PrismaModel> | $Enums.MediaType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ConnectedAccountScalarRelationFilter = {
    is?: ConnectedAccountWhereInput
    isNot?: ConnectedAccountWhereInput
  }

  export type ScheduleListRelationFilter = {
    every?: ScheduleWhereInput
    some?: ScheduleWhereInput
    none?: ScheduleWhereInput
  }

  export type ScheduleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    connectedAccountId?: SortOrder
    caption?: SortOrder
    imageUrl?: SortOrder
    mediaType?: SortOrder
    instagramMediaId?: SortOrder
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
    createdAt?: SortOrder
  }

  export type PostAvgOrderByAggregateInput = {
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
  }

  export type PostMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    connectedAccountId?: SortOrder
    caption?: SortOrder
    imageUrl?: SortOrder
    mediaType?: SortOrder
    instagramMediaId?: SortOrder
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
    createdAt?: SortOrder
  }

  export type PostMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    connectedAccountId?: SortOrder
    caption?: SortOrder
    imageUrl?: SortOrder
    mediaType?: SortOrder
    instagramMediaId?: SortOrder
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
    createdAt?: SortOrder
  }

  export type PostSumOrderByAggregateInput = {
    views?: SortOrder
    reach?: SortOrder
    saves?: SortOrder
  }

  export type EnumMediaTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel> | $Enums.MediaType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaTypeFilter<$PrismaModel>
    _max?: NestedEnumMediaTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumScheduleStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleStatus | EnumScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumScheduleStatusFilter<$PrismaModel> | $Enums.ScheduleStatus
  }

  export type PostScalarRelationFilter = {
    is?: PostWhereInput
    isNot?: PostWhereInput
  }

  export type ScheduleCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    scheduledFor?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ScheduleMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    scheduledFor?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ScheduleMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    scheduledFor?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumScheduleStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleStatus | EnumScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumScheduleStatusWithAggregatesFilter<$PrismaModel> | $Enums.ScheduleStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumScheduleStatusFilter<$PrismaModel>
    _max?: NestedEnumScheduleStatusFilter<$PrismaModel>
  }

  export type PostCreateNestedManyWithoutUserInput = {
    create?: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput> | PostCreateWithoutUserInput[] | PostUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostCreateOrConnectWithoutUserInput | PostCreateOrConnectWithoutUserInput[]
    createMany?: PostCreateManyUserInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type ConnectedAccountCreateNestedManyWithoutUserInput = {
    create?: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput> | ConnectedAccountCreateWithoutUserInput[] | ConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutUserInput | ConnectedAccountCreateOrConnectWithoutUserInput[]
    createMany?: ConnectedAccountCreateManyUserInputEnvelope
    connect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput> | PostCreateWithoutUserInput[] | PostUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostCreateOrConnectWithoutUserInput | PostCreateOrConnectWithoutUserInput[]
    createMany?: PostCreateManyUserInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type ConnectedAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput> | ConnectedAccountCreateWithoutUserInput[] | ConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutUserInput | ConnectedAccountCreateOrConnectWithoutUserInput[]
    createMany?: ConnectedAccountCreateManyUserInputEnvelope
    connect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PostUpdateManyWithoutUserNestedInput = {
    create?: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput> | PostCreateWithoutUserInput[] | PostUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostCreateOrConnectWithoutUserInput | PostCreateOrConnectWithoutUserInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutUserInput | PostUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PostCreateManyUserInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutUserInput | PostUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PostUpdateManyWithWhereWithoutUserInput | PostUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type ConnectedAccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput> | ConnectedAccountCreateWithoutUserInput[] | ConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutUserInput | ConnectedAccountCreateOrConnectWithoutUserInput[]
    upsert?: ConnectedAccountUpsertWithWhereUniqueWithoutUserInput | ConnectedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ConnectedAccountCreateManyUserInputEnvelope
    set?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    disconnect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    delete?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    connect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    update?: ConnectedAccountUpdateWithWhereUniqueWithoutUserInput | ConnectedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ConnectedAccountUpdateManyWithWhereWithoutUserInput | ConnectedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ConnectedAccountScalarWhereInput | ConnectedAccountScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput> | PostCreateWithoutUserInput[] | PostUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostCreateOrConnectWithoutUserInput | PostCreateOrConnectWithoutUserInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutUserInput | PostUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PostCreateManyUserInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutUserInput | PostUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PostUpdateManyWithWhereWithoutUserInput | PostUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type ConnectedAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput> | ConnectedAccountCreateWithoutUserInput[] | ConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutUserInput | ConnectedAccountCreateOrConnectWithoutUserInput[]
    upsert?: ConnectedAccountUpsertWithWhereUniqueWithoutUserInput | ConnectedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ConnectedAccountCreateManyUserInputEnvelope
    set?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    disconnect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    delete?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    connect?: ConnectedAccountWhereUniqueInput | ConnectedAccountWhereUniqueInput[]
    update?: ConnectedAccountUpdateWithWhereUniqueWithoutUserInput | ConnectedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ConnectedAccountUpdateManyWithWhereWithoutUserInput | ConnectedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ConnectedAccountScalarWhereInput | ConnectedAccountScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutConnectedAccountsInput = {
    create?: XOR<UserCreateWithoutConnectedAccountsInput, UserUncheckedCreateWithoutConnectedAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutConnectedAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type PostCreateNestedManyWithoutConnectedAccountInput = {
    create?: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput> | PostCreateWithoutConnectedAccountInput[] | PostUncheckedCreateWithoutConnectedAccountInput[]
    connectOrCreate?: PostCreateOrConnectWithoutConnectedAccountInput | PostCreateOrConnectWithoutConnectedAccountInput[]
    createMany?: PostCreateManyConnectedAccountInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutConnectedAccountInput = {
    create?: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput> | PostCreateWithoutConnectedAccountInput[] | PostUncheckedCreateWithoutConnectedAccountInput[]
    connectOrCreate?: PostCreateOrConnectWithoutConnectedAccountInput | PostCreateOrConnectWithoutConnectedAccountInput[]
    createMany?: PostCreateManyConnectedAccountInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutConnectedAccountsNestedInput = {
    create?: XOR<UserCreateWithoutConnectedAccountsInput, UserUncheckedCreateWithoutConnectedAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutConnectedAccountsInput
    upsert?: UserUpsertWithoutConnectedAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutConnectedAccountsInput, UserUpdateWithoutConnectedAccountsInput>, UserUncheckedUpdateWithoutConnectedAccountsInput>
  }

  export type PostUpdateManyWithoutConnectedAccountNestedInput = {
    create?: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput> | PostCreateWithoutConnectedAccountInput[] | PostUncheckedCreateWithoutConnectedAccountInput[]
    connectOrCreate?: PostCreateOrConnectWithoutConnectedAccountInput | PostCreateOrConnectWithoutConnectedAccountInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutConnectedAccountInput | PostUpsertWithWhereUniqueWithoutConnectedAccountInput[]
    createMany?: PostCreateManyConnectedAccountInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutConnectedAccountInput | PostUpdateWithWhereUniqueWithoutConnectedAccountInput[]
    updateMany?: PostUpdateManyWithWhereWithoutConnectedAccountInput | PostUpdateManyWithWhereWithoutConnectedAccountInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutConnectedAccountNestedInput = {
    create?: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput> | PostCreateWithoutConnectedAccountInput[] | PostUncheckedCreateWithoutConnectedAccountInput[]
    connectOrCreate?: PostCreateOrConnectWithoutConnectedAccountInput | PostCreateOrConnectWithoutConnectedAccountInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutConnectedAccountInput | PostUpsertWithWhereUniqueWithoutConnectedAccountInput[]
    createMany?: PostCreateManyConnectedAccountInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutConnectedAccountInput | PostUpdateWithWhereUniqueWithoutConnectedAccountInput[]
    updateMany?: PostUpdateManyWithWhereWithoutConnectedAccountInput | PostUpdateManyWithWhereWithoutConnectedAccountInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPostsInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    connect?: UserWhereUniqueInput
  }

  export type ConnectedAccountCreateNestedOneWithoutPostsInput = {
    create?: XOR<ConnectedAccountCreateWithoutPostsInput, ConnectedAccountUncheckedCreateWithoutPostsInput>
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutPostsInput
    connect?: ConnectedAccountWhereUniqueInput
  }

  export type ScheduleCreateNestedManyWithoutPostInput = {
    create?: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput> | ScheduleCreateWithoutPostInput[] | ScheduleUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ScheduleCreateOrConnectWithoutPostInput | ScheduleCreateOrConnectWithoutPostInput[]
    createMany?: ScheduleCreateManyPostInputEnvelope
    connect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
  }

  export type ScheduleUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput> | ScheduleCreateWithoutPostInput[] | ScheduleUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ScheduleCreateOrConnectWithoutPostInput | ScheduleCreateOrConnectWithoutPostInput[]
    createMany?: ScheduleCreateManyPostInputEnvelope
    connect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
  }

  export type EnumMediaTypeFieldUpdateOperationsInput = {
    set?: $Enums.MediaType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    upsert?: UserUpsertWithoutPostsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPostsInput, UserUpdateWithoutPostsInput>, UserUncheckedUpdateWithoutPostsInput>
  }

  export type ConnectedAccountUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<ConnectedAccountCreateWithoutPostsInput, ConnectedAccountUncheckedCreateWithoutPostsInput>
    connectOrCreate?: ConnectedAccountCreateOrConnectWithoutPostsInput
    upsert?: ConnectedAccountUpsertWithoutPostsInput
    connect?: ConnectedAccountWhereUniqueInput
    update?: XOR<XOR<ConnectedAccountUpdateToOneWithWhereWithoutPostsInput, ConnectedAccountUpdateWithoutPostsInput>, ConnectedAccountUncheckedUpdateWithoutPostsInput>
  }

  export type ScheduleUpdateManyWithoutPostNestedInput = {
    create?: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput> | ScheduleCreateWithoutPostInput[] | ScheduleUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ScheduleCreateOrConnectWithoutPostInput | ScheduleCreateOrConnectWithoutPostInput[]
    upsert?: ScheduleUpsertWithWhereUniqueWithoutPostInput | ScheduleUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: ScheduleCreateManyPostInputEnvelope
    set?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    disconnect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    delete?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    connect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    update?: ScheduleUpdateWithWhereUniqueWithoutPostInput | ScheduleUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: ScheduleUpdateManyWithWhereWithoutPostInput | ScheduleUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: ScheduleScalarWhereInput | ScheduleScalarWhereInput[]
  }

  export type ScheduleUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput> | ScheduleCreateWithoutPostInput[] | ScheduleUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ScheduleCreateOrConnectWithoutPostInput | ScheduleCreateOrConnectWithoutPostInput[]
    upsert?: ScheduleUpsertWithWhereUniqueWithoutPostInput | ScheduleUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: ScheduleCreateManyPostInputEnvelope
    set?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    disconnect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    delete?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    connect?: ScheduleWhereUniqueInput | ScheduleWhereUniqueInput[]
    update?: ScheduleUpdateWithWhereUniqueWithoutPostInput | ScheduleUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: ScheduleUpdateManyWithWhereWithoutPostInput | ScheduleUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: ScheduleScalarWhereInput | ScheduleScalarWhereInput[]
  }

  export type PostCreateNestedOneWithoutSchedulesInput = {
    create?: XOR<PostCreateWithoutSchedulesInput, PostUncheckedCreateWithoutSchedulesInput>
    connectOrCreate?: PostCreateOrConnectWithoutSchedulesInput
    connect?: PostWhereUniqueInput
  }

  export type EnumScheduleStatusFieldUpdateOperationsInput = {
    set?: $Enums.ScheduleStatus
  }

  export type PostUpdateOneRequiredWithoutSchedulesNestedInput = {
    create?: XOR<PostCreateWithoutSchedulesInput, PostUncheckedCreateWithoutSchedulesInput>
    connectOrCreate?: PostCreateOrConnectWithoutSchedulesInput
    upsert?: PostUpsertWithoutSchedulesInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutSchedulesInput, PostUpdateWithoutSchedulesInput>, PostUncheckedUpdateWithoutSchedulesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumMediaTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeFilter<$PrismaModel> | $Enums.MediaType
  }

  export type NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel> | $Enums.MediaType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaTypeFilter<$PrismaModel>
    _max?: NestedEnumMediaTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumScheduleStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleStatus | EnumScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumScheduleStatusFilter<$PrismaModel> | $Enums.ScheduleStatus
  }

  export type NestedEnumScheduleStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleStatus | EnumScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScheduleStatus[] | ListEnumScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumScheduleStatusWithAggregatesFilter<$PrismaModel> | $Enums.ScheduleStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumScheduleStatusFilter<$PrismaModel>
    _max?: NestedEnumScheduleStatusFilter<$PrismaModel>
  }

  export type PostCreateWithoutUserInput = {
    id?: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    connectedAccount: ConnectedAccountCreateNestedOneWithoutPostsInput
    schedules?: ScheduleCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutUserInput = {
    id?: string
    connectedAccountId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    schedules?: ScheduleUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutUserInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput>
  }

  export type PostCreateManyUserInputEnvelope = {
    data: PostCreateManyUserInput | PostCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ConnectedAccountCreateWithoutUserInput = {
    id?: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
    posts?: PostCreateNestedManyWithoutConnectedAccountInput
  }

  export type ConnectedAccountUncheckedCreateWithoutUserInput = {
    id?: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
    posts?: PostUncheckedCreateNestedManyWithoutConnectedAccountInput
  }

  export type ConnectedAccountCreateOrConnectWithoutUserInput = {
    where: ConnectedAccountWhereUniqueInput
    create: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput>
  }

  export type ConnectedAccountCreateManyUserInputEnvelope = {
    data: ConnectedAccountCreateManyUserInput | ConnectedAccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PostUpsertWithWhereUniqueWithoutUserInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutUserInput, PostUncheckedUpdateWithoutUserInput>
    create: XOR<PostCreateWithoutUserInput, PostUncheckedCreateWithoutUserInput>
  }

  export type PostUpdateWithWhereUniqueWithoutUserInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutUserInput, PostUncheckedUpdateWithoutUserInput>
  }

  export type PostUpdateManyWithWhereWithoutUserInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutUserInput>
  }

  export type PostScalarWhereInput = {
    AND?: PostScalarWhereInput | PostScalarWhereInput[]
    OR?: PostScalarWhereInput[]
    NOT?: PostScalarWhereInput | PostScalarWhereInput[]
    id?: StringFilter<"Post"> | string
    userId?: StringFilter<"Post"> | string
    connectedAccountId?: StringFilter<"Post"> | string
    caption?: StringNullableFilter<"Post"> | string | null
    imageUrl?: StringFilter<"Post"> | string
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    instagramMediaId?: StringNullableFilter<"Post"> | string | null
    views?: IntFilter<"Post"> | number
    reach?: IntFilter<"Post"> | number
    saves?: IntFilter<"Post"> | number
    createdAt?: DateTimeFilter<"Post"> | Date | string
  }

  export type ConnectedAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: ConnectedAccountWhereUniqueInput
    update: XOR<ConnectedAccountUpdateWithoutUserInput, ConnectedAccountUncheckedUpdateWithoutUserInput>
    create: XOR<ConnectedAccountCreateWithoutUserInput, ConnectedAccountUncheckedCreateWithoutUserInput>
  }

  export type ConnectedAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: ConnectedAccountWhereUniqueInput
    data: XOR<ConnectedAccountUpdateWithoutUserInput, ConnectedAccountUncheckedUpdateWithoutUserInput>
  }

  export type ConnectedAccountUpdateManyWithWhereWithoutUserInput = {
    where: ConnectedAccountScalarWhereInput
    data: XOR<ConnectedAccountUpdateManyMutationInput, ConnectedAccountUncheckedUpdateManyWithoutUserInput>
  }

  export type ConnectedAccountScalarWhereInput = {
    AND?: ConnectedAccountScalarWhereInput | ConnectedAccountScalarWhereInput[]
    OR?: ConnectedAccountScalarWhereInput[]
    NOT?: ConnectedAccountScalarWhereInput | ConnectedAccountScalarWhereInput[]
    id?: StringFilter<"ConnectedAccount"> | string
    userId?: StringFilter<"ConnectedAccount"> | string
    facebookUserId?: StringFilter<"ConnectedAccount"> | string
    pageId?: StringFilter<"ConnectedAccount"> | string
    username?: StringNullableFilter<"ConnectedAccount"> | string | null
    profilePictureUrl?: StringNullableFilter<"ConnectedAccount"> | string | null
    pageAccessToken?: StringFilter<"ConnectedAccount"> | string
    instagramBusinessId?: StringFilter<"ConnectedAccount"> | string
    longLivedUserToken?: StringFilter<"ConnectedAccount"> | string
    tokenExpiry?: DateTimeFilter<"ConnectedAccount"> | Date | string
    createdAt?: DateTimeFilter<"ConnectedAccount"> | Date | string
  }

  export type UserCreateWithoutConnectedAccountsInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    posts?: PostCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutConnectedAccountsInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    posts?: PostUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutConnectedAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutConnectedAccountsInput, UserUncheckedCreateWithoutConnectedAccountsInput>
  }

  export type PostCreateWithoutConnectedAccountInput = {
    id?: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPostsInput
    schedules?: ScheduleCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutConnectedAccountInput = {
    id?: string
    userId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    schedules?: ScheduleUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutConnectedAccountInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput>
  }

  export type PostCreateManyConnectedAccountInputEnvelope = {
    data: PostCreateManyConnectedAccountInput | PostCreateManyConnectedAccountInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutConnectedAccountsInput = {
    update: XOR<UserUpdateWithoutConnectedAccountsInput, UserUncheckedUpdateWithoutConnectedAccountsInput>
    create: XOR<UserCreateWithoutConnectedAccountsInput, UserUncheckedCreateWithoutConnectedAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutConnectedAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutConnectedAccountsInput, UserUncheckedUpdateWithoutConnectedAccountsInput>
  }

  export type UserUpdateWithoutConnectedAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutConnectedAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PostUpsertWithWhereUniqueWithoutConnectedAccountInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutConnectedAccountInput, PostUncheckedUpdateWithoutConnectedAccountInput>
    create: XOR<PostCreateWithoutConnectedAccountInput, PostUncheckedCreateWithoutConnectedAccountInput>
  }

  export type PostUpdateWithWhereUniqueWithoutConnectedAccountInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutConnectedAccountInput, PostUncheckedUpdateWithoutConnectedAccountInput>
  }

  export type PostUpdateManyWithWhereWithoutConnectedAccountInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutConnectedAccountInput>
  }

  export type UserCreateWithoutPostsInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    connectedAccounts?: ConnectedAccountCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPostsInput = {
    id?: string
    name?: string | null
    email: string
    password_hash?: string | null
    createdAt?: Date | string
    connectedAccounts?: ConnectedAccountUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPostsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
  }

  export type ConnectedAccountCreateWithoutPostsInput = {
    id?: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutConnectedAccountsInput
  }

  export type ConnectedAccountUncheckedCreateWithoutPostsInput = {
    id?: string
    userId: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
  }

  export type ConnectedAccountCreateOrConnectWithoutPostsInput = {
    where: ConnectedAccountWhereUniqueInput
    create: XOR<ConnectedAccountCreateWithoutPostsInput, ConnectedAccountUncheckedCreateWithoutPostsInput>
  }

  export type ScheduleCreateWithoutPostInput = {
    id?: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
  }

  export type ScheduleUncheckedCreateWithoutPostInput = {
    id?: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
  }

  export type ScheduleCreateOrConnectWithoutPostInput = {
    where: ScheduleWhereUniqueInput
    create: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput>
  }

  export type ScheduleCreateManyPostInputEnvelope = {
    data: ScheduleCreateManyPostInput | ScheduleCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutPostsInput = {
    update: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPostsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
  }

  export type UserUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectedAccounts?: ConnectedAccountUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectedAccounts?: ConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ConnectedAccountUpsertWithoutPostsInput = {
    update: XOR<ConnectedAccountUpdateWithoutPostsInput, ConnectedAccountUncheckedUpdateWithoutPostsInput>
    create: XOR<ConnectedAccountCreateWithoutPostsInput, ConnectedAccountUncheckedCreateWithoutPostsInput>
    where?: ConnectedAccountWhereInput
  }

  export type ConnectedAccountUpdateToOneWithWhereWithoutPostsInput = {
    where?: ConnectedAccountWhereInput
    data: XOR<ConnectedAccountUpdateWithoutPostsInput, ConnectedAccountUncheckedUpdateWithoutPostsInput>
  }

  export type ConnectedAccountUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutConnectedAccountsNestedInput
  }

  export type ConnectedAccountUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleUpsertWithWhereUniqueWithoutPostInput = {
    where: ScheduleWhereUniqueInput
    update: XOR<ScheduleUpdateWithoutPostInput, ScheduleUncheckedUpdateWithoutPostInput>
    create: XOR<ScheduleCreateWithoutPostInput, ScheduleUncheckedCreateWithoutPostInput>
  }

  export type ScheduleUpdateWithWhereUniqueWithoutPostInput = {
    where: ScheduleWhereUniqueInput
    data: XOR<ScheduleUpdateWithoutPostInput, ScheduleUncheckedUpdateWithoutPostInput>
  }

  export type ScheduleUpdateManyWithWhereWithoutPostInput = {
    where: ScheduleScalarWhereInput
    data: XOR<ScheduleUpdateManyMutationInput, ScheduleUncheckedUpdateManyWithoutPostInput>
  }

  export type ScheduleScalarWhereInput = {
    AND?: ScheduleScalarWhereInput | ScheduleScalarWhereInput[]
    OR?: ScheduleScalarWhereInput[]
    NOT?: ScheduleScalarWhereInput | ScheduleScalarWhereInput[]
    id?: StringFilter<"Schedule"> | string
    postId?: StringFilter<"Schedule"> | string
    scheduledFor?: DateTimeFilter<"Schedule"> | Date | string
    status?: EnumScheduleStatusFilter<"Schedule"> | $Enums.ScheduleStatus
    createdAt?: DateTimeFilter<"Schedule"> | Date | string
  }

  export type PostCreateWithoutSchedulesInput = {
    id?: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPostsInput
    connectedAccount: ConnectedAccountCreateNestedOneWithoutPostsInput
  }

  export type PostUncheckedCreateWithoutSchedulesInput = {
    id?: string
    userId: string
    connectedAccountId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
  }

  export type PostCreateOrConnectWithoutSchedulesInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutSchedulesInput, PostUncheckedCreateWithoutSchedulesInput>
  }

  export type PostUpsertWithoutSchedulesInput = {
    update: XOR<PostUpdateWithoutSchedulesInput, PostUncheckedUpdateWithoutSchedulesInput>
    create: XOR<PostCreateWithoutSchedulesInput, PostUncheckedCreateWithoutSchedulesInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutSchedulesInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutSchedulesInput, PostUncheckedUpdateWithoutSchedulesInput>
  }

  export type PostUpdateWithoutSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPostsNestedInput
    connectedAccount?: ConnectedAccountUpdateOneRequiredWithoutPostsNestedInput
  }

  export type PostUncheckedUpdateWithoutSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    connectedAccountId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateManyUserInput = {
    id?: string
    connectedAccountId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
  }

  export type ConnectedAccountCreateManyUserInput = {
    id?: string
    facebookUserId: string
    pageId: string
    username?: string | null
    profilePictureUrl?: string | null
    pageAccessToken: string
    instagramBusinessId: string
    longLivedUserToken: string
    tokenExpiry: Date | string
    createdAt?: Date | string
  }

  export type PostUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectedAccount?: ConnectedAccountUpdateOneRequiredWithoutPostsNestedInput
    schedules?: ScheduleUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectedAccountId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedules?: ScheduleUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectedAccountId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConnectedAccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUpdateManyWithoutConnectedAccountNestedInput
  }

  export type ConnectedAccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUncheckedUpdateManyWithoutConnectedAccountNestedInput
  }

  export type ConnectedAccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    facebookUserId?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    profilePictureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    pageAccessToken?: StringFieldUpdateOperationsInput | string
    instagramBusinessId?: StringFieldUpdateOperationsInput | string
    longLivedUserToken?: StringFieldUpdateOperationsInput | string
    tokenExpiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateManyConnectedAccountInput = {
    id?: string
    userId: string
    caption?: string | null
    imageUrl: string
    mediaType?: $Enums.MediaType
    instagramMediaId?: string | null
    views?: number
    reach?: number
    saves?: number
    createdAt?: Date | string
  }

  export type PostUpdateWithoutConnectedAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPostsNestedInput
    schedules?: ScheduleUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutConnectedAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedules?: ScheduleUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutConnectedAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    instagramMediaId?: NullableStringFieldUpdateOperationsInput | string | null
    views?: IntFieldUpdateOperationsInput | number
    reach?: IntFieldUpdateOperationsInput | number
    saves?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleCreateManyPostInput = {
    id?: string
    scheduledFor: Date | string
    status?: $Enums.ScheduleStatus
    createdAt?: Date | string
  }

  export type ScheduleUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScheduleUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    scheduledFor?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumScheduleStatusFieldUpdateOperationsInput | $Enums.ScheduleStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}