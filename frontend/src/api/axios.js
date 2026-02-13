import axios from "axios";

// Create axios instance with Supabase URL
const api = axios.create({
  baseURL:
    process.env.REACT_APP_SUPABASE_URL ||
    "https://hehlmnkaavajndfhetbo.supabase.co",
  headers: {
    "Content-Type": "application/json",
    apikey:
      process.env.REACT_APP_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlaGxtbmthYXZham5kZmhldGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTcwNjksImV4cCI6MjA4NjQ5MzA2OX0.29cwMEXD2DmqWSDltUQmxtday435Y2qFdIreC3W828g",
  },
});

export default api;
