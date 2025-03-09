import express from "express";
import httpproxy from "http-proxy";

const PORT = process.env.PORT || 8000;
const proxy = httpproxy.createProxy();

const app = express();

const BASEPATH = `https://building-bucket-deployment.s3.ap-south-1.amazonaws.com/__outputs`;

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

app.listen(PORT, () => console.log(`Proxy server started ${PORT}`));
