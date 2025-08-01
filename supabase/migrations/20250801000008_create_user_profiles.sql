-- Create user_profiles table for family profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    avatar_id text,
    type text NOT NULL DEFAULT 'adult' CHECK (type IN ('adult', 'teen', 'kids')),
    is_main boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, name)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_main ON public.user_profiles(user_id, is_main);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profiles"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
ON public.user_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Function to ensure only one main profile per user
CREATE OR REPLACE FUNCTION ensure_single_main_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a profile as main, unset all other main profiles for this user
    IF NEW.is_main = true THEN
        UPDATE public.user_profiles
        SET is_main = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    -- Ensure at least one profile is main
    IF NEW.is_main = false THEN
        DECLARE
            main_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO main_count
            FROM public.user_profiles
            WHERE user_id = NEW.user_id AND is_main = true AND id != NEW.id;
            
            -- If no other main profiles exist, keep this one as main
            IF main_count = 0 THEN
                NEW.is_main = true;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_ensure_single_main_profile ON public.user_profiles;
CREATE TRIGGER trigger_ensure_single_main_profile
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_main_profile();

-- Function to limit profiles per user (max 4)
CREATE OR REPLACE FUNCTION check_profile_limit()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        profile_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO profile_count
        FROM public.user_profiles
        WHERE user_id = NEW.user_id;
        
        -- Only check limit on INSERT, not UPDATE
        IF TG_OP = 'INSERT' AND profile_count >= 4 THEN
            RAISE EXCEPTION 'Maximum of 4 profiles allowed per user';
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile limit
DROP TRIGGER IF EXISTS trigger_check_profile_limit ON public.user_profiles;
CREATE TRIGGER trigger_check_profile_limit
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_limit();

-- Insert default main profile for existing users
INSERT INTO public.user_profiles (user_id, name, type, is_main)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Usuario Principal') as name,
    'adult',
    true
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id, name) DO NOTHING;
