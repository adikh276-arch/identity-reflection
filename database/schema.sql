CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS constellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stars (
    id SERIAL PRIMARY KEY,
    constellation_id UUID REFERENCES constellations(id) ON DELETE CASCADE,
    star_id_client INT NOT NULL, -- index or id from frontend (0-9)
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    label TEXT NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_constellations_user_id ON constellations(user_id);
CREATE INDEX IF NOT EXISTS idx_stars_constellation_id ON stars(constellation_id);
