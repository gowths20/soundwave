import { Router } from 'express';
import { supabase } from '../lib/supabase';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ userId: data.user.id });
});

authRouter.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  res.json({ id: user.id, email: user.email });
});
