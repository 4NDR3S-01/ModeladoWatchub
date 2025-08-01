-- Set up carloschilesilva@gmail.com as subscribed user
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID for carloschilesilva@gmail.com
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'carloschilesilva@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Update or insert into subscribers table
        INSERT INTO public.subscribers (
            user_id,
            email,
            subscribed,
            subscription_tier,
            subscription_end,
            updated_at,
            created_at
        ) VALUES (
            user_uuid,
            'carloschilesilva@gmail.com',
            true,
            'premium',
            (NOW() + INTERVAL '1 year'),
            NOW(),
            NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            subscribed = true,
            subscription_tier = 'premium',
            subscription_end = (NOW() + INTERVAL '1 year'),
            updated_at = NOW();
        
        -- Update or insert into profiles table with premium subscription
        INSERT INTO public.profiles (
            user_id,
            display_name,
            subscription_plan,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'Carlos Chile Silva',
            'premium',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            subscription_plan = 'premium',
            updated_at = NOW();
            
        RAISE NOTICE 'User carloschilesilva@gmail.com has been set up with premium subscription';
    ELSE
        RAISE NOTICE 'User carloschilesilva@gmail.com not found in auth.users table';
    END IF;
END $$;
