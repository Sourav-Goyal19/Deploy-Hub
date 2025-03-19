import httpproxy from "http-proxy";
import express from "express";

const PORT = process.env.PORT || 8000;
const proxy = httpproxy.createProxy();

const app = express();

const BASEPATH = `${process.env.S3_BUCKET_URL}/__outputs`;

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];

  const reverseTo = `${BASEPATH}/${subdomain}`;

  return proxy.web(req, res, { target: reverseTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url == "/") {
    proxyReq.path += "index.html";
  }
});

app.listen(PORT, () => console.log(`Proxy server started on port ${PORT}`));
