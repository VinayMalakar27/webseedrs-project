import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// helper: flexible wrapper used across the app
export async function fetchWithAuth(tokenOrPath, pathOrOpts, maybeOpts) {
  let token = null;
  let path = "";
  let opts = {};

  // determine arguments: fetchWithAuth(path, opts?) OR fetchWithAuth(token, path, opts?)
  if (typeof pathOrOpts === "undefined") {
    path = tokenOrPath;
  } else if (typeof maybeOpts === "undefined") {
    // called as fetchWithAuth(path, opts?) OR fetchWithAuth(token, path)
    if (tokenOrPath && typeof tokenOrPath === "string" && tokenOrPath.startsWith("/")) {
      path = tokenOrPath;
      opts = pathOrOpts || {};
    } else {
      token = tokenOrPath;
      path = pathOrOpts;
    }
  } else {
    token = tokenOrPath;
    path = pathOrOpts;
    opts = maybeOpts || {};
  }

  const method = (opts.method || "GET").toUpperCase();
  const headers = { ...(opts.headers || {}) };
  let data;

  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      data = opts.body;
      // let axios set multipart boundary
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      data = opts.body;
    }
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await api.request({
    url: path,
    method,
    headers,
    data,
  });

  return res.data;
}

export default api;
