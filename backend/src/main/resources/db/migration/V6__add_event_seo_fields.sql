ALTER TABLE events
    ADD COLUMN seo_title VARCHAR(160) NULL,
    ADD COLUMN seo_description VARCHAR(320) NULL,
    ADD COLUMN seo_keywords VARCHAR(500) NULL,
    ADD COLUMN seo_image VARCHAR(500) NULL;

