import { Request, Response } from "express";
import { execSync } from "child_process";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || "deploy-token-change-in-production";

export const uploadDeploy = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers["x-deploy-token"];
    if (token !== DEPLOY_TOKEN) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    if (!(req as any).file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filepath = "/tmp/deploy.tar.gz";
    const fileBuffer = (req as any).file.buffer;
    const readableStream = Readable.from([fileBuffer]);
    await pipeline(readableStream, createWriteStream(filepath));

    res.json({ message: "Deploy package uploaded" });
  } catch (err) {
    console.error("Deploy upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const triggerDeploy = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers["x-deploy-token"];
    if (token !== DEPLOY_TOKEN) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    setTimeout(() => {
      try {
        console.log("🚀 Iniciando deploy...");
        execSync("cd ~/enviaPromo && tar -xzf /tmp/deploy.tar.gz", { stdio: "inherit" });
        execSync("cd ~/enviaPromo && cp -r deploy/dist/* dist/ 2>/dev/null || (cp -r deploy/dist dist-new && rm -rf dist && mv dist-new dist)", { stdio: "inherit" });
        execSync("cd ~/enviaPromo && cp -r deploy/public/* public/ 2>/dev/null || true", { stdio: "inherit" });
        execSync("cd ~/enviaPromo && npm ci --production", { stdio: "inherit" });
        execSync("pm2 restart promo-monitor && pm2 save", { stdio: "inherit" });
        console.log("✅ Deploy concluido!");
      } catch (err) {
        console.error("Deploy failed:", err);
      }
    }, 100);

    res.json({ message: "Deploy triggered" });
  } catch (err) {
    console.error("Deploy trigger error:", err);
    res.status(500).json({ error: "Trigger failed" });
  }
};
