-- Fix core database issues for FurrChum Care Connect

-- 1. Create missing RPC function for vet dashboard data
CREATE OR REPLACE FUNCTION get_vet_dashboard_data(vet_user_id UUID)
RETURNS JSON AS $$
DECLARE
    vet_profile_data JSON;
    recent_appointments_data JSON;
    result JSON;
BEGIN
    -- Get vet profile data
    SELECT to_json(vp.*) INTO vet_profile_data
    FROM vet_profiles vp
    WHERE vp.id = vet_user_id;
    
    -- Get recent appointments data
    SELECT json_agg(
        json_build_object(
            'id', b.id,
            'booking_date', b.booking_date,
            'start_time', b.start_time,
            'end_time', b.end_time,
            'consultation_type', b.consultation_type,
            'status', b.status,
            'notes', b.notes,
            'pet_name', p.name,
            'pet_type', p.type,
            'owner_name', pr.full_name
        )
    ) INTO recent_appointments_data
    FROM bookings b
    LEFT JOIN pets p ON b.pet_id = p.id
    LEFT JOIN profiles pr ON b.pet_owner_id = pr.id
    WHERE b.vet_id = vet_user_id
    ORDER BY b.booking_date DESC
    LIMIT 10;
    
    -- Build result
    SELECT json_build_object(
        'vetProfile', vet_profile_data,
        'recentAppointments', COALESCE(recent_appointments_data, '[]'::json)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create missing RPC function for getting all users with emails
CREATE OR REPLACE FUNCTION get_all_users_with_emails()
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    user_type TEXT,
    status TEXT,
    address TEXT,
    appointment_count BIGINT,
    prescription_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.created_at,
        p.updated_at,
        p.full_name,
        au.email,
        p.phone_number,
        p.user_type,
        CASE 
            WHEN p.full_name LIKE '[SUSPENDED]%' THEN 'suspended'
            WHEN p.full_name LIKE '[DELETED]%' THEN 'deleted'
            ELSE 'active'
        END as status,
        p.address,
        COALESCE(
            (SELECT COUNT(*) FROM bookings b WHERE b.pet_owner_id = p.id), 
            0
        ) as appointment_count,
        COALESCE(
            (SELECT COUNT(*) FROM prescriptions pr WHERE pr.pet_owner_id = p.id), 
            0
        ) as prescription_count
    FROM profiles p
    LEFT JOIN auth.users au ON p.id = au.id
    WHERE p.user_type = 'pet_owner'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to get user email (for UserDetailsModal)
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN COALESCE(user_email, 'Email not available');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix RLS policies for vet_profiles table
DROP POLICY IF EXISTS "Enable access for authenticated users" ON vet_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vet_profiles;
DROP POLICY IF EXISTS "Enable update for profile owner" ON vet_profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON vet_profiles;

-- Create comprehensive RLS policies for vet_profiles
CREATE POLICY "Enable read access for all authenticated users" ON vet_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON vet_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for profile owner" ON vet_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for profile owner" ON vet_profiles
    FOR DELETE USING (auth.uid() = id);

-- 5. Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Enable access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for profile owner" ON profiles;

CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for profile owner" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Create function to ensure profile exists before creating vet profile
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id UUID, user_email TEXT, user_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Insert profile if it doesn't exist
    INSERT INTO profiles (id, full_name, user_type, created_at, updated_at)
    VALUES (user_id, user_name, 'vet', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW(),
        user_type = CASE 
            WHEN profiles.user_type = 'pet_owner' THEN profiles.user_type 
            ELSE 'vet' 
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_vet_dashboard_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_with_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT) TO authenticated;

-- 8. Update bookings RLS policies to allow proper access
DROP POLICY IF EXISTS "Enable access for authenticated users" ON bookings;

CREATE POLICY "Enable read access for related users" ON bookings
    FOR SELECT USING (
        auth.uid() = pet_owner_id OR 
        auth.uid() = vet_id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Enable insert for pet owners" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = pet_owner_id);

CREATE POLICY "Enable update for related users" ON bookings
    FOR UPDATE USING (
        auth.uid() = pet_owner_id OR 
        auth.uid() = vet_id OR
        auth.role() = 'service_role'
    );

-- 9. Update transactions RLS policies
DROP POLICY IF EXISTS "Enable access for authenticated users" ON transactions;

CREATE POLICY "Enable read access for related users" ON transactions
    FOR SELECT USING (
        auth.uid() = pet_owner_id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Enable insert for authenticated users" ON transactions
    FOR INSERT WITH CHECK (
        auth.uid() = pet_owner_id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Enable update for system" ON transactions
    FOR UPDATE USING (auth.role() = 'service_role');

-- 10. Refresh schema cache
NOTIFY pgrst, 'reload schema'; 