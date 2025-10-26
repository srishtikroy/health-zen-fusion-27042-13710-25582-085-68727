-- Add BMI column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bmi numeric;

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create daily_completions table
CREATE TABLE IF NOT EXISTS public.daily_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('meal', 'workout')),
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number, plan_type)
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plans
CREATE POLICY "Users can view own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for workout_plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" ON public.workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" ON public.workout_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" ON public.workout_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for daily_completions
CREATE POLICY "Users can view own completions" ON public.daily_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.daily_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON public.daily_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON public.daily_completions
  FOR DELETE USING (auth.uid() = user_id);