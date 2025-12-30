-- Migration: Create system_settings table
-- Run this script if the system_settings table doesn't exist

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings if they don't exist
INSERT INTO system_settings (id, settings)
VALUES (1, '{
    "queue_number_prefix": "",
    "notification_before_minutes": 5,
    "auto_refresh_interval": 5,
    "display_board_refresh_interval": 5,
    "max_queue_per_user": 3,
    "enable_sms_notifications": false,
    "enable_email_notifications": false,
    "system_maintenance_mode": false,
    "maintenance_message": ""
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

