-- ============================================================
-- OUTLY DATABASE SCHEMA & SEED DATA
-- Paste this into any PostgreSQL / Supabase SQL Editor to restore
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    city TEXT DEFAULT 'Chennai',
    safety_contact_name TEXT,
    safety_contact_phone TEXT,
    outings_attended INT DEFAULT 0,
    outings_flaked INT DEFAULT 0,
    strike_count INT DEFAULT 0,
    suspended_until TIMESTAMPTZ,
    fcm_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    venue TEXT NOT NULL,
    area_neighborhood TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    slots_total INT DEFAULT 3,
    slots_claimed INT DEFAULT 1,
    split_vibe TEXT DEFAULT 'Split equally',
    notes TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAN REQUESTS (Pitches to join)
CREATE TABLE IF NOT EXISTS public.plan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pitch_message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (plan_id, applicant_id)
);

-- 4. PLAN MESSAGES (Ephemeral Squad Chat)
CREATE TABLE IF NOT EXISTS public.plan_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_messages;

-- 6. RPC HELPERS
CREATE OR REPLACE FUNCTION increment_plan_slots(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.plans
    SET slots_claimed = LEAST(slots_total, slots_claimed + 1)
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_squad_member(p_plan_id UUID, p_applicant_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.plan_requests
    SET status = 'declined'
    WHERE plan_id = p_plan_id AND applicant_id = p_applicant_id;

    UPDATE public.plans
    SET slots_claimed = GREATEST(1, slots_claimed - 1)
    WHERE id = p_plan_id;
END;
$$ LANGUAGE plpgsql;

-- 7. SEED DATA RESTORATION
INSERT INTO public.profiles (id, phone, full_name, username, city, outings_attended, outings_flaked) VALUES
('00000000-0000-0000-0000-000000000001', '+919876543210', 'Akshay', 'akshay', 'Chennai', 0, 0),
('11111111-1111-1111-1111-111111111111', '+919111111111', 'Siddharth R', 'sid_r', 'Chennai', 9, 0),
('22222222-2222-2222-2222-222222222222', '+919222222222', 'Praveen Kumar', 'prav_k', 'Chennai', 14, 1),
('33333333-3333-3333-3333-333333333333', '+919333333333', 'Harish V', 'harish_v', 'Chennai', 6, 0),
('44444444-4444-4444-4444-444444444444', '+919444444444', 'Kavya S', 'kavya_s', 'Chennai', 11, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plans (id, host_id, title, category, venue, area_neighborhood, scheduled_time, slots_total, slots_claimed, split_vibe, status) VALUES
('7c7d1e78-c84c-46ec-b07e-22ac3f1bdf0b', '00000000-0000-0000-0000-000000000001', 'Interstellar IMAX (10th Anniversary)', 'screen_stage', 'Palazzo Cinemas, Nexus Vijaya', 'Vadapalani', NOW() + INTERVAL '3 hours', 2, 1, 'Self pay', 'open'),
('c97d29f2-736d-4fa8-946a-487d02c12023', '00000000-0000-0000-0000-000000000001', 'Midnight Biryani + Chai Run', 'food_cafes', 'Buhari Hotel / Tea Shack', 'Anna Nagar', NOW() + INTERVAL '6 hours', 4, 2, 'Split equally', 'open'),
('265e7f2b-b575-46bb-a829-27095831b212', '00000000-0000-0000-0000-000000000001', '6v6 Turf Football Game', 'sports_turf', 'Whistle Urban Sports Club', 'Nungambakkam', NOW() + INTERVAL '12 hours', 6, 5, 'Split equally', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plan_requests (id, plan_id, applicant_id, pitch_message, status) VALUES
('24eb9944-9f44-4e22-a8d5-1f352f67aa54', '265e7f2b-b575-46bb-a829-27095831b212', '11111111-1111-1111-1111-111111111111', 'Playing center midfield, bringing studs.', 'accepted'),
('eff6d3c4-23f6-4357-8e28-eb915c68f18c', '265e7f2b-b575-46bb-a829-27095831b212', '22222222-2222-2222-2222-222222222222', 'Can play keeper or defense.', 'accepted'),
('f6d6683d-6d04-42ff-aae8-ada221a6977a', 'c97d29f2-736d-4fa8-946a-487d02c12023', '11111111-1111-1111-1111-111111111111', 'Buhari mutton biryani at midnight? Count me in!', 'accepted')
ON CONFLICT (id) DO NOTHING;
