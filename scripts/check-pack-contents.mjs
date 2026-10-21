import { execSync } from "node:child_process"
import process from "node:process"

const FORBIDDEN_PATH_PREFIXES = [
  "src/",
  "tests/",
  "scripts/",
  "docs/",
  ".github/",
  "node_modules/",
  ".env",
]

const REQUIRED_PATHS = [
  "package.json",
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
  "dist/contract/index.js",
  "dist/contract/index.d.ts",
  "dist/client/index.js",
  "dist/client/index.d.ts",
  "dist/react-query/index.js",
  "dist/react-query/index.d.ts",
]

const output = execSync("pnpm pack --dry-run", { encoding: "utf8" })
const contentsIndex = output.indexOf("Tarball Contents")
const detailsIndex = output.indexOf("Tarball Details")

if (contentsIndex === -1 || detailsIndex === -1 || detailsIndex <= contentsIndex) {
  console.error("Could not parse pnpm pack --dry-run output")
  process.exit(1)
}

const packedPaths = output
  .slice(contentsIndex, detailsIndex)
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line.length > 0)

for (const packedPath of packedPaths) {
  const isForbidden = FORBIDDEN_PATH_PREFIXES.some(
    (prefix) => packedPath === prefix || packedPath.startsWith(prefix),
  )

  if (isForbidden) {
    console.error(`Tarball must not include ${packedPath}`)
    process.exit(1)
  }
}

for (const requiredPath of REQUIRED_PATHS) {
  if (!packedPaths.includes(requiredPath)) {
    console.error(`Tarball is missing ${requiredPath}`)
    process.exit(1)
  }
}

console.log(`Pack contents ok: ${packedPaths.length} files`)
