import express from "express";
import cors from "cors";
import { createBundle } from "./app/api.bundles.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/create-bundle", createBundle);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
