import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { internalAuth } from "./middleware/auth.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(internalAuth);

// Mount main routes
app.use("/media", routes);

app.get("/", (req, res) => {
  res.json({ status: "Media Service Running" });
});

export default app;