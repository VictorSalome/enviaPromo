import { createServer } from 'http';
import { readFileSync } from 'fs';
import webhook from './api/webhook.js';

const envContent = readFileSync('./.env', 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) process.env[key.trim()] = value.trim();
});

const server = createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    req.body = JSON.parse(body || '{}');
    
    const mockRes = {
      status: (code) => {
        res.statusCode = code;
        return {
          json: (data) => res.end(JSON.stringify(data)),
          send: (text) => res.end(text)
        };
      }
    };
    
    webhook(req, mockRes);
  });
});

server.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
