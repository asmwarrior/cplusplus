# A Compiler Frontend for C++

This repository contains a _work in progress_ compiler frontend for C++ 20.

## Build

On Linux, macOS and Windows:

```sh
# configure cxx-frontend
cmake . \
 -G Ninja \
 -B build \
 -DCMAKE_BUILD_TYPE=Release \
 -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=1

# build cxx-frontend
cmake --build build
```

## Dump the AST

Use `-ast-dump` to dump the AST of a C++ program.

```sh
echo 'int main() { auto f = []{ return 1; }; return f(); }' |
  ./build/cxx-frontend  -ast-dump -
```

## Build the npm package

```sh
cd packages/cxx-frontend

# prepare the package
npm ci

# build the package.
npm pack
```

## Use the JavaScript API

```js
const { Parser, RecursiveASTVisitor, ASTKind } = require("@robertoraggi/cxx");

const source = `
int fact(int n) {
    if (n < 2) return 1;
    return n * fact(n - 1);
}

int main() {
    return fact(3);
}
`;

const parser = new Parser({ source, path: "fact.cc" });

parser.parse();

const diagnostics = parser.getDiagnostics();

if (diagnostics.length > 0) {
  console.log("diagnostics", diagnostics);
}

class DumpAST extends RecursiveASTVisitor {
  depth = 0;

  accept(ast) {
    if (ast) {
      const name = ASTKind[ast.getKind()];
      console.log(`${" ".repeat(this.depth * 2)}${name}`);
      ++this.depth;
      super.accept(ast);
      --this.depth;
    }
  }
}

parser.getAST().accept(new DumpAST());

parser.dispose();
```
