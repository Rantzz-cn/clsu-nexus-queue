# CLSU NEXUS - Database Schema Documentation

## Overview

This document describes the database schema for the CLSU NEXUS Smart Queue Management System. The schema is designed to support multi-service queuing, real-time updates, user management, and comprehensive analytics.

## Database: PostgreSQL

## Entity Relationship Diagram

```
Users ──┬── QueueEntries
        │
        ├── CounterStaff
        │
        └── Notifications

Services ──┬── Counters
           │
           └── QueueEntries

Counters ──┬── CounterStaff
           │
           └── QueueLogs

QueueEntries ── QueueLogs
```

## Tables

### 1. users

Stores all system users (students, staff, admins).

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE,  -- CLSU student ID
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'student',  -- student, counter_staff, admin
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_role CHECK (role IN ('student', 'counter_staff', 'admin'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
```

### 2. services

Stores different service types (Registrar, Cashier, Library, etc.).

```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    estimated_service_time INTEGER DEFAULT 5,  -- in minutes
    max_queue_size INTEGER DEFAULT 100,
    operating_hours_start TIME,
    operating_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_is_active ON services(is_active);
```

### 3. counters

Stores service counters for each service.

```sql
CREATE TABLE counters (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    counter_number VARCHAR(10) NOT NULL,  -- Counter 1, Counter 2, etc.
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'closed',  -- open, busy, closed, break
    current_serving_queue_id INTEGER REFERENCES queue_entries(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_counter_status CHECK (status IN ('open', 'busy', 'closed', 'break')),
    CONSTRAINT unique_counter_per_service UNIQUE (service_id, counter_number)
);

CREATE INDEX idx_counters_service_id ON counters(service_id);
CREATE INDEX idx_counters_status ON counters(status);
```

### 4. queue_entries

Stores queue number entries and their status.

```sql
CREATE TABLE queue_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    counter_id INTEGER REFERENCES counters(id),
    queue_number VARCHAR(20) NOT NULL,  -- Format: SRV-001, CSH-045, etc.
    queue_position INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',  -- waiting, called, serving, completed, skipped, cancelled
    estimated_wait_time INTEGER,  -- in minutes
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP,
    started_serving_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT chk_queue_status CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'skipped', 'cancelled'))
);

CREATE INDEX idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX idx_queue_entries_service_id ON queue_entries(service_id);
CREATE INDEX idx_queue_entries_counter_id ON queue_entries(counter_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_requested_at ON queue_entries(requested_at);
CREATE INDEX idx_queue_entries_queue_number ON queue_entries(queue_number);
```

### 5. queue_logs

Historical log of all queue activities for analytics.

```sql
CREATE TABLE queue_logs (
    id SERIAL PRIMARY KEY,
    queue_entry_id INTEGER NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id),
    counter_id INTEGER REFERENCES counters(id),
    action VARCHAR(50) NOT NULL,  -- created, called, started, completed, skipped, cancelled
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    metadata JSONB  -- Additional data in JSON format
);

CREATE INDEX idx_queue_logs_queue_entry_id ON queue_logs(queue_entry_id);
CREATE INDEX idx_queue_logs_service_id ON queue_logs(service_id);
CREATE INDEX idx_queue_logs_action_timestamp ON queue_logs(action_timestamp);
CREATE INDEX idx_queue_logs_action ON queue_logs(action);
```

### 6. counter_staff

Links staff members to counters they can operate.

```sql
CREATE TABLE counter_staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counter_id INTEGER NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_staff_counter UNIQUE (user_id, counter_id)
);

CREATE INDEX idx_counter_staff_user_id ON counter_staff(user_id);
CREATE INDEX idx_counter_staff_counter_id ON counter_staff(counter_id);
```

### 7. notifications

Stores notification records for users.

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_entry_id INTEGER REFERENCES queue_entries(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,  -- queue_ready, approaching, called, general
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    CONSTRAINT chk_notification_type CHECK (type IN ('queue_ready', 'approaching', 'called', 'general', 'system'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_notifications_queue_entry_id ON notifications(queue_entry_id);
```

### 8. service_settings

Stores configuration settings for each service.

```sql
CREATE TABLE service_settings (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL UNIQUE REFERENCES services(id) ON DELETE CASCADE,
    enable_priority_queue BOOLEAN DEFAULT false,
    max_queue_before_closing INTEGER DEFAULT 50,
    auto_call_next BOOLEAN DEFAULT false,
    notification_before_minutes INTEGER DEFAULT 5,
    settings JSONB,  -- Additional flexible settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_settings_service_id ON service_settings(service_id);
```

### 9. queue_statistics (Materialized View)

Pre-calculated statistics for faster reporting.

```sql
CREATE MATERIALIZED VIEW queue_statistics AS
SELECT 
    service_id,
    DATE(requested_at) as queue_date,
    COUNT(*) as total_queues,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_queues,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_queues,
    AVG(EXTRACT(EPOCH FROM (completed_at - requested_at))/60) as avg_wait_time_minutes,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_serving_at))/60) as avg_service_time_minutes
FROM queue_entries
WHERE requested_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY service_id, DATE(requested_at);

CREATE INDEX idx_queue_statistics_service_date ON queue_statistics(service_id, queue_date);
```

## Database Functions & Triggers

### Function: Generate Queue Number

```sql
CREATE OR REPLACE FUNCTION generate_queue_number(service_name VARCHAR, service_id INT)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(3);
    last_number INT;
    new_number VARCHAR(20);
BEGIN
    -- Get prefix from service name (first 3 letters)
    prefix := UPPER(SUBSTRING(service_name FROM 1 FOR 3));
    
    -- Get last queue number for this service today
    SELECT COALESCE(MAX(CAST(SUBSTRING(queue_number FROM 5) AS INTEGER)), 0)
    INTO last_number
    FROM queue_entries
    WHERE service_id = generate_queue_number.service_id
    AND DATE(requested_at) = CURRENT_DATE
    AND queue_number LIKE prefix || '-%';
    
    -- Generate new number
    new_number := prefix || '-' || LPAD((last_number + 1)::VARCHAR, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### Function: Update Queue Position

```sql
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- Update positions for waiting queues in the same service
    UPDATE queue_entries
    SET queue_position = sub.row_num
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY service_id ORDER BY requested_at) as row_num
        FROM queue_entries
        WHERE status = 'waiting' AND service_id = NEW.service_id
    ) sub
    WHERE queue_entries.id = sub.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_positions
AFTER INSERT OR UPDATE OF status ON queue_entries
FOR EACH ROW
WHEN (NEW.status = 'waiting' OR OLD.status = 'waiting')
EXECUTE FUNCTION update_queue_positions();
```

### Trigger: Update Updated_At Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

### Insert Sample Services

```sql
INSERT INTO services (name, description, location, estimated_service_time) VALUES
('Registrar', 'Enrollment and transcript services', 'Administration Building', 10),
('Cashier', 'Tuition and fee payments', 'Administration Building', 5),
('Library', 'Book requests and inquiries', 'Library Building', 3),
('Clinic', 'Medical appointments', 'Health Services Building', 15),
('Guidance', 'Counseling services', 'Student Services Building', 20);
```

## Database Maintenance

### Refresh Materialized View

```sql
-- Refresh statistics daily (can be scheduled via cron)
REFRESH MATERIALIZED VIEW queue_statistics;
```

### Cleanup Old Data

```sql
-- Archive or delete queue entries older than 1 year
DELETE FROM queue_entries 
WHERE completed_at < CURRENT_DATE - INTERVAL '1 year'
AND status = 'completed';
```

## Security Considerations

1. Use parameterized queries to prevent SQL injection
2. Implement row-level security if needed
3. Regular backups
4. Index optimization for performance
5. Connection pooling
6. Transaction management for data integrity

