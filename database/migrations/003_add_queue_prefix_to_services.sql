-- Migration: Add queue_prefix column to services table
-- Run this script to add the queue_prefix column to existing services table

-- Add queue_prefix column if it doesn't exist
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS queue_prefix VARCHAR(10);

-- Add comment to explain the column
COMMENT ON COLUMN services.queue_prefix IS 'Custom queue number prefix (e.g., REG, CLI, MEC). If empty, uses first 3 letters of service name.';

