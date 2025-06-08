import cors from "cors";
const allowedOrigins = [
  "https://fexp-web-app.vercel.app", // Fexp dev frontend url
];
export const confCors = cors;
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow reguests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      const msg =
        "The CORS policy for this site does not allow access the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // all allowed HTTP Methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTvs) choke on 200
};
