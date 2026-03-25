-- PaoTabs Supabase Schema (prefixed to share DB with XoCompass)
-- Run this in your Supabase SQL Editor

-- PaoTabs Tasks
CREATE TABLE pt_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PaoTabs Stress Assessments
CREATE TABLE pt_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  feelings TEXT,
  problems TEXT,
  sleep_quality TEXT CHECK (sleep_quality IN ('well', 'restless', 'poor')),
  appetite TEXT CHECK (appetite IN ('normal', 'increased', 'decreased')),
  overwhelmed TEXT CHECK (overwhelmed IN ('not_at_all', 'sometimes', 'often')),
  energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  advice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PaoTabs Schedule Events
CREATE TABLE pt_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date DATE NOT NULL,
  event_time TIME,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE pt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_events ENABLE ROW LEVEL SECURITY;

-- pt_tasks policies
CREATE POLICY "pt_tasks_select" ON pt_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pt_tasks_insert" ON pt_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pt_tasks_update" ON pt_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pt_tasks_delete" ON pt_tasks FOR DELETE USING (auth.uid() = user_id);

-- pt_assessments policies
CREATE POLICY "pt_assessments_select" ON pt_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pt_assessments_insert" ON pt_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pt_assessments_delete" ON pt_assessments FOR DELETE USING (auth.uid() = user_id);

-- pt_events policies
CREATE POLICY "pt_events_select" ON pt_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pt_events_insert" ON pt_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pt_events_update" ON pt_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pt_events_delete" ON pt_events FOR DELETE USING (auth.uid() = user_id);
