-- STEP 3: Run this last - creates trigger for new user signup
-- Auto-creates settings and qada for new users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create default settings for new user
  INSERT INTO public.settings (user_id) VALUES (NEW.id);

  -- Create default qada entries for new user
  INSERT INTO public.qada (user_id, prayer_name, count) VALUES
    (NEW.id, 'Fajr', 0),
    (NEW.id, 'Dhuhr', 0),
    (NEW.id, 'Asr', 0),
    (NEW.id, 'Maghrib', 0),
    (NEW.id, 'Isha', 0);

  RETURN NEW;
END;
$$;

-- Trigger to run when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
