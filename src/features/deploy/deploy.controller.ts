import { Request, Response } from 'express';
import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { Extract } from 'tar';

const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || 'deploy-token-change-in-production';

export const uploadDeploy = async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-deploy-token'];
    if (token !== DEPLOY_TOKEN) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    if (!req.body || !req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Salvar arquivo
    const filepath = '/tmp/deploy.tar.gz';
    await pipeline(
      req.file.buffer,
      createWriteStream(filepath)
    );

    res.json({ message: 'Deploy package uploaded successfully' });
  } catch (err) {
    console.error('Deploy upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const triggerDeploy = async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-deploy-token'];
    if (token !== DEPLOY_TOKEN) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Executar deploy em background
    setTimeout(() => {
      try {
        console.log('🚀 Iniciando deploy...');
        
        // Extrair e instalar
        execSync('cd ~/enviaPromo && tar -xzf /tmp/deploy.tar.gz', { stdio: 'inherit' });
        execSync('cd ~/enviaPromo && cp -r deploy/dist/* dist/ 2>/dev/null || cp -r deploy/dist dist-new && rm -rf dist && mv dist-new dist', { stdio: 'inherit' });
        execSync('cd ~/enviaPromo && cp -r deploy/public/* public/ 2>/dev/null || true', { stdio: 'inherit' });
        execSync('cd ~/enviaPromo && npm ci --production', { stdio: 'inherit' });
        
        // Reiniciar
        execSync('pm2 restart promo-monitor && pm2 save', { stdio: 'inherit' });
        
        console.log('✅ Deploy concluido!');
      } catch (err) {
        console.error('Deploy failed:', err);
      }
    }, 100);

    res.json({ message: 'Deploy triggered successfully' });
  } catch (err) {
    console.error('Deploy trigger error:', err);
    res.status(500).json({ error: 'Trigger failed' });
  }
};
