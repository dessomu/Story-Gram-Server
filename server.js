const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const uploadRoute = require("./routes/uploadRoute");
const storyRoute = require("./routes/storyRoute");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send(`Server Running ✅`));

app.use("/upload", uploadRoute);
app.use("/stories", storyRoute);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on  http://localhost:${process.env.PORT}`);
});
