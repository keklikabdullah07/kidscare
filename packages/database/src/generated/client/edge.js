Object.defineProperty(exports, '__esModule', { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
} = require('./runtime/edge.js');

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: '5.22.0',
  engine: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
};

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError;
Prisma.PrismaClientInitializationError = PrismaClientInitializationError;
Prisma.PrismaClientValidationError = PrismaClientValidationError;
Prisma.NotFoundError = NotFoundError;
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag;
Prisma.empty = empty;
Prisma.join = join;
Prisma.raw = raw;
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = Extensions.getExtensionContext;
Prisma.defineExtension = Extensions.defineExtension;

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  firstName: 'firstName',
  lastName: 'lastName',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  notes: 'notes',
  passport: 'passport',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
};

exports.Prisma.DailyReportScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  studentId: 'studentId',
  date: 'date',
  mood: 'mood',
  meals: 'meals',
  naps: 'naps',
  potty: 'potty',
  activities: 'activities',
  medications: 'medications',
  teacherNote: 'teacherNote',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  studentId: 'studentId',
  date: 'date',
  status: 'status',
  checkInTime: 'checkInTime',
  checkInBy: 'checkInBy',
  checkOutTime: 'checkOutTime',
  checkOutBy: 'checkOutBy',
  pickupContactId: 'pickupContactId',
  pickupNote: 'pickupNote',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.DailyMenuScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  date: 'date',
  breakfast: 'breakfast',
  lunch: 'lunch',
  snack: 'snack',
  allergens: 'allergens',
  calories: 'calories',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc',
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive',
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last',
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull,
};
exports.TenantStatus = exports.$Enums.TenantStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
};

exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  Student: 'Student',
  DailyReport: 'DailyReport',
  Attendance: 'Attendance',
  DailyMenu: 'DailyMenu',
};
/**
 * Create the Client
 */
const config = {
  generator: {
    name: 'client',
    provider: {
      fromEnvVar: null,
      value: 'prisma-client-js',
    },
    output: {
      value: 'C:\\Users\\Partridge\\Desktop\\KidsCare\\packages\\database\\src\\generated\\client',
      fromEnvVar: null,
    },
    config: {
      engineType: 'library',
    },
    binaryTargets: [
      {
        fromEnvVar: null,
        value: 'windows',
        native: true,
      },
    ],
    previewFeatures: [],
    sourceFilePath:
      'C:\\Users\\Partridge\\Desktop\\KidsCare\\packages\\database\\prisma\\schema.prisma',
    isCustomOutput: true,
  },
  relativeEnvPaths: {
    rootEnvPath: null,
    schemaEnvPath: '../../../.env',
  },
  relativePath: '../../../prisma',
  clientVersion: '5.22.0',
  engineVersion: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
  datasourceNames: ['db'],
  activeProvider: 'postgresql',
  postinstall: false,
  inlineDatasources: {
    db: {
      url: {
        fromEnvVar: 'DATABASE_URL',
        value: null,
      },
    },
  },
  inlineSchema:
    'generator client {\n  provider = "prisma-client-js"\n  output   = "../src/generated/client"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nenum UserRole {\n  ADMIN\n  TEACHER\n  PARENT\n}\n\nenum TenantStatus {\n  ACTIVE\n  SUSPENDED\n  DELETED\n}\n\nmodel Tenant {\n  id        String       @id @default(cuid())\n  slug      String       @unique\n  name      String\n  status    TenantStatus @default(ACTIVE)\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n\n  users        User[]\n  students     Student[]\n  dailyReports DailyReport[]\n  attendances  Attendance[]\n  dailyMenus   DailyMenu[]\n\n  @@map("tenants")\n}\n\nmodel User {\n  id           String    @id @default(cuid())\n  tenantId     String\n  email        String\n  passwordHash String\n  role         UserRole\n  isActive     Boolean   @default(true)\n  lastLoginAt  DateTime?\n  createdAt    DateTime  @default(now())\n  updatedAt    DateTime  @updatedAt\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  @@unique([tenantId, email])\n  @@index([tenantId])\n  @@map("users")\n}\n\nmodel Student {\n  id          String    @id @default(cuid())\n  tenantId    String\n  firstName   String\n  lastName    String\n  dateOfBirth DateTime\n  gender      String?\n  notes       String?\n  passport    Json?     @default("{}")\n  isActive    Boolean   @default(true)\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n  deletedAt   DateTime?\n\n  tenant       Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n  dailyReports DailyReport[]\n  attendances  Attendance[]\n\n  @@index([tenantId])\n  @@index([tenantId, deletedAt])\n  @@map("students")\n}\n\nmodel DailyReport {\n  id          String   @id @default(cuid())\n  tenantId    String\n  studentId   String\n  date        DateTime @db.Date\n  mood        String?\n  meals       Json?    @default("{}")\n  naps        Json?    @default("{}")\n  potty       Json?    @default("[]")\n  activities  Json?    @default("[]")\n  medications Json?    @default("[]")\n  teacherNote String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  @@unique([tenantId, studentId, date])\n  @@index([tenantId, date])\n  @@index([tenantId, studentId])\n  @@map("daily_reports")\n}\n\nmodel Attendance {\n  id              String   @id @default(cuid())\n  tenantId        String\n  studentId       String\n  date            DateTime @db.Date\n  status          String   @default("ABSENT") // PRESENT, ABSENT, EXCUSED, LEFT\n  checkInTime     String? // HH:mm\n  checkInBy       String?\n  checkOutTime    String? // HH:mm\n  checkOutBy      String?\n  pickupContactId String?\n  pickupNote      String?\n  note            String?\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n\n  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  @@unique([tenantId, studentId, date])\n  @@index([tenantId, date])\n  @@index([tenantId, studentId])\n  @@map("attendances")\n}\n\nmodel DailyMenu {\n  id        String   @id @default(cuid())\n  tenantId  String\n  date      DateTime @db.Date\n  breakfast Json     @default("[]")\n  lunch     Json     @default("[]")\n  snack     Json     @default("[]")\n  allergens Json     @default("[]")\n  calories  Int?\n  notes     String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  @@unique([tenantId, date])\n  @@index([tenantId, date])\n  @@map("daily_menus")\n}\n',
  inlineSchemaHash: '065791b989309e7ccd6f9afd4184b24858a716d90511f1cefc3881241b6870c0',
  copyEngine: false,
};
config.dirname = '/';

config.runtimeDataModel = JSON.parse(
  '{"models":{"Tenant":{"dbName":"tenants","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"TenantStatus","default":"ACTIVE","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"users","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"TenantToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"students","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Student","relationName":"StudentToTenant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyReports","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyReport","relationName":"DailyReportToTenant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"attendances","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Attendance","relationName":"AttendanceToTenant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyMenus","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyMenu","relationName":"DailyMenuToTenant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"User":{"dbName":"users","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"tenantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"passwordHash","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"role","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"UserRole","isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"lastLoginAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"tenant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tenant","relationName":"TenantToUser","relationFromFields":["tenantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["tenantId","email"]],"uniqueIndexes":[{"name":null,"fields":["tenantId","email"]}],"isGenerated":false},"Student":{"dbName":"students","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"tenantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"dateOfBirth","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"gender","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"notes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"passport","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"{}","isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"tenant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tenant","relationName":"StudentToTenant","relationFromFields":["tenantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"dailyReports","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyReport","relationName":"DailyReportToStudent","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"attendances","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Attendance","relationName":"AttendanceToStudent","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"DailyReport":{"dbName":"daily_reports","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"tenantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"mood","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"meals","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"{}","isGenerated":false,"isUpdatedAt":false},{"name":"naps","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"{}","isGenerated":false,"isUpdatedAt":false},{"name":"potty","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"activities","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"medications","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"teacherNote","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"tenant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tenant","relationName":"DailyReportToTenant","relationFromFields":["tenantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Student","relationName":"DailyReportToStudent","relationFromFields":["studentId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["tenantId","studentId","date"]],"uniqueIndexes":[{"name":null,"fields":["tenantId","studentId","date"]}],"isGenerated":false},"Attendance":{"dbName":"attendances","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"tenantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"ABSENT","isGenerated":false,"isUpdatedAt":false},{"name":"checkInTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"checkInBy","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"checkOutTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"checkOutBy","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"pickupContactId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"pickupNote","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"note","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"tenant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tenant","relationName":"AttendanceToTenant","relationFromFields":["tenantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Student","relationName":"AttendanceToStudent","relationFromFields":["studentId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["tenantId","studentId","date"]],"uniqueIndexes":[{"name":null,"fields":["tenantId","studentId","date"]}],"isGenerated":false},"DailyMenu":{"dbName":"daily_menus","fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"tenantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"breakfast","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"lunch","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"snack","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"allergens","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Json","default":"[]","isGenerated":false,"isUpdatedAt":false},{"name":"calories","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"notes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"tenant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tenant","relationName":"DailyMenuToTenant","relationFromFields":["tenantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["tenantId","date"]],"uniqueIndexes":[{"name":null,"fields":["tenantId","date"]}],"isGenerated":false}},"enums":{"UserRole":{"values":[{"name":"ADMIN","dbName":null},{"name":"TEACHER","dbName":null},{"name":"PARENT","dbName":null}],"dbName":null},"TenantStatus":{"values":[{"name":"ACTIVE","dbName":null},{"name":"SUSPENDED","dbName":null},{"name":"DELETED","dbName":null}],"dbName":null}},"types":{}}',
);
defineDmmfProperty(exports.Prisma, config.runtimeDataModel);
config.engineWasm = undefined;

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL:
      (typeof globalThis !== 'undefined' && globalThis['DATABASE_URL']) ||
      (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) ||
      undefined,
  },
});

if (
  (typeof globalThis !== 'undefined' && globalThis['DEBUG']) ||
  (typeof process !== 'undefined' && process.env && process.env.DEBUG) ||
  undefined
) {
  Debug.enable(
    (typeof globalThis !== 'undefined' && globalThis['DEBUG']) ||
      (typeof process !== 'undefined' && process.env && process.env.DEBUG) ||
      undefined,
  );
}

const PrismaClient = getPrismaClient(config);
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
