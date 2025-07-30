process.on("beforeExit", () => {
  console.log("⚠️ Process still has pending operations (event loop not empty)")
})

process.on("exit", () => {
  console.log("✅ Vitest exited cleanly")
})
