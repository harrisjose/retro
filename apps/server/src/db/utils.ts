import { sql, type RawBuilder } from "kysely";

export function asUuid(val: string): RawBuilder<string> {
  return sql`${val}::uuid`;
}
