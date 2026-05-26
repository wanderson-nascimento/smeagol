// Stub for posthog-node in the renderer bundle (Node-only module).
export class AsyncLocalStorage {
  run(_store, callback, ...args) {
    return callback(...args);
  }

  getStore() {
    return undefined;
  }

  disable() {}

  enterWith() {}

  exit() {}
}
