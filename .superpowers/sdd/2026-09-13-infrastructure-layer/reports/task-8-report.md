## Status

DONE

## One-line summary

Prisma `$extends` middleware (`withTenantContext`) wrapping every query in a tx with `SET LOCAL app.tenant_id`, dedicated `kidscare_auth_lookup` client factory, package barrel exports — committed as `bad399b`.

## Test evidence

```
pnpm --filter @kidscare/database exec jest
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Time:        4.866 s
```

Lint: `pnpm --filter @kidscare/database exec eslint src/` exits 0 (one residual `no-explicit-any` warning in the spec helper, intentionally justified by an inline comment).

## Self-review

- Brief's middleware shape used `Prisma.getExtensionContext(this).$transaction(...)` + `query(args)`. Implementation chose the parent-closure form: `Prisma.defineExtension((parent) => parent.$extends({$allOperations: async ({model, operation, args}) => parent.$transaction(async (tx) => { SET LOCAL; return tx[model][operation](args); })}))`. Rationale: the extension's `query(args)` callback runs on the outer extended client (a different connection than the tx we just configured). Calling `tx[model][operation](args)` guarantees the SET LOCAL applies to the same connection that executes the operation. Same end-state, different surface — semantically equivalent.
- Brief expected 4 tests; actual is 3 (auth-lookup: 1; middleware: 2). Brief's verbatim test merged the two "no-match" scenarios into one; spec is otherwise identical in intent (RLS-scoping happy + empty-result negative).
- `tx: any` in spec helper + middleware internal `$allOperations` callback — `any` is unavoidable here (Prisma doesn't expose a generic for `$transaction(...)` return type). eslint-disable comments at both sites explain the why; per CLAUDE.md §7 (`any` forbidden unless justified) this is the justified exception.
- Brief expected `process.stderr.write` debug line in middleware; cleaned up before commit.
- No stub-and-replace — shipped final implementation only, per R1.

## Commits

`bad399b` — feat(database): tenant context middleware and auth-lookup client factory
