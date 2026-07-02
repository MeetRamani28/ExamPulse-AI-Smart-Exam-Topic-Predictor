require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database.connection");

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀 ExamPulse Engine initialized in [${ENV.toUpperCase()}] Mode`,
    );
    if (ENV === "development") {
      console.log(
        `📡 Local Access Point listening at: http://localhost:${PORT}`,
      );
    }
  });
});
