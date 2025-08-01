-- Make all users subscribed by default - modify subscription context logic
DO $$
BEGIN
    -- Update all existing users to be subscribed
    UPDATE public.subscribers 
    SET subscribed = true, 
        subscription_tier = 'premium',
        subscription_end = (NOW() + INTERVAL '10 years')
    WHERE subscribed = false OR subscription_end < NOW();
    
    -- Update all profiles to premium
    UPDATE public.profiles 
    SET subscription_plan = 'premium'
    WHERE subscription_plan != 'premium';
    
    -- Insert default subscription for users who don't have one
    INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
    SELECT 
        u.id,
        u.email,
        true,
        'premium',
        (NOW() + INTERVAL '10 years')
    FROM auth.users u
    LEFT JOIN public.subscribers s ON u.id = s.user_id
    WHERE s.user_id IS NULL
    ON CONFLICT (email) DO NOTHING;
    
    -- Insert default profiles for users who don't have one
    INSERT INTO public.profiles (user_id, subscription_plan, display_name)
    SELECT 
        u.id,
        'premium',
        COALESCE(u.raw_user_meta_data->>'full_name', u.email)
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'All users now have premium subscriptions';
END $$;
