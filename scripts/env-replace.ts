import fs from "fs";
import { importSecrets } from "./helpers";

importSecrets();

const filePath = "cloud-run.yaml";
let envFile = fs.readFileSync(filePath, "utf-8");
const envVariables = envFile.match(/\$[A-Z_d]+/g);

if (!envVariables) {
  console.log("No env variables found");
  process.exit(0);
}

envVariables.forEach((envVar) => {
  const key = envVar.slice(1);
  const value = process.env[key];

  if (!value) {
    console.log(`Environment variable ${key} not found`);
    return;
  }

  envFile = envFile.replaceAll(envVar, value);
});

fs.writeFileSync(filePath, envFile);

console.log(`Env variables replaced successfully for ${filePath}`);
process.exit(0);
