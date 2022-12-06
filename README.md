
# Welcome to ChatGPT API

**ChatGPT** is a free api to the ChatGPT from OpenAI without Authentication.

# How to use ChatGPT API?
you can use it by sending `HTTP GET` Request to endpoints below:

| Query | Definition |
|--|--|
| text | Your Message|
| lang | your text language (Default is English)  [\[Language Codes\]](https://cloud.google.com/translate/docs/languages) |


GET https://api.pawan.krd/chat/gpt?text=Hello&lang=en

**Response**
You will get json response like this:

    {"status":true,"reply":"chat gpt reply","html":chat gpt reply in html format}
