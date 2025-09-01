-- Sample data (only insert if table is empty)
INSERT IGNORE INTO folders (name, parent_id, path) VALUES 
  ('Documents', NULL, '/Documents'),
  ('Pictures', NULL, '/Pictures'),
  ('Music', NULL, '/Music'),
  ('Videos', NULL, '/Videos'),
  ('Work', 1, '/Documents/Work'),
  ('Personal', 1, '/Documents/Personal'),
  ('Photos', 2, '/Pictures/Photos'),
  ('Screenshots', 2, '/Pictures/Screenshots'),
  ('Rock', 3, '/Music/Rock'),
  ('Jazz', 3, '/Music/Jazz'),
  ('Movies', 4, '/Videos/Movies'),
  ('TV Shows', 4, '/Videos/TV Shows');
