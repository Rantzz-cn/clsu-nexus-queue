-- Assign counters to stafftest@clsu.edu.ph user
-- Run this in pgAdmin Query Tool

-- First, find the user ID for stafftest@clsu.edu.ph
-- Then assign counters to that user

-- Assign stafftest user to all counters (you can modify this as needed)
INSERT INTO counter_staff (user_id, counter_id, is_primary)
SELECT 
    u.id as user_id,
    c.id as counter_id,
    CASE WHEN c.counter_number = '1' THEN true ELSE false END as is_primary
FROM users u
CROSS JOIN counters c
WHERE u.email = 'stafftest@clsu.edu.ph'
  AND c.is_active = true
ON CONFLICT (user_id, counter_id) DO NOTHING;

-- Verify the assignments
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    c.name as counter_name,
    s.name as service_name,
    cs.is_primary
FROM counter_staff cs
JOIN users u ON cs.user_id = u.id
JOIN counters c ON cs.counter_id = c.id
JOIN services s ON c.service_id = s.id
WHERE u.email = 'stafftest@clsu.edu.ph';

