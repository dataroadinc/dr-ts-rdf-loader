# @dataroadinc/rdf-loader

[![npm version](https://img.shields.io/npm/v/@dataroadinc/rdf-loader.svg)](https://www.npmjs.com/package/@dataroadinc/rdf-loader)
[![npm downloads](https://img.shields.io/npm/dm/@dataroadinc/rdf-loader.svg)](https://www.npmjs.com/package/@dataroadinc/rdf-loader)
[![License](https://img.shields.io/npm/l/@dataroadinc/rdf-loader.svg)](https://github.com/dataroadinc/dr-ts-rdf-loader/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/@dataroadinc/rdf-loader.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/dataroadinc/dr-ts-rdf-loader/actions/workflows/ci.yml/badge.svg)](https://github.com/dataroadinc/dr-ts-rdf-loader/actions/workflows/ci.yml)
[![Release](https://github.com/dataroadinc/dr-ts-rdf-loader/actions/workflows/release.yml/badge.svg)](https://github.com/dataroadinc/dr-ts-rdf-loader/actions/workflows/release.yml)

A webpack loader for importing RDF (Resource Description Framework) files
directly as JavaScript modules in Next.js and other webpack-based applications.

## Features

- **Multiple RDF Formats**: Supports
  [Turtle (`.ttl`)](https://www.w3.org/TR/turtle/),
  [N-Triples (`.nt`)](https://www.w3.org/TR/n-triples/),
  [N-Quads (`.nq`)](https://www.w3.org/TR/n-quads/),
  [RDF/XML (`.rdf`)](https://www.w3.org/TR/rdf-syntax-grammar/),
  [JSON-LD (`.jsonld`)](https://www.w3.org/TR/json-ld/), and
  [TriG (`.trig`)](https://www.w3.org/TR/trig/)
- **TypeScript Support**: Full TypeScript definitions included
- **RDF.js Compatible**: Uses standard [RDF.js](https://rdf.js.org) parsers and
  serializers
- **Webpack Integration**: Seamless integration with webpack-based build systems
- **Zero Assumptions**: Generic loader that works with any RDF vocabulary or
  ontology

> **Note**: This loader is designed for webpack and is not compatible with
> Turbopack. If you need to use this loader, please use webpack instead of
> Turbopack in your Next.js configuration.

## Installation

```bash
npm install --save-dev @dataroadinc/rdf-loader
# or
yarn add --dev @dataroadinc/rdf-loader
# or
pnpm add -D @dataroadinc/rdf-loader
```

## Usage

### 1. Configure Webpack

Add the loader to your webpack configuration:

```javascript
// webpack.config.js or next.config.mjs
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ttl|nt|nq|rdf|jsonld|trig)$/,
        use: ["@dataroadinc/rdf-loader"],
      },
    ],
  },
}
```

### 2. TypeScript Configuration

Add type declarations to your `global.d.ts` or similar:

```typescript
declare module "*.ttl" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}

declare module "*.nt" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}

declare module "*.nq" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}

declare module "*.rdf" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}

declare module "*.jsonld" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}

declare module "*.trig" {
  import { DataFactory, Quad } from "@rdfjs/types"
  export default function (factory: DataFactory): Quad[]
}
```

### 3. Import RDF Files

```typescript
import rdfFactory from "rdf-ext"
import storyQuadsFunction from "./story.ttl"

// Load the RDF data
const quads = storyQuadsFunction({ factory: rdfFactory })
const dataset = rdfFactory.dataset(quads)

// Now you can work with the RDF dataset
for (const quad of dataset) {
  console.log(
    `${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`
  )
}
```

## Dependencies

This package depends on:

- `@rdfjs/formats-common`: For parsing various RDF formats
- `@rdfjs/serializer-rdfjs`: For serializing RDF to JavaScript
- `string-to-stream`: For converting string content to streams

## Example RDF File

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.org/> .

ex:Person
  a rdfs:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
