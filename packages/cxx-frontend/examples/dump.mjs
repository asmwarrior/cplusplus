//
// dump.mjs
//

import {
  DEFAULT_WASM_BINARY_URL,
  Parser,
  AST,
  ASTKind,
  ASTSlot,
} from "../dist/esm/index.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const source = `
template <typename T>
concept CanAdd = requires(T n) {
  n + n;
};

auto twice(CanAdd auto n) {
  return n + n;
}

const char* str = "hello";

int main() {
  return twice(2);
}
`;

async function main() {
  const wasmBinaryFile = fileURLToPath(DEFAULT_WASM_BINARY_URL);

  const wasmBinary = await readFile(wasmBinaryFile);

  // initialize the parser
  await Parser.init({ wasm: wasmBinary });

  const parser = new Parser({ source, path: "source.cc" });

  parser.parse();

  const diagnostics = parser.getDiagnostics();

  if (diagnostics.length > 0) {
    console.log("diagnostics", diagnostics);
  }

  const ast = parser.getAST();

  ast?.walk().preVisit(({ node, slot, depth }) => {
    if (!node instanceof AST) return;
    const ind = " ".repeat(depth * 2);
    const kind = ASTKind[node.getKind()];
    const member = slot !== undefined ? `${ASTSlot[slot]}: ` : "";
    console.log(`${ind}- ${member}${kind}`);
  });

  parser.dispose();
}

main().catch(console.error);
