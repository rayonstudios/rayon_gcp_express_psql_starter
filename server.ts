import { app } from "#/src/app";
import dotenv from "dotenv";
import http from "http";
import { PORT } from "./src/lib/constants";
dotenv.config();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
