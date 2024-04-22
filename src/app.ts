import express, { Request, Response, NextFunction } from "express";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import axios from "axios";
import https from "https";
import os from "os";
import { encode } from "gpt-3-encoder";
import { randomUUID, randomInt, createHash } from "crypto";
import { config } from "dotenv";

config();

// Constants for the server and API configuration
const port = process.env.SERVER_PORT || 3040;
const baseUrl = "https://chat.openai.com";
const apiUrl = `${baseUrl}/backend-anon/conversation`;
const refreshInterval = 60000; // Interval to refresh token in ms
const errorWait = 120000; // Wait time in ms after an error
const newSessionRetries: number =
  parseInt(process.env.NEW_SESSION_RETRIES) || 5; // Number of retries to get a new session
const userAgent =
  process.env.USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const authKey: string =
  process.env.API_KEY || null;  // Authorized client apiKey

let cloudflared: ChildProcessWithoutNullStreams;

// Type definition for the session object
type Session = {
  deviceId: string;
  persona: string;
  arkose: {
    required: boolean;
    dx: any;
  };
  turnstile: {
    required: boolean;
  };
  proofofwork: {
    required: boolean;
    seed: string;
    difficulty: string;
  };
  token: string;
};

// Function to wait for a specified duration
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function GenerateCompletionId(prefix: string = "cmpl-") {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 28;

  for (let i = 0; i < length; i++) {
    prefix += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return prefix;
}

async function* chunksToLines(chunksAsync: any) {
  let previous = "";
  for await (const chunk of chunksAsync) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    previous += bufferChunk;
    let eolIndex: number;
    while ((eolIndex = previous.indexOf("\n")) >= 0) {
      // line includes the EOL
      const line = previous.slice(0, eolIndex + 1).trimEnd();
      if (line === "data: [DONE]") break;
      if (line.startsWith("data: ")) yield line;
      previous = previous.slice(eolIndex + 1);
    }
  }
}

async function* linesToMessages(linesAsync: any) {
  for await (const line of linesAsync) {
    const message = line.substring("data :".length);

    yield message;
  }
}

async function* StreamCompletion(data: any) {
  yield* linesToMessages(chunksToLines(data));
}

// Setup axios instance for API requests with predefined configurations
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  proxy:
    process.env.PROXY === "true"
      ? {
          host: process.env.PROXY_HOST,
          port: Number(process.env.PROXY_PORT),
          auth:
            process.env.PROXY_AUTH === "true"
              ? {
                  username: process.env.PROXY_USERNAME,
                  password: process.env.PROXY_PASSWORD,
                }
              : undefined,
          protocol: process.env.PROXY_PROTOCOL,
        }
      : false,
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "oai-language": "en-US",
    origin: baseUrl,
    pragma: "no-cache",
    referer: baseUrl,
    "sec-ch-ua":
      '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": userAgent,
  },
});

// Generate a proof token for the OpenAI API
function GenerateProofToken(
  seed: string,
  diff: string,
  userAgent: string
): string {
  const cores: number[] = [8, 12, 16, 24];
  const screens: number[] = [3000, 4000, 6000];

  const core = cores[randomInt(0, cores.length)];
  const screen = screens[randomInt(0, screens.length)];

  const now = new Date(Date.now() - 8 * 3600 * 1000);
  const parseTime = now.toUTCString().replace("GMT", "GMT-0500 (Eastern Time)");

  const config = [core + screen, parseTime, 4294705152, 0, userAgent];

  const diffLen = diff.length / 2;

  for (let i = 0; i < 100000; i++) {
    config[3] = i;
    const jsonData = JSON.stringify(config);
    const base = Buffer.from(jsonData).toString("base64");
    const hashValue = createHash("sha3-512")
      .update(seed + base)
      .digest();

    if (hashValue.toString("hex").substring(0, diffLen) <= diff) {
      const result = "gAAAAAB" + base;
      return result;
    }
  }

  const fallbackBase = Buffer.from(`"${seed}"`).toString("base64");
  return "gAAAAABwQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D" + fallbackBase;
}

// Function to get a new session ID and token from the OpenAI API
async function getNewSession(retries: number = 0): Promise<Session> {
  let newDeviceId = randomUUID();
  try {
    const response = await axiosInstance.post(
      `${baseUrl}/backend-anon/sentinel/chat-requirements`,
      {},
      {
        headers: { "oai-device-id": newDeviceId },
      }
    );

    let session: Session = response.data as Session;
    session.deviceId = newDeviceId;

    return session;
  } catch (error) {
    await wait(500);
    return retries < newSessionRetries ? getNewSession(retries + 1) : null;
  }
}

// Middleware to enable CORS and handle pre-flight requests
function enableCORS(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
}

// Middleware to handle chat completions
async function handleChatCompletion(req: Request, res: Response) {
  // If .env sets API_KEY and is not empty, the apiKey of req.headers will be verified.
  if (authKey) {
    const clientApiKey = req.headers.authorization?.split(' ')[1] ?? "null";
    if (!clientApiKey || clientApiKey != authKey) {
      console.log(
        "Request:",
        `${req.method} ${req.originalUrl}`,
        `${req.body?.messages?.length ?? 0} messages`,
        `ClientKey: ${clientApiKey} Verify Failed!`
      );

      res.write(
        JSON.stringify({
          status: false,
          error: {
            message: `Incorrect API key provided: ${clientApiKey}, Authorized access only!`,
            type: "invalid_request_error",
            code: "invalid_api_key"
          },
          support: "https://discord.pawan.krd",
        })
      );
      return res.end();
    }
  }

  console.log(
    "Request:",
    `${req.method} ${req.originalUrl}`,
    `${req.body?.messages?.length ?? 0} messages`,
    req.body.stream ? "(stream-enabled)" : "(stream-disabled)"
  );
  try {
    let session = await getNewSession();

    if (!session) {
      console.error("Error getting a new session...");
      console.error("If this error persists, your country may not be supported yet.");
      console.error("If your country was the issue, please consider using a U.S. VPN or a U.S. residential proxy.");
      res.write(
        JSON.stringify({
          status: false,
          error: {
            message: `Error getting a new session, If this error persists, your country may not be supported yet. If your country was the issue, please consider using a U.S. VPN or a U.S. residential proxy.`,
            type: "invalid_request_error",
          },
          support: "https://discord.pawan.krd",
        })
      );

      return res.end();
    }

    let proofToken = GenerateProofToken(
      session.proofofwork.seed,
      session.proofofwork.difficulty,
      userAgent
    );

    const body = {
      action: "next",
      messages: req.body.messages.map(
        (message: { role: any; content: any }) => ({
          author: { role: message.role },
          content: { content_type: "text", parts: [message.content] },
        })
      ),
      parent_message_id: randomUUID(),
      model: "text-davinci-002-render-sha",
      timezone_offset_min: -180,
      suggestions: [],
      history_and_training_disabled: true,
      conversation_mode: { kind: "primary_assistant" },
      websocket_request_id: randomUUID(),
    };

    let promptTokens = 0;
    let completionTokens = 0;

    for (let message of req.body.messages) {
      promptTokens += encode(message.content).length;
    }

    const response = await axiosInstance.post(apiUrl, body, {
      responseType: "stream",
      headers: {
        "oai-device-id": session.deviceId,
        "openai-sentinel-chat-requirements-token": session.token,
        "openai-sentinel-proof-token": proofToken,
      },
    });

    // Set the response headers based on the request type
    if (req.body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    let fullContent = "";
    let requestId = GenerateCompletionId("chatcmpl-");
    let created = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    let finish_reason = null;
    let error: string;

    for await (const message of StreamCompletion(response.data)) {
      // Skip heartbeat detection
      if (message.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{6}$/))
        continue;

      const parsed = JSON.parse(message);

      if (parsed.error) {
        error = `Error message from OpenAI: ${parsed.error}`;
        finish_reason = "stop";
        break;
      }

      let content = parsed?.message?.content?.parts[0] ?? "";
      let status = parsed?.message?.status ?? "";

      for (let message of req.body.messages) {
        if (message.content === content) {
          content = "";
          break;
        }
      }

      switch (status) {
        case "in_progress":
          finish_reason = null;
          break;
        case "finished_successfully":
          let finish_reason_data =
            parsed?.message?.metadata?.finish_details?.type ?? null;
          switch (finish_reason_data) {
            case "max_tokens":
              finish_reason = "length";
              break;
            case "stop":
            default:
              finish_reason = "stop";
          }
          break;
        default:
          finish_reason = null;
      }

      if (content === "") continue;

      let completionChunk = content.replace(fullContent, "");

      completionTokens += encode(completionChunk).length;

      if (req.body.stream) {
        let response = {
          id: requestId,
          created: created,
          object: "chat.completion.chunk",
          model: "gpt-3.5-turbo",
          choices: [
            {
              delta: {
                content: completionChunk,
              },
              index: 0,
              finish_reason: finish_reason,
            },
          ],
        };

        res.write(`data: ${JSON.stringify(response)}\n\n`);
      }

      fullContent = content.length > fullContent.length ? content : fullContent;
    }

    if (req.body.stream) {
      res.write(
        `data: ${JSON.stringify({
          id: requestId,
          created: created,
          object: "chat.completion.chunk",
          model: "gpt-3.5-turbo",
          choices: [
            {
              delta: {
                content: error ?? "",
              },
              index: 0,
              finish_reason: finish_reason,
            },
          ],
        })}\n\n`
      );
    } else {
      res.write(
        JSON.stringify({
          id: requestId,
          created: created,
          model: "gpt-3.5-turbo",
          object: "chat.completion",
          choices: [
            {
              finish_reason: finish_reason,
              index: 0,
              message: {
                content: error ?? fullContent,
                role: "assistant",
              },
            },
          ],
          usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens,
          },
        })
      );
    }

    res.end();
  } catch (error: any) {
    // console.log("Error:", error.response?.data ?? error.message);
    if (!res.headersSent) res.setHeader("Content-Type", "application/json");
    // console.error("Error handling chat completion:", error);
    res.write(
      JSON.stringify({
        status: false,
        error: {
          message:
            "An error occurred. please try again. Additionally, ensure that your request complies with OpenAI's policy.",
          type: "invalid_request_error",
        },
        support: "https://discord.pawan.krd",
      })
    );
    res.end();
  }
}

// Initialize Express app and use middlewares
const app = express();
app.use(bodyParser.json());
app.use(enableCORS);

// Route to handle POST requests for chat completions
app.post("/v1/chat/completions", handleChatCompletion);

// 404 handler for unmatched routes
app.use((req, res) =>
  res.status(404).send({
    status: false,
    error: {
      message: `The requested endpoint (${req.method.toLocaleUpperCase()} ${
        req.path
      }) was not found. please make sure to use "http://localhost:3040/v1" as the base URL.`,
      type: "invalid_request_error",
    },
    support: "https://discord.pawan.krd",
  })
);

async function DownloadCloudflared(): Promise<string> {
  const platform = os.platform();
  let url: string;

  if (platform === "win32") {
    const arch = os.arch() === "x64" ? "amd64" : "386";
    url = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-${arch}.exe`;
  } else {
    let arch = os.arch();
    switch (arch) {
      case "x64":
        arch = "amd64";
        break;
      case "arm":
      case "arm64":
        break;
      default:
        arch = "amd64"; // Default to amd64 if unknown architecture
    }
    const platformLower = platform.toLowerCase();
    url = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${platformLower}-${arch}`;
  }

  const fileName = platform === "win32" ? "cloudflared.exe" : "cloudflared";
  const filePath = path.resolve(fileName);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  try {
    const response = await axiosInstance({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
      writer.on("finish", () => {
        if (platform !== "win32") {
          fs.chmodSync(filePath, 0o755);
        }
        resolve(filePath);
      });

      writer.on("error", reject);
    });
  } catch (error: any) {
    // console.error("Failed to download file:", error.message);
    return null;
  }
}

async function StartCloudflaredTunnel(
  cloudflaredPath: string
): Promise<string> {
  if (!cloudflaredPath) {
    console.error("Failed to download Cloudflared executable.");
    return null;
  }

  const localUrl = `http://localhost:${port}`;
  return new Promise<string>((resolve, reject) => {
    cloudflared = spawn(cloudflaredPath, ["tunnel", "--url", localUrl]);

    cloudflared.stdout.on("data", (data: any) => {
      const output = data.toString();
      // console.log("Cloudflared Output:", output);

      // Adjusted regex to specifically match URLs that end with .trycloudflare.com
      const urlMatch = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
      if (urlMatch) {
        let url = urlMatch[0];
        resolve(url);
      }
    });

    cloudflared.stderr.on("data", (data: any) => {
      const output = data.toString();
      // console.error("Error from cloudflared:", output);

      const urlMatch = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
      if (urlMatch) {
        let url = urlMatch[0];
        resolve(url);
      }
    });

    cloudflared.on("close", (code: any) => {
      resolve(null);
      // console.log(`Cloudflared tunnel process exited with code ${code}`);
    });
  });
}

// Start the server and the session ID refresh loop
app.listen(port, async () => {
  if (process.env.CLOUDFLARED === undefined) process.env.CLOUDFLARED = "true";
  let cloudflared = process.env.CLOUDFLARED === "true";
  let filePath: string;
  let publicURL: string;
  if (cloudflared) {
    filePath = await DownloadCloudflared();
    publicURL = await StartCloudflaredTunnel(filePath);
  }

  console.log(`💡 Server is running at http://localhost:${port}`);
  console.log();
  console.log(`🔗 Local Base URL: http://localhost:${port}/v1`);
  console.log(
    `🔗 Local Endpoint: http://localhost:${port}/v1/chat/completions`
  );
  console.log();
  if (cloudflared && publicURL)
    console.log(`🔗 Public Base URL: ${publicURL}/v1`);
  if (cloudflared && publicURL)
    console.log(`🔗 Public Endpoint: ${publicURL}/v1/chat/completions`);
  else if (cloudflared && !publicURL) {
    console.log(
      "🔗 Public Endpoint: (Failed to start cloudflared tunnel, please restart the server.)"
    );
    if (filePath) fs.unlinkSync(filePath);
  }
  if (cloudflared && publicURL) console.log();
  console.log("📝 Author: Pawan.Krd");
  console.log(`🌐 Discord server: https://discord.gg/pawan`);
  console.log("🌍 GitHub Repository: https://github.com/PawanOsman/ChatGPT");
  console.log(
    `💖 Don't forget to star the repository if you like this project!`
  );
});
