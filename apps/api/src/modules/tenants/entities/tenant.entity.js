/**
 * Domain entity for a Tenant. Thin wrapper over the Prisma model with
 * a `fromPrisma` factory. Adding computed fields or invariants later
 * (e.g. `isSuspended()`, `canAcceptNewUsers()`) belongs here.
 */
export class Tenant {
    id;
    slug;
    name;
    status;
    createdAt;
    updatedAt;
    constructor(id, slug, name, status, createdAt, updatedAt) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromPrisma(p) {
        return new Tenant(p.id, p.slug, p.name, p.status, p.createdAt, p.updatedAt);
    }
}
