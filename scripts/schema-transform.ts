//@ts-nocheck
import * as fs from "fs";
import * as readline from "readline";

const schemaFilePath = "prisma/schema.prisma";

async function processSchema() {
  const fileStream = fs.createReadStream(schemaFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const outputLines: string[] = [];
  let insideModel = false;
  let currentModelName = "";
  const renamedFieldsMap: Record<string, Record<string, string>> = {};

  for await (const line of rl) {
    const trimmedLine = line.trim();

    // Check if we are entering a model block
    const modelMatch = trimmedLine.match(/^model\s+(\w+)\s*{/);
    if (modelMatch) {
      insideModel = true;
      currentModelName = modelMatch[1];
      renamedFieldsMap[currentModelName] = {};
      outputLines.push(line);
      continue;
    }

    // Check if we are exiting a model block
    if (insideModel && trimmedLine === "}") {
      insideModel = false;
      currentModelName = "";
      outputLines.push(line);
      continue;
    }

    if (insideModel) {
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("//")) {
        outputLines.push(line);
        continue;
      }

      // Match field lines
      const fieldMatch = line.match(/^(\s*)(\w+)\s+([\w\[\]?]+)(.*)/);
      if (fieldMatch) {
        const indentation = fieldMatch[1];
        const fieldName = fieldMatch[2];
        const fieldType = fieldMatch[3];
        let fieldAttrs = fieldMatch[4];

        // **Skip xata_version field**
        if (fieldName === "xata_version") {
          // Skip this field entirely
          continue;
        }

        // **Handle @relation attributes in field attributes**
        fieldAttrs = fieldAttrs.replace(
          /@relation\(([^)]*)\)/g,
          (match, relationContent) => {
            // Update 'references' and 'fields' in @relation
            relationContent = relationContent.replace(
              /references:\s*\[([^\]]+)\]/,
              (m, refs) => {
                const updatedRefs = refs.split(",").map((ref) => {
                  ref = ref.trim();
                  const newRef = renamedFieldsMap[currentModelName][ref] || ref;
                  return newRef;
                });
                return `references: [${updatedRefs.join(", ")}]`;
              }
            );

            relationContent = relationContent.replace(
              /fields:\s*\[([^\]]+)\]/,
              (m, fields) => {
                const updatedFields = fields.split(",").map((field) => {
                  field = field.trim();
                  const newField =
                    renamedFieldsMap[currentModelName][field] || field;
                  return newField;
                });
                return `fields: [${updatedFields.join(", ")}]`;
              }
            );

            return `@relation(${relationContent})`;
          }
        );

        if (fieldName.startsWith("xata_")) {
          const originalFieldName = fieldName;
          let newFieldName = fieldName.substring(5);
          newFieldName =
            newFieldName === "createdat"
              ? "created_at"
              : newFieldName === "updatedat"
              ? "updated_at"
              : newFieldName;

          // Store the mapping of old field name to new field name for this model
          renamedFieldsMap[currentModelName][originalFieldName] = newFieldName;

          // Check if @map already exists
          if (!fieldAttrs.includes("@map(")) {
            fieldAttrs = fieldAttrs.trim() + ` @map("${originalFieldName}")`;
          }

          // Reconstruct the line with proper indentation
          const newLine = `${indentation}${newFieldName} ${fieldType}${fieldAttrs}`;
          outputLines.push(newLine);
        } else {
          // Update field name in renamedFieldsMap if not renamed
          renamedFieldsMap[currentModelName][fieldName] = fieldName;
          outputLines.push(
            `${indentation}${fieldName} ${fieldType}${fieldAttrs}`
          );
        }
      } else {
        // For lines that might contain @relation attributes without field definitions
        const updatedLine = line.replace(
          /@relation\(([^)]*)\)/g,
          (match, relationContent) => {
            // Update 'references' and 'fields' in @relation
            relationContent = relationContent.replace(
              /references:\s*\[([^\]]+)\]/,
              (m, refs) => {
                const updatedRefs = refs.split(",").map((ref) => {
                  ref = ref.trim();
                  const newRef = renamedFieldsMap[currentModelName][ref] || ref;
                  return newRef;
                });
                return `references: [${updatedRefs.join(", ")}]`;
              }
            );

            relationContent = relationContent.replace(
              /fields:\s*\[([^\]]+)\]/,
              (m, fields) => {
                const updatedFields = fields.split(",").map((field) => {
                  field = field.trim();
                  const newField =
                    renamedFieldsMap[currentModelName][field] || field;
                  return newField;
                });
                return `fields: [${updatedFields.join(", ")}]`;
              }
            );

            return `@relation(${relationContent})`;
          }
        );

        outputLines.push(updatedLine);
      }
    } else {
      // Outside of model block, add the line as is
      outputLines.push(line);
    }
  }

  // Write the modified schema to the output file
  fs.writeFileSync(schemaFilePath, outputLines.join("\n"));
}

processSchema().catch((error) => {
  console.error("Error processing schema:", error);
});
