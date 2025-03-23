import express from "express";
import httpproxy from "http-proxy";
import "dotenv/config";
import { redis } from "./services/redis";

const PORT = process.env.PORT || 8000;
const proxy = httpproxy.createProxy();

const app = express();

app.use(async (req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];
  let url = await redis.get(subdomain);
  if (url) {
    return proxy.web(req, res, { target: url, changeOrigin: true });
  }
});

app.listen(PORT, () => console.log(`Proxy server started on port ${PORT}`));

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;

  const hostHeader = req.headers.host;
  if (!hostHeader) return;

  const hostname = hostHeader.split(":")[0];
  const subdomain = hostname.split(".")[0];

  if (url === "/" && subdomain.slice(-3) === "-rt") {
    proxyReq.path += "index.html";
  }
});
