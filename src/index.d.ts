import { DataFactory, Quad } from "@rdfjs/types"

declare function loader(source: string): void

export default loader

// Type declarations for RDF file imports
declare module "*.ttl" {
  export default function (factory: DataFactory): Quad[]
}

declare module "*.nt" {
  export default function (factory: DataFactory): Quad[]
}

declare module "*.nq" {
  export default function (factory: DataFactory): Quad[]
}

declare module "*.rdf" {
  export default function (factory: DataFactory): Quad[]
}

declare module "*.jsonld" {
  export default function (factory: DataFactory): Quad[]
}

declare module "*.trig" {
  export default function (factory: DataFactory): Quad[]
}
