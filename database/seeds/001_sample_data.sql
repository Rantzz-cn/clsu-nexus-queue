-- CLSU NEXUS Sample Data
-- Run this after creating all tables to populate with test data

-- ============================================
-- 1. SAMPLE USERS
-- ============================================
INSERT INTO users (
    student_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone_number,
    role,
    is_active
)
VALUES
    ('2025-00123', 'student1@clsu.edu.ph', '$2b$10$examplehashedpassword1', 'Juan', 'Dela Cruz', '09171234567', 'student', true),
    ('2025-00234', 'student2@clsu.edu.ph', '$2b$10$examplehashedpassword2', 'Maria', 'Santos', '09172345678', 'student', true),
    ('CS-STAFF-01', 'staff1@clsu.edu.ph', '$2b$10$examplehashedpassword3', 'Pedro', 'Reyes', '09181234567', 'counter_staff', true),
    ('CS-STAFF-02', 'staff2@clsu.edu.ph', '$2b$10$examplehashedpassword4', 'Anna', 'Garcia', '09182345678', 'counter_staff', true),
    ('ADMIN-001', 'admin@clsu.edu.ph', '$2b$10$examplehashedpassword5', 'System', 'Admin', '09991234567', 'admin', true);

-- ============================================
-- 2. SAMPLE SERVICES
-- ============================================
INSERT INTO services (
    name,
    description,
    location,
    estimated_service_time,
    max_queue_size,
    operating_hours_start,
    operating_hours_end
)
VALUES
    ('Registrar', 'Enrollment and transcript services', 'Administration Building, Ground Floor', 10, 100, '08:00:00', '17:00:00'),
    ('Cashier', 'Tuition and fee payments', 'Administration Building, Ground Floor', 5, 100, '08:00:00', '16:00:00'),
    ('Library', 'Book requests and inquiries', 'Library Building, 2nd Floor', 3, 50, '08:00:00', '20:00:00'),
    ('Clinic', 'Medical appointments and health services', 'Health Services Building', 15, 30, '08:00:00', '17:00:00'),
    ('Guidance', 'Counseling services and student support', 'Student Services Building, 1st Floor', 20, 20, '08:00:00', '17:00:00');

-- ============================================
-- 3. SAMPLE COUNTERS
-- ============================================
-- Registrar Counters
INSERT INTO counters (service_id, counter_number, name, status, is_active)
VALUES
    (1, '1', 'Registrar Counter 1', 'open', true),
    (1, '2', 'Registrar Counter 2', 'open', true);

-- Cashier Counters
INSERT INTO counters (service_id, counter_number, name, status, is_active)
VALUES
    (2, '1', 'Cashier Counter 1', 'open', true),
    (2, '2', 'Cashier Counter 2', 'open', true);

-- Library Counter
INSERT INTO counters (service_id, counter_number, name, status, is_active)
VALUES
    (3, '1', 'Library Counter 1', 'open', true);

-- Clinic Counter
INSERT INTO counters (service_id, counter_number, name, status, is_active)
VALUES
    (4, '1', 'Clinic Counter 1', 'open', true);

-- Guidance Counter
INSERT INTO counters (service_id, counter_number, name, status, is_active)
VALUES
    (5, '1', 'Guidance Counter 1', 'open', true);

-- ============================================
-- 4. SAMPLE COUNTER STAFF ASSIGNMENTS
-- ============================================
-- Assign staff to counters (using user IDs 3 and 4 which are counter_staff)
INSERT INTO counter_staff (user_id, counter_id, is_primary)
VALUES
    (3, 1, true),  -- Staff 1 to Registrar Counter 1
    (3, 3, false), -- Staff 1 also to Cashier Counter 1
    (4, 2, true),  -- Staff 2 to Registrar Counter 2
    (4, 4, true);  -- Staff 2 to Cashier Counter 2

-- ============================================
-- 5. SAMPLE SERVICE SETTINGS
-- ============================================
INSERT INTO service_settings (
    service_id,
    enable_priority_queue,
    max_queue_before_closing,
    auto_call_next,
    notification_before_minutes
)
VALUES
    (1, false, 50, false, 5),  -- Registrar
    (2, false, 50, false, 3),  -- Cashier
    (3, false, 30, false, 2),  -- Library
    (4, true, 20, false, 10),  -- Clinic (priority queue enabled)
    (5, false, 15, false, 10); -- Guidance

-- Note: Queue entries, queue logs, and notifications will be created
-- when users actually use the system, so no sample data needed here.
