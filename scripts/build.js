#!/usr/bin/env node

import { execSync } from "child_process"
import { rename, copyFile } from "fs/promises"
import { existsSync } from "fs"

async function build() {
  console.log("Building ESM version...")
  execSync("tsc", { stdio: "inherit" })

  // Copy ESM files before CommonJS build overwrites them
  if (existsSync("./dist/index.js")) {
    await copyFile("./dist/index.js", "./dist/index.esm.js")
    console.log("Backed up ESM version")
  }

  console.log("Building CommonJS version...")
  execSync("tsc -p tsconfig.cjs.json", { stdio: "inherit" })

  // Rename CommonJS files to .cjs extension
  if (existsSync("./dist/index.js")) {
    await rename("./dist/index.js", "./dist/index.cjs")
    console.log("Renamed CommonJS index.js to index.cjs")
  }

  // Restore ESM version
  if (existsSync("./dist/index.esm.js")) {
    await rename("./dist/index.esm.js", "./dist/index.js")
    console.log("Restored ESM version")
  }

  if (existsSync("./dist/index.d.ts")) {
    await copyFile("./dist/index.d.ts", "./dist/index.cjs.d.ts")
    console.log("Copied index.d.ts to index.cjs.d.ts")
  }

  console.log("Build completed successfully!")
}

build().catch(error => {
  console.error(error)
})
