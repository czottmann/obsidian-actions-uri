import * as http from "http";
import { URL } from "url";

interface CallbackData {
  success?: any;
  error?: any;
}

export class CallbackServer {
  private server: http.Server;
  private callbackData: CallbackData | null = null;
  private resolve: ((data: CallbackData) => void) | null = null;
  private reject: ((error: Error) => void) | null = null;

  constructor(private port: number) {
    this.server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${this.port}`);
      const params = Object.fromEntries(url.searchParams.entries());

      if (url.pathname === "/callback") {
        this.callbackData = params;
        if (this.resolve) {
          this.resolve(this.callbackData);
          this.reset();
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Callback received");
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`Callback server listening on port ${this.port}`);
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
          console.log("Callback server stopped");
          resolve();
        }
      });
    });
  }

  waitForCallback(timeout = 10000): Promise<CallbackData> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      // this.reject = reject; // We'll handle timeout separately

      const timer = setTimeout(() => {
        this.reset();
        reject(new Error("Callback timeout"));
      }, timeout);

      // Override resolve to clear the timer
      const originalResolve = resolve;
      this.resolve = (data) => {
        clearTimeout(timer);
        originalResolve(data);
        this.reset(); // Reset after resolving
      };
    });
  }

  private reset() {
    this.callbackData = null;
    this.resolve = null;
    this.reject = null; // Keep reject null as timeout handles rejection
  }
}

// Example usage (for testing the server itself)
// if (require.main === module) {
//   const server = new CallbackServer(3000);
//   server.start().then(() => {
//     console.log('Server started. Send a request to http://localhost:3000/callback?success=true');
//     // server.waitForCallback().then((data) => {
//     //   console.log('Received callback data:', data);
//     //   server.stop();
//     // });
//   }).catch(console.error);
// }
