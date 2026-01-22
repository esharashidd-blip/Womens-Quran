-- Migration: Add Cycle Mode columns to settings table
-- Run this in Supabase SQL Editor

-- Add cycle_mode column
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS cycle_mode BOOLEAN NOT NULL DEFAULT FALSE;

-- Add cycle_mode_first_time column (tracks if first-time modal was shown)
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS cycle_mode_first_time BOOLEAN NOT NULL DEFAULT TRUE;
