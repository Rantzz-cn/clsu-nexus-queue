-- Performance Optimization: Add Database Indexes
-- This migration adds indexes to improve query performance

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Indexes for queue_entries table (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_id ON queue_entries(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_requested_at ON queue_entries(requested_at);
CREATE INDEX IF NOT EXISTS idx_queue_entries_counter_id ON queue_entries(counter_id) WHERE counter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_status ON queue_entries(service_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_user_service ON queue_entries(user_id, service_id, status);

-- Indexes for services table
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);

-- Indexes for counters table
CREATE INDEX IF NOT EXISTS idx_counters_service_id ON counters(service_id);
CREATE INDEX IF NOT EXISTS idx_counters_is_active ON counters(is_active);
CREATE INDEX IF NOT EXISTS idx_counters_service_active ON counters(service_id, is_active);

-- Composite index for common queue queries (service + status + requested_at)
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_status_date 
ON queue_entries(service_id, status, requested_at DESC);

-- Index for queue position calculations
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_waiting 
ON queue_entries(service_id, queue_position) 
WHERE status = 'waiting';

-- Index for completed queue queries (for analytics)
CREATE INDEX IF NOT EXISTS idx_queue_entries_completed_at 
ON queue_entries(completed_at) 
WHERE completed_at IS NOT NULL;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_queue_entries_date_status 
ON queue_entries(DATE(requested_at), status);

-- Analyze tables after creating indexes
ANALYZE users;
ANALYZE queue_entries;
ANALYZE services;
ANALYZE counters;

