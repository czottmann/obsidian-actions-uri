import * as http from "http";
import { URL } from "url";

const TEST_PORT = 3000;

interface CallbackData {
  success?: any;
  error?: any;
}

export class CallbackServer {
  private server: http.Server;
  private callbackData: CallbackData | null = null;
  private resolve: ((data: CallbackData) => void) | null = null;
  private reject: ((error: Error) => void) | null = null;

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${TEST_PORT}`);
      const params = Object.fromEntries(url.searchParams.entries());

      if (url.pathname === "/success") {
        this.callbackData = { success: params };
        if (this.resolve) {
          this.resolve(this.callbackData);
          this.reset();
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Success callback received");
      } else if (url.pathname === "/failure") {
        this.callbackData = { error: params };
        if (this.resolve) {
          this.resolve(this.callbackData);
          this.reset();
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Failure callback received");
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(TEST_PORT, () => {
        console.log(`- Callback server listening on port ${TEST_PORT}`);
        resolve();
      });
      this.server.on("error", reject);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("- Callback server stopped");
          resolve();
        }
      });
    });
  }

  waitForCallback(timeout = 5000): Promise<CallbackData> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const timer = setTimeout(() => {
        this.reset();
        reject(new Error("Callback timeout"));
      }, timeout);

      // Override resolve and reject to clear the timer
      const originalResolve = resolve;
      const originalReject = reject;

      this.resolve = (data) => {
        clearTimeout(timer);
        originalResolve(data);
        this.reset(); // Reset after resolving
      };

      this.reject = (error) => {
        clearTimeout(timer);
        originalReject(error);
        this.reset(); // Reset after rejecting
      };
    });
  }

  private reset() {
    this.callbackData = null;
    this.resolve = null;
    this.reject = null;
  }
}
