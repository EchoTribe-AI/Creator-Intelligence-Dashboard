import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    const altPath = path.resolve(process.cwd(), "public");
    if (fs.existsSync(altPath)) {
      app.use(express.static(altPath));
      app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.resolve(altPath, "index.html"));
      });
      return;
    }
    
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
