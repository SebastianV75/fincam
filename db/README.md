# Database Setup

These files define the first Fincam database shape for InsForge.

Files:

- `schema.sql`: initial tables, indexes, and updated_at triggers
- `seed.sql`: optional sample records for one development user

## Notes

- This schema is intentionally small and focused on the MVP.
- It assumes InsForge authentication users live in `auth.users`.
- It does not add Row Level Security policies yet.
- We should add RLS after we wire the first auth flow and confirm the exact user-access pattern we want.

## Suggested order

1. run `schema.sql`
2. create or identify one development user in InsForge Auth
3. run `seed.sql` with that user's UUID
4. connect the Home and Quincena screens to live queries
