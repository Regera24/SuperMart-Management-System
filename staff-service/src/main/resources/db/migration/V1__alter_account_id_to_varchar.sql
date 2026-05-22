-- 1. Migrate account_id column from BIGINT to VARCHAR(255) to support UUID format
ALTER TABLE employees MODIFY COLUMN account_id VARCHAR(255);

-- 2. Update existing employee records to use UUID account_ids from identity-service
UPDATE employees SET account_id = '550e8400-e29b-41d4-a716-446655440001' WHERE id = 1;
UPDATE employees SET account_id = '550e8400-e29b-41d4-a716-446655440002' WHERE id = 2;
UPDATE employees SET account_id = '550e8400-e29b-41d4-a716-446655440003' WHERE id = 3;
UPDATE employees SET account_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = 4;
UPDATE employees SET account_id = '550e8400-e29b-41d4-a716-446655440005' WHERE id = 5;
