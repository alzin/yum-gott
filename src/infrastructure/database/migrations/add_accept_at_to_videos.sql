ALTER TABLE videos ADD COLUMN IF NOT EXISTS accept_at TIMESTAMP WITH TIME ZONE;

-- Function to set accept_at when status_video changes to 'accepted'
CREATE OR REPLACE FUNCTION set_accept_at_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_video = 'accepted' AND (OLD.status_video IS DISTINCT FROM 'accepted') THEN
    NEW.accept_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS trg_set_accept_at_on_accept ON videos;
CREATE TRIGGER trg_set_accept_at_on_accept
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION set_accept_at_on_accept();
