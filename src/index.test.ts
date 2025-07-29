import { describe, expect, it } from "vitest"
import loader from "./index.js"

describe("@dataroadinc/rdf-loader", () => {
  it("should process Turtle files correctly", async () => {
    const mockContext = {
      resourcePath: "/test/path/example.ttl",
      async: () => (error: Error | null, result: string) => {
        expect(error).toBeNull()
        expect(result).toContain("module.exports")
        expect(result).toContain("factory")
      },
    }

    const testTurtle = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.org/> .

ex:Person
  a rdfs:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .
`

    await loader.call(mockContext, testTurtle)
  })

  it("should handle different file extensions", async () => {
    const testContents = {
      ttl: `@prefix ex: <http://example.org/> .
ex:Person a ex:Person .`,
      nt: `<http://example.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> .`,
      nq: `<http://example.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> <http://example.org/graph> .`,
      rdf: `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.org/">
  <ex:Person rdf:about="http://example.org/Person"/>
</rdf:RDF>`,
      jsonld: `{"@context": {"ex": "http://example.org/"}, "@id": "http://example.org/Person", "@type": "ex:Person"}`,
      trig: `@prefix ex: <http://example.org/> .
<http://example.org/graph> {
  ex:Person a ex:Person .
}`,
    }

    for (const [ext, content] of Object.entries(testContents)) {
      const mockContext = {
        resourcePath: `/test/path/example.${ext}`,
        async: () => (error: Error | null, result: string) => {
          expect(error).toBeNull()
          expect(result).toContain("module.exports")
        },
      }

      await loader.call(mockContext, content)
    }
  })

  it("should handle empty files", async () => {
    const mockContext = {
      resourcePath: "/test/path/empty.ttl",
      async: () => (error: Error | null, result: string) => {
        expect(error).toBeNull()
        expect(result).toContain("module.exports")
      },
    }

    await loader.call(mockContext, "")
  })

  it("should handle malformed RDF gracefully", async () => {
    const mockContext = {
      resourcePath: "/test/path/malformed.ttl",
      async: () => (error: Error | null, result: string) => {
        // Should still generate code even with malformed input
        expect(result).toContain("module.exports")
      },
    }

    const malformedTurtle = `
@prefix ex: <http://example.org/> .
ex:Person a ex:Person
# Missing period at end
`

    await loader.call(mockContext, malformedTurtle)
  })
})
