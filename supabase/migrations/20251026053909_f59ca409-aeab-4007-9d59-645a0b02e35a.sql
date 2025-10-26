-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  expiry_date DATE NOT NULL,
  stock_remaining INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own medicines" 
ON public.medicines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medicines" 
ON public.medicines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicines" 
ON public.medicines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicines" 
ON public.medicines 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX idx_medicines_expiry_date ON public.medicines(expiry_date);
