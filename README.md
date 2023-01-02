
# *02-JAN-2022 Announcement*
## After careful consideration, we have made the decision to shut down this public API due to instances of abuse. If you are interested in continuing to use the API, we recommend checking out our libraries and using your own ChatGPT account.
## Check out [[C# Version](https://github.com/PawanOsman/ChatGPT.Net)][[NodeJS Version](https://github.com/PawanOsman/chatgpt-io)][[Python Version](https://github.com/PawanOsman/ChatGPT.py)]
# If you have any questions or need assistance, please join  [[Discord](https://discord.pawan.krd)]

## Welcome to ChatGPT API

**ChatGPT** is a free API that allows users to access the ChatGPT machine learning model from OpenAI without the need for authentication.

## How to use ChatGPT API

To use the ChatGPT API, send an `HTTP GET` request to the following endpoint:

```
GET https://api.pawan.krd/chat/gpt
```

### Query Parameters

The following query parameters can be included in the request:


|Parameter|Description|Required|Default|
|--|--|--|--|
|`text`|Your message|Yes||
|`lang`|The language of your text. Default is English. Supported languages can be found [here](https://cloud.google.com/translate/docs/languages).|No|`en`|
|`id`|A unique identifier for your conversation.|No|`default`|
|`cache`|A boolean value indicating whether to use cached responses, if available.|No|`true`|


### Example Request

```
GET https://api.pawan.krd/chat/gpt?text=Hello
```

### Example Response

A successful response will return a JSON object with the following fields:

```json
{
  "state": true,
  "reply": "Hello! How can I help you today?",
  "markdown": "Hello! How can I help you today?",
  "html": "<p>Hello! How can I help you today?</p>"
}
```

## Limitations

It is important to note that ChatGPT API is provided on a best-effort basis and may not always be available. Additionally, the API may be rate-limited or have other usage restrictions in place. It is recommended to use the API responsibly and in accordance with any terms of service that may be in place.

## Examples
Here are example codes for using the API in Node.js, Python, and C#:

### Node.js

To use the ChatGPT API in Node.js, you can use the `axios` library to send an HTTP GET request to the API endpoint. Here is an example of how to do this:

```javascript
const axios = require('axios');

async function getResponse(text, lang) {
  try {
    const response = await axios.get('https://api.pawan.krd/chat/gpt', {
      params: {
        text,
        lang
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

getResponse('Hello', 'en').then(response => {
  console.log(response);
});
```

### Python

To use the ChatGPT API in Python, you can use the `requests` library to send an HTTP GET request to the API endpoint. Here is an example of how to do this:

```python
import requests

def get_response(text, lang):
  params = {'text': text, 'lang': lang}
  response = requests.get('https://api.pawan.krd/chat/gpt', params=params)
  return response.json()

response = get_response('Hello', 'en')
print(response)
```

### C#

To use the ChatGPT API in C#, you can use the `HttpClient` class to send an HTTP GET request to the API endpoint. Here is an example of how to do this:

```csharp
using System.Net.Http;
using Newtonsoft.Json;

async Task<Response> GetResponse(string text, string lang) {
  using (var client = new HttpClient()) {
    var queryString = $"text={text}&lang={lang}";
    var response = await client.GetAsync($"https://api.pawan.krd/chat/gpt?{queryString}");
    var responseData = await response.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<Response>(responseData);
  }
}

var response = await GetResponse("Hello", "en");
Console.log(response);
```

Note that these are just basic examples, and you may need to add additional error handling and other functionality as needed for your use case.
