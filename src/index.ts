import { parsers } from "@rdfjs/formats-common"
import { default as Serializer } from "@rdfjs/serializer-rdfjs"
import { extname } from "path"
import toStream from "string-to-stream"

// Webpack loader context interface
interface LoaderContext {
  resourcePath: string
  async(): (error: Error | null, result: string) => void
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

  const extension = extname(this.resourcePath).split(".").pop()
  const mediaType = extensions[extension || ""]

  Promise.resolve().then(async () => {
    try {
      console.log("rdf-loader: loading " + this.resourcePath)
      // const Serializer = (await import('@rdfjs/serializer-rdfjs')).default
      const serializer = new Serializer({
        module: "commonjs",
      })
      // Get the N3StreamParser for the given RDF file we just loaded (source)
      const quadStream = parsers.import(mediaType, toStream(source))
      const outputStream = serializer.import(quadStream)

      outputStream.on("data", (code: string) => {
        // console.log('rdf-loader: ' + this.resourcePath + ':\n' + code)
        callback(null, code)
      })

      outputStream.on("error", (error: Error) => {
        console.warn(
          `rdf-loader: parsing error in ${this.resourcePath}:`,
          error.message
        )
        // Return empty module on parsing error
        callback(null, "module.exports = function(factory) { return []; };")
      })

      outputStream.on("end", () => {
        // console.log('rdf-loader: loaded ' + this.resourcePath)
      })
    } catch (error) {
      console.warn(
        `rdf-loader: error processing ${this.resourcePath}:`,
        error instanceof Error ? error.message : String(error)
      )
      // Return empty module on any error
      callback(null, "module.exports = function(factory) { return []; };")
    }
  })
}
