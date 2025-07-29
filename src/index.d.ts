import { DataFactory, Quad } from "@rdfjs/types"

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

// Export the loader function for direct usage
export default function loader(source: string): void
