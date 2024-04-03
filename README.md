# ChatGPT API Free Reverse Proxy

Welcome to the **ChatGPT API Free Reverse Proxy** project, a complimentary resource allowing seamless access to OpenAI's API. This project mirrors the official OpenAI API endpoints, enabling users to leverage OpenAI functionalities without direct cost. Dive into our documentation to discover how to set up your reverse proxy or connect with our hosted service for an even smoother experience.

## Quick Links

- [Join our Discord Community](https://discord.pawan.krd) for support and questions.

## Table of Contents

- [Features](#features)
- Option 1: [Installing/Self-Hosting Guide](#self-hosting-guide) (Without using any API key)
  - [Your PC/Server](#your-pcserver)
  - [Termux on Android Phones](#termux-on-android-phones)
- Option 2: [Accessing Our Hosted API](#accessing-our-hosted-api) (Free)
- [Usage Examples](#usage-examples)
- [License](#license)

## Features

- **Streaming Response**: The API supports streaming response, so you can get the response as soon as it's available.
- **API Endpoint Compatibility**: Full alignment with official OpenAI API endpoints, ensuring hassle-free integration with existing OpenAI libraries.
- **Complimentary Access**: No charges for API usage, making advanced AI accessible to everyone even **without an API key**.

## Installing/Self-Hosting Guide

### Your PC/Server

To install and run the ChatGPT API Reverse Proxy on your PC/Server by following these steps:

Note: This option is not available to all countries yet. if you are from a country that is not supported, you can use a **U.S. VPN** or use **our hosted API**.

1. Ensure NodeJs (v19+) is installed: [Download NodeJs](https://nodejs.org/en/download)
2. Clone this repository:
   ```bash
   git clone https://github.com/PawanOsman/ChatGPT.git
   ```
3. Open `start.bat` (Windows) or `start.sh` (Linux with `bash start.sh` command) to install dependencies and launch the server.
4. Done, you can connect to your local server's API at:
   ```
   http://localhost:3040/v1/chat/completions
   ```
   Note that the base url will be `http://localhost:3040/v1`

To include installation instructions for Termux on Android devices, you can add the following section right after the instructions for Linux in the **Installing/Self-Hosting Guide**:

### Termux on Android Phones

To install and run the ChatGPT API Reverse Proxy on Android using Termux, follow these steps:

1. Install [Termux](https://play.google.com/store/apps/details?id=com.termux) from the Play Store.
2. Update Termux packages:
   ```bash
   apt update
   ```
3. Upgrade Termux packages:
   ```bash
   apt upgrade
   ```
4. Install git, Node.js, and npm:
   ```bash
   apt install -y git nodejs
   ```
5. Clone the repository:
   ```bash
   git clone https://github.com/PawanOsman/ChatGPT.git
   ```
6. Navigate to the cloned directory:
   ```bash
   cd ChatGPT
   ```
7. Start the server with:

   ```bash
   bash start.sh
   ```

8. Your local server will now be running and accessible at:

   ```
   http://localhost:3040/v1/chat/completions
   ```

   Note that the base url will be `http://localhost:3040/v1`

   You can now use this address to connect to your self-hosted ChatGPT API Reverse Proxy from Android applications/websites that support reverse proxy configurations, on the same device.

## Accessing Our Hosted API

Utilize our pre-hosted ChatGPT-like API for free by:

1. Joining our [Discord server](https://discord.pawan.krd).
2. Obtaining an API key from the `#Bot` channel with the `/key` command.
3. Incorporating the API key into your requests to:
   ```
   https://api.pawan.krd/v1/chat/completions
   ```

## Usage Examples

Leverage the same integration code as OpenAI's official libraries by simply adjusting the API key and base URL in your requests. For self-hosted setups, ensure to switch the base URL to your local server's address as mentioned above.

### Example Usage with OpenAI Libraries

#### Python Example

```python
import openai

openai.api_key = 'pk-**********************************************' # For self-hosted version you can put anything
openai.base_url = "https://api.pawan.krd/v1/"  # For self-hosted version, use "http://localhost:3040/v1/"

completion = openai.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "How do I list all files in a directory using Python?"},
    ],
)

print(completion.choices[0].message.content)
```

#### Node.js Example

```js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: "pk-**********************************************", // For self-hosted version you can put anything
	basePath: "https://api.pawan.krd/v1", // For self-hosted version, use "http://localhost:3040/v1"
});

const openai = new OpenAIApi(configuration);

const chatCompletion = await openai.chat.completions.create({
	messages: [{ role: "user", content: "Initiate a test message" }],
	model: "gpt-3.5-turbo",
});

console.log(chatCompletion.choices[0].message.content);
```

## License

This project is under the AGPL-3.0 License. Refer to the [LICENSE](LICENSE) file for detailed information.
