const config = {
  apiUrl:
    process.env.NODE_ENV === "production" // this environment variable is set automatically by Vercel
      ? "https://hardback-hax0r.onrender.com"
      : "http://127.0.0.1:5000",
  title: process.env.NODE_ENV === "production" ? "HH" : "HH (dev)",
};

export default config;
