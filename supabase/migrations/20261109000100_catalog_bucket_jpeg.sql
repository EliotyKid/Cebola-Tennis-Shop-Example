-- Safari cannot encode WebP, so the admin falls back to JPEG there.
update storage.buckets set allowed_mime_types = '{image/webp,image/jpeg}' where id = 'catalog';
