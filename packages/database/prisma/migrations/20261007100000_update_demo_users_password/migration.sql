-- Update default seed users' passwords to strengthened production password
UPDATE "users"
SET "passwordHash" = '$2b$10$ZPmBojm41eLr5KiEXZkdpuvcXhD7POqSM6S3CQi2u7vCUpwXSKNXS'
WHERE "email" IN (
  'admin@demo.test',
  'teacher@demo.test',
  'parent@demo.test',
  'superadmin@demo.test'
);
