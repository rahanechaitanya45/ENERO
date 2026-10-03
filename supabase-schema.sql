-- ENERO PostgreSQL Database Schema & Row Level Security (RLS)
-- Use this script in your Supabase SQL Editor to provision tables and security policies.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  home_type TEXT DEFAULT 'Apartment',
  people_count INTEGER DEFAULT 3,
  electricity_provider TEXT DEFAULT 'Generic Utility',
  tariff_rate NUMERIC(10, 2) DEFAULT 7.50,
  monthly_budget NUMERIC(10, 2) DEFAULT 2500.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Appliances Table
CREATE TABLE IF NOT EXISTS public.appliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  power_watts NUMERIC(10, 2) NOT NULL CHECK (power_watts > 0),
  hours_per_day NUMERIC(4, 2) NOT NULL CHECK (hours_per_day >= 0 AND hours_per_day <= 24),
  days_per_month INTEGER NOT NULL DEFAULT 30 CHECK (days_per_month >= 1 AND days_per_month <= 31),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Calculations Table (History Snapshots)
CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  total_kwh NUMERIC(10, 2) NOT NULL,
  estimated_cost NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Calculation Appliances (Detailed snapshot breakdown)
CREATE TABLE IF NOT EXISTS public.calculation_appliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL REFERENCES public.calculations(id) ON DELETE CASCADE,
  appliance_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  power_watts NUMERIC(10, 2) NOT NULL,
  hours_per_day NUMERIC(4, 2) NOT NULL,
  days_per_month INTEGER NOT NULL,
  monthly_kwh NUMERIC(10, 2) NOT NULL,
  estimated_cost NUMERIC(10, 2) NOT NULL
);

-- 5. Insights Table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user-isolation: User A can NEVER view or modify User B's data
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Appliances Policies
CREATE POLICY "Users can view own appliances" 
  ON public.appliances FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appliances" 
  ON public.appliances FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appliances" 
  ON public.appliances FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appliances" 
  ON public.appliances FOR DELETE 
  USING (auth.uid() = user_id);

-- Calculations Policies
CREATE POLICY "Users can view own calculations" 
  ON public.calculations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" 
  ON public.calculations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" 
  ON public.calculations FOR DELETE 
  USING (auth.uid() = user_id);

-- Calculation Appliances Policies
CREATE POLICY "Users can view own calculation items" 
  ON public.calculation_appliances FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.calculations 
      WHERE calculations.id = calculation_appliances.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own calculation items" 
  ON public.calculation_appliances FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculations 
      WHERE calculations.id = calculation_appliances.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

-- Insights Policies
CREATE POLICY "Users can view own insights" 
  ON public.insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
  ON public.insights FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" 
  ON public.insights FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger to create initial profile upon Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (new.id, new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'ENERO Member'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
