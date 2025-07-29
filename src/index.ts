import { parsers } from "@rdfjs/formats-common"
import { default as Serializer } from "@rdfjs/serializer-rdfjs"
import { extname } from "path"
import toStream from "string-to-stream"

// Webpack loader context interface
interface LoaderContext {
  resourcePath: string
  async(): (error: Error | null, result: string) => void
  options?: LoaderOptions
}

interface LoaderOptions {
  failOnError?: boolean
  verbose?: boolean
  format?: string
}

const extensions: Record<string, string> = {
  json: "application/ld+json",
  jsonld: "application/ld+json",
  nq: "application/n-quads",
  nt: "application/n-triples",
  n3: "text/turtle",
  trig: "application/trig",
  rdf: "application/rdf+xml",
  ttl: "text/turtle",
}

export default async function loader(
  this: LoaderContext,
  source: string
): Promise<void> {
  const callback = this.async()
  const options = this.options || {}
  const { failOnError = false, verbose = false } = options

  const extension = extname(this.resourcePath).split(".").pop()
  const mediaType = extensions[extension || ""]

  Promise.resolve().then(async () => {
    if (verbose) {
      console.log("rdf-loader: loading " + this.resourcePath)
    }

    try {
      const serializer = new Serializer({
        module: "commonjs",
      })
      const quadStream = parsers.import(mediaType, toStream(source))
      const outputStream = serializer.import(quadStream)

      outputStream.on("data", (code: string) => {
        callback(null, code)
      })

      outputStream.on("error", (error: Error) => {
        const errorMessage = `rdf-loader: parsing error in ${this.resourcePath}: ${error.message}`

        if (verbose) {
          console.warn(errorMessage)
        }

        if (failOnError) {
          callback(new Error(errorMessage), "")
        } else {
          callback(null, "module.exports = function(factory) { return []; };")
        }
      })

      outputStream.on("end", () => {
        // Stream completed successfully
      })
    } catch (error) {
      const errorMessage = `rdf-loader: error processing ${this.resourcePath}: ${error instanceof Error ? error.message : String(error)}`

      if (verbose) {
        console.warn(errorMessage)
      }

      if (failOnError) {
        callback(new Error(errorMessage), "")
      } else {
        callback(null, "module.exports = function(factory) { return []; };")
      }
    }
  })
}
