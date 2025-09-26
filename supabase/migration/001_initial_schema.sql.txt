-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table extension (profiles)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Feeds table
CREATE TABLE public.feeds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    amount INTEGER,
    unit TEXT CHECK (unit IN ('ml', 'oz')),
    method TEXT NOT NULL CHECK (method IN ('breast', 'bottle')),
    side TEXT CHECK (side IN ('left', 'right')),
    duration_sec INTEGER,
    milk_type TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies for feeds
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own feeds" ON public.feeds FOR ALL USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_feeds_user_date ON public.feeds(user_id, date DESC);
CREATE INDEX idx_feeds_user_updated ON public.feeds(user_id, updated_at DESC);

-- Diapers table
CREATE TABLE public.diapers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    pee BOOLEAN NOT NULL DEFAULT FALSE,
    poop BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.diapers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own diapers" ON public.diapers FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_diapers_user_date ON public.diapers(user_id, date DESC);
CREATE INDEX idx_diapers_user_updated ON public.diapers(user_id, updated_at DESC);

-- Sleep table
CREATE TABLE public.sleeps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sleeps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own sleeps" ON public.sleeps FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_sleeps_user_date ON public.sleeps(user_id, date DESC);
CREATE INDEX idx_sleeps_user_updated ON public.sleeps(user_id, updated_at DESC);

-- Vitamins table
CREATE TABLE public.vitamins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    name TEXT NOT NULL,
    dose TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vitamins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own vitamins" ON public.vitamins FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_vitamins_user_date ON public.vitamins(user_id, date DESC);

-- Weights table
CREATE TABLE public.weights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    kg DECIMAL(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own weights" ON public.weights FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_weights_user_date ON public.weights(user_id, date DESC);

-- Heights table
CREATE TABLE public.heights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    cm DECIMAL(5,1) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.heights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own heights" ON public.heights FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_heights_user_date ON public.heights(user_id, date DESC);

-- Others table
CREATE TABLE public.others (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.others ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own others" ON public.others FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_others_user_date ON public.others(user_id, date DESC);

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_feeds
    BEFORE UPDATE ON public.feeds
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_diapers
    BEFORE UPDATE ON public.diapers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_sleeps
    BEFORE UPDATE ON public.sleeps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_vitamins
    BEFORE UPDATE ON public.vitamins
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_weights
    BEFORE UPDATE ON public.weights
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_heights
    BEFORE UPDATE ON public.heights
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_others
    BEFORE UPDATE ON public.others
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a view for daily aggregated data
CREATE OR REPLACE VIEW public.daily_summary AS
SELECT 
    user_id,
    date,
    (
        SELECT COUNT(*) FROM public.feeds f 
        WHERE f.user_id = daily_summary.user_id AND f.date = daily_summary.date
    ) as feed_count,
    (
        SELECT COALESCE(SUM(
            CASE 
                WHEN unit = 'oz' THEN ROUND(amount * 29.5735)
                ELSE amount 
            END
        ), 0) FROM public.feeds f 
        WHERE f.user_id = daily_summary.user_id AND f.date = daily_summary.date 
        AND method = 'bottle' AND amount IS NOT NULL
    ) as total_feed_ml,
    (
        SELECT COUNT(*) FROM public.diapers d 
        WHERE d.user_id = daily_summary.user_id AND d.date = daily_summary.date AND pee = true
    ) as pee_count,
    (
        SELECT COUNT(*) FROM public.diapers d 
        WHERE d.user_id = daily_summary.user_id AND d.date = daily_summary.date AND poop = true
    ) as poop_count,
    (
        SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))), 0) FROM public.sleeps s 
        WHERE s.user_id = daily_summary.user_id AND s.date = daily_summary.date
    ) as total_sleep_seconds
FROM (
    SELECT DISTINCT user_id, date FROM public.feeds
    UNION
    SELECT DISTINCT user_id, date FROM public.diapers
    UNION  
    SELECT DISTINCT user_id, date FROM public.sleeps
    UNION
    SELECT DISTINCT user_id, date FROM public.vitamins
    UNION
    SELECT DISTINCT user_id, date FROM public.weights
    UNION
    SELECT DISTINCT user_id, date FROM public.heights
    UNION
    SELECT DISTINCT user_id, date FROM public.others
) daily_summary;
