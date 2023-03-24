## [Check the new Google Bard Chatbot!](https://github.com/PawanOsman/GoogleBard)

# _24-MARCH-2023 Update_

The API is more advanced now! Supports text and chat completions and image generations (DALL-E), and has a new endpoint same as the original API.

### If you have any questions or need assistance, please join [[Discord](https://discord.pawan.krd)]

# Welcome to ChatGPT API _**FREE Reverse Proxy**_

**ChatGPT API Free Reverse Proxy** is a free reverse proxy to OpenAI API that allows users to access OpenAI API for free.

# Index
- [How to use ChatGPT API Reverse Proxy](#how-to-use-chatgpt-api-reverse-proxy)
  - [Self-Host Your Own API](#self-host-your-own-api)
  - [Use Our Hosted API](#use-our-hosted-api)
    - [Text Completion](#text-completion)
    - [Chat Completion (ChatGPT)](#chat-completion-chatgpt)
    - [Image Generation (DALL-E)](#image-generation-dall-e)

- [License](#license)

## How to use ChatGPT API Reverse Proxy

You can use ChatGPT API Reverse Proxy by choosing one of the following methods:

- [Self-Host Your Own API](#self-host-your-own-api)
- [Use Our Hosted API](#use-our-hosted-api)

‌

# Self-Host Your Own API

To self-host your own ChatGPT API, you can use the following steps:

1. [Create an OpenAI API Key](https://platform.openai.com/account/api-keys)
2. Clone this repository and install the dependencies:

```bash
git clone https://github.com/PawanOsman/ChatGPT.git
cd ChatGPT
npm install
```

3. Set your OpenAI key and other configurations in the `config.js` file.
4. Start the server:

```bash
npm start
```

4. Use the API by sending an HTTP request to the API endpoints for example:

```txt
http://localhost:3000/v1/completions
http://localhost:3000/v1/chat/completions
```

# Use Our Hosted API Reverse Proxy

To use our hosted ChatGPT API, you can use the following steps:

1. Join our [Discord](https://discord.pawan.krd) server.
2. Get your API key from the `#Bot` channel by sending `/key` command.
3. Use the API Key in your requests to the following endpoints.

## Text Completion:

```txt
https://api.pawan.krd/v1/completions
```

### Example: [OpenAI Docs](https://platform.openai.com/docs/api-reference/completions)

```bash
curl --location 'https://api.pawan.krd/v1/completions' \
--header 'Authorization: Bearer pk-***[OUR_API_KEY]***' \
--header 'Content-Type: application/json' \
--data '{
    "model": "text-davinci-003",
    "prompt": "Human: Hello\\nAI:",
    "temperature": 0.7,
    "max_tokens": 256,
    "stop": [
        "Human:",
        "AI:"
    ]
}'
```

## Chat Completion (ChatGPT):

```txt
https://api.pawan.krd/v1/chat/completions
```

### Example: [OpenAI Docs](https://platform.openai.com/docs/api-reference/chat)

```bash
curl --location 'https://api.pawan.krd/v1/chat/completions' \
--header 'Authorization: Bearer pk-***[OUR_API_KEY]***' \
--header 'Content-Type: application/json' \
--data '{
    "model": "gpt-3.5-turbo",
    "max_tokens": 100,
    "messages": [
        {
            "role": "system",
            "content": "You are an helful assistant"
        },
        {
            "role": "user",
            "content": "Who are you?"
        }
    ]
}'
```

## Image Generation (DALL-E):

```txt
https://api.pawan.krd/v1/images/generations
```

### Example: [OpenAI Docs](https://platform.openai.com/docs/api-reference/images)

```bash
curl --location 'https://api.pawan.krd/v1/images/generations' \
--header 'Authorization: Bearer pk-***[OUR_API_KEY]***' \
--header 'Content-Type: application/json' \
--data '{
    "prompt": "a photo of a happy corgi puppy sitting and facing forward, studio light, longshot",
    "n": 1,
    "size": "1024x1024"
}'
```

# License

MIT License
