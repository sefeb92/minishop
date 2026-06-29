import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

export const localRegisterPlugin = () => ({
  name: 'local-register-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Body parser helper
      const parseBody = () => new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(JSON.parse(body || '{}')));
      });

      // API credentials helper
      const getAdminClient = () => {
        const env = loadEnv('', process.cwd(), '');
        const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_SECRET_KEY;
        if (!supabaseUrl || !supabaseKey) return null;
        return createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });
      };

      if (req.url === '/api/register' && req.method === 'POST') {
        try {
          const body = await parseBody();
          const supabaseAdmin = getAdminClient();
          if (!supabaseAdmin) {
            res.statusCode = 500; res.end(JSON.stringify({ success: false, message: 'Missing credentials' })); return;
          }
          const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: body.email, password: body.password, user_metadata: { name: body.name }, email_confirm: true
          });
          if (authError) throw authError;
          res.statusCode = 200; res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 400; res.end(JSON.stringify({ success: false, message: e.message }));
        }
      } 
      else if (req.url === '/api/upload' && req.method === 'POST') {
        try {
          const body = await parseBody();
          const supabaseAdmin = getAdminClient();
          if (!supabaseAdmin) {
            res.statusCode = 500; res.end(JSON.stringify({ success: false, message: 'Missing credentials' })); return;
          }
          
          const buffer = Buffer.from(body.base64, 'base64');
          
          const { data, error } = await supabaseAdmin.storage
            .from('product-images')
            .upload(body.filePath, buffer, {
              contentType: body.contentType,
              upsert: false
            });
            
          if (error) throw error;
          
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(body.filePath);
            
          res.statusCode = 200; res.end(JSON.stringify({ success: true, url: publicUrlData.publicUrl }));
        } catch (e) {
          res.statusCode = 400; res.end(JSON.stringify({ success: false, message: e.message }));
        }
      }
      else if (req.url.startsWith('/api/products')) {
        try {
          const supabaseAdmin = getAdminClient();
          if (!supabaseAdmin) {
            res.statusCode = 500; res.end(JSON.stringify({ success: false, message: 'Missing credentials' })); return;
          }

          if (req.method === 'POST') {
            const body = await parseBody();
            const { error } = await supabaseAdmin.from('products').insert([body]);
            if (error) throw error;
            res.statusCode = 200; res.end(JSON.stringify({ success: true }));
          } 
          else if (req.method === 'PUT') {
            const body = await parseBody();
            const id = req.url.split('/').pop();
            const { error } = await supabaseAdmin.from('products').update(body).eq('id', id);
            if (error) throw error;
            res.statusCode = 200; res.end(JSON.stringify({ success: true }));
          }
          else if (req.method === 'DELETE') {
            const id = req.url.split('/').pop();
            const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
            if (error) throw error;
            res.statusCode = 200; res.end(JSON.stringify({ success: true }));
          } else {
            next();
          }
        } catch (e) {
          res.statusCode = 400; res.end(JSON.stringify({ success: false, message: e.message }));
        }
      } 
      else {
        next();
      }
    });
  }
});
