import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

export interface TestRdfFile {
  name: string
  content: string
}

export interface TestProjectConfig {
  useTurbopack?: boolean
  useNextJs?: boolean
  rdfFiles: TestRdfFile[]
  webpackConfig?: string
  nextConfig?: string
  packageJson?: Record<string, any>
}

export class TestProjectBuilder {
  private tempDir: string
  private testProjectDir: string

  constructor() {
    this.tempDir = join(tmpdir(), `rdf-loader-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    this.testProjectDir = join(this.tempDir, "test-project")
    mkdirSync(this.testProjectDir, { recursive: true })
  }

  get projectDir(): string {
    return this.testProjectDir
  }

  createProject(config: TestProjectConfig): void {
    this.createPackageJson(config)
    this.createConfigFiles(config)
    this.createSourceFiles(config)
  }

  private createPackageJson(config: TestProjectConfig): void {
    const packageJson = {
      name: "test-project",
      version: "0.0.1",
      private: true,
      scripts: {
        dev: config.useTurbopack 
          ? "next dev --turbo" 
          : config.useNextJs 
          ? "next dev" 
          : "webpack serve --mode development",
        build: config.useNextJs ? "next build" : "webpack --mode production",
        start: config.useNextJs ? "next start" : "webpack serve --mode production",
      },
      dependencies: {
        ...(config.useNextJs
          ? {
              next: "^15.0.0",
              react: "^18.0.0",
              "react-dom": "^18.0.0",
            }
          : {}),
        "@dataroadinc/rdf-loader": "file:../..",
        ...(config.packageJson?.dependencies || {}),
      },
      devDependencies: {
        ...(config.useNextJs
          ? {
              "@types/node": "^20.0.0",
              "@types/react": "^18.0.0",
              "@types/react-dom": "^18.0.0",
              typescript: "^5.0.0",
            }
          : {
              webpack: "^5.0.0",
              "webpack-cli": "^5.0.0",
              "webpack-dev-server": "^5.0.0",
              "html-webpack-plugin": "^5.0.0",
              typescript: "^5.0.0",
              "ts-loader": "^9.0.0",
              "@types/node": "^20.0.0",
            }),
        ...(config.packageJson?.devDependencies || {}),
      },
    }

    writeFileSync(
      join(this.testProjectDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    )
  }

  private createConfigFiles(config: TestProjectConfig): void {
    if (config.useNextJs) {
      this.createNextConfig(config)
      this.createTsConfig(true)
    } else {
      this.createWebpackConfig(config)
      this.createTsConfig(false)
    }
  }

  private createNextConfig(config: TestProjectConfig): void {
    const nextConfig = config.nextConfig || `
module.exports = {
  ${config.useTurbopack ? `
  experimental: {
    turbo: {
      rules: {
        '*.ttl': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        },
        '*.nt': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        },
        '*.nq': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        },
        '*.rdf': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        },
        '*.jsonld': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        },
        '*.trig': {
          loaders: ['@dataroadinc/rdf-loader'],
          as: '*.js'
        }
      }
    }
  }` : `
  webpack: (config) => {
    config.module.rules.push({
      test: /\\.(ttl|nt|nq|rdf|jsonld|trig)$/,
      use: [{
        loader: '@dataroadinc/rdf-loader',
        options: { verbose: true }
      }]
    })
    return config
  }`}
}
`
    writeFileSync(join(this.testProjectDir, "next.config.js"), nextConfig)
  }

  private createWebpackConfig(config: TestProjectConfig): void {
    const webpackConfig = config.webpackConfig || `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.(ttl|nt|nq|rdf|jsonld|trig)$/,
        use: [{
          loader: '@dataroadinc/rdf-loader',
          options: { verbose: true }
        }]
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    static: './dist',
    hot: true,
  },
};
`
    writeFileSync(join(this.testProjectDir, "webpack.config.js"), webpackConfig)
  }

  private createTsConfig(isNextJs: boolean): void {
    const tsconfig = isNextJs
      ? {
          compilerOptions: {
            target: "ES2020",
            lib: ["dom", "dom.iterable", "es6"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [
              {
                name: "next",
              },
            ],
            paths: {
              "@/*": ["./src/*"],
            },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        }
      : {
          compilerOptions: {
            target: "ES2020",
            module: "commonjs",
            lib: ["dom", "es6"],
            allowJs: true,
            outDir: "./dist",
            rootDir: "./src",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
          },
          include: ["src/**/*"],
          exclude: ["node_modules"],
        }

    writeFileSync(
      join(this.testProjectDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    )
  }

  private createSourceFiles(config: TestProjectConfig): void {
    // Create src directory
    mkdirSync(join(this.testProjectDir, "src"), { recursive: true })

    // Create RDF files
    config.rdfFiles.forEach(({ name, content }) => {
      writeFileSync(join(this.testProjectDir, "src", name), content)
    })

    if (config.useNextJs) {
      this.createNextJsFiles(config)
    } else {
      this.createWebpackFiles(config)
    }
  }

  private createNextJsFiles(config: TestProjectConfig): void {
    // Create a test page that imports RDF files
    const testPage = `
import { useEffect } from 'react'

// Import RDF files
${config.rdfFiles
  .map(({ name }) => {
    const importName = name.replace(/[^a-zA-Z0-9]/g, "_")
    return `import ${importName} from './${name}'`
  })
  .join("\n")}

export default function TestPage() {
  useEffect(() => {
    console.log('RDF modules loaded:')
${config.rdfFiles
  .map(({ name }) => {
    const importName = name.replace(/[^a-zA-Z0-9]/g, "_")
    return `    console.log('${name}:', ${importName})`
  })
  .join("\n")}
  }, [])

  return (
    <div>
      <h1>RDF Loader Test</h1>
      <p>Check console for loaded RDF modules</p>
    </div>
  )
}
`

    writeFileSync(join(this.testProjectDir, "src", "page.tsx"), testPage)

    // Create app directory structure for Next.js 13+
    mkdirSync(join(this.testProjectDir, "src", "app"), { recursive: true })
    writeFileSync(
      join(this.testProjectDir, "src", "app", "layout.tsx"),
      `
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RDF Loader Test',
  description: 'Testing RDF loader',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
    )

    writeFileSync(
      join(this.testProjectDir, "src", "app", "page.tsx"),
      testPage
    )
  }

  private createWebpackFiles(config: TestProjectConfig): void {
    // Create index.ts
    const indexTs = `
// Import RDF files
${config.rdfFiles
  .map(({ name }) => {
    const importName = name.replace(/[^a-zA-Z0-9]/g, "_")
    return `import ${importName} from './${name}'`
  })
  .join("\n")}

console.log('RDF modules loaded:')
${config.rdfFiles
  .map(({ name }) => {
    const importName = name.replace(/[^a-zA-Z0-9]/g, "_")
    return `console.log('${name}:', ${importName})`
  })
  .join("\n")}

// Create a simple DOM element to show the modules are loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  if (app) {
    app.innerHTML = '<h1>RDF Loader Test</h1><p>Check console for loaded RDF modules</p>'
  }
})
`

    writeFileSync(join(this.testProjectDir, "src", "index.ts"), indexTs)

    // Create index.html
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>RDF Loader Test</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
`

    writeFileSync(join(this.testProjectDir, "src", "index.html"), indexHtml)
  }

  cleanup(): void {
    try {
      if (existsSync(this.tempDir)) {
        rmSync(this.tempDir, { recursive: true, force: true })
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export const createTestRdfFiles = {
  turtle: (content: string): TestRdfFile => ({
    name: "test.ttl",
    content,
  }),
  ntriples: (content: string): TestRdfFile => ({
    name: "test.nt",
    content,
  }),
  jsonld: (content: string): TestRdfFile => ({
    name: "test.jsonld",
    content,
  }),
  rdfxml: (content: string): TestRdfFile => ({
    name: "test.rdf",
    content,
  }),
  trig: (content: string): TestRdfFile => ({
    name: "test.trig",
    content,
  }),
  nquads: (content: string): TestRdfFile => ({
    name: "test.nq",
    content,
  }),
}

export const sampleRdfContent = {
  turtle: `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.org/> .

ex:Person
  a rdfs:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .`,

  ntriples: `<http://example.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> .`,

  jsonld: `{"@context": {"ex": "http://example.org/"}, "@id": "http://example.org/Person", "@type": "ex:Person"}`,

  rdfxml: `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.org/">
  <ex:Person rdf:about="http://example.org/Person"/>
</rdf:RDF>`,

  trig: `@prefix ex: <http://example.org/> .
<http://example.org/graph> {
  ex:Person a ex:Person .
}`,

  nquads: `<http://example.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> <http://example.org/graph> .`,

  malformed: `@prefix ex: <http://example.org/> .
ex:Person a ex:Person
# Missing period at end`,
} 