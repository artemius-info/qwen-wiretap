Qwen models on Alibaba Cloud Model Studio are compatible with the Anthropic API. Modify the following parameters to migrate your existing Anthropic applications to Model Studio.

-   ANTHROPIC\_API\_KEY (or ANTHROPIC\_AUTH\_TOKEN): Replace the value with your [Model Studio API key](/help/en/model-studio/get-api-key).
    
-   ANTHROPIC\_BASE\_URL: Replace the value with the compatible Model Studio endpoint: `https://dashscope-intl.aliyuncs.com/apps/anthropic`.
    
-   model: Replace the value with a supported model name, such as `qwen3-plus`, from [Supported models](#07833dedefft7).
    

**Important**

This topic is applicable only to the International Edition (Singapore region).

## **Quick integration**

## Text conversation

```
import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    base_url=os.getenv("ANTHROPIC_BASE_URL"),
)
# To migrate to Model Studio, configure the ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL environment variables, and change the model parameter below.
# For parameter compatibility, see Anthropic API compatibility details.
message = client.messages.create(
    model="qwen-plus",   # Set the model to qwen-plus.
    max_tokens=1024,
    # Deep thinking. Only supported by some models. See the list of supported models.
    thinking={
        "type": "enabled",
        "budget_tokens": 1024
    },
    # Streaming output
    stream=True,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Who are you?"
                }
            ]
        }
    ]
)
print("=== Thinking process ===")
first_text = True
for chunk in message:
    if chunk.type == "content_block_delta":
        if hasattr(chunk.delta, 'thinking'):
            print(chunk.delta.thinking, end="", flush=True)
        elif hasattr(chunk.delta, 'text'):
            if first_text:
                print("\n\n=== Response ===")
                first_text = False
            print(chunk.delta.text, end="", flush=True)
```

## Supported models

The Anthropic API-compatible service in Model Studio supports the following Qwen models:

| **Series** | **Model** |
| --- | --- |
| Qwen-Max (Some models support thinking mode) | qwen3-max, qwen3-max-2026-01-23 (supports thinking mode), qwen3-max-preview (supports thinking mode) [View more](/help/en/model-studio/models#d4ccf72f23jh9) |
| Qwen-Plus | qwen-plus, qwen-plus-latest, qwen-plus-2025-09-11 [View more](/help/en/model-studio/models#5ef284d4ed42p) |
| Qwen-Flash | qwen-flash, qwen-flash-2025-07-28 [View more](/help/en/model-studio/models#13ff05e329blt) |
| Qwen-Turbo | qwen-turbo, qwen-turbo-latest [View more](/help/en/model-studio/models#947fc66bc1ldf) |
| Qwen-Coder (Thinking mode not supported) | qwen3-coder-plus, qwen3-coder-plus-2025-09-23, qwen3-coder-flash [View more](/help/en/model-studio/models#d698550551bob) |
| Qwen-VL (Thinking mode not supported) | qwen-vl-max, qwen-vl-plus |

For model specifications and billing rules, see [Model list](/help/en/model-studio/models).

## Detailed steps

### **Activate Model Studio**

If you are using Model Studio for the first time, follow these steps to activate the service.

1.  Log on to the [Model Studio console](https://modelstudio.console.alibabacloud.com/?tab=app#/app-center).
    
2.  If the message ![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/6142978571/p968044.png) is displayed at the top of the page, click to activate and claim your free quota. If this message is not displayed, the service is already active.
    

> After you activate Model Studio for the first time, you get a new-user free quota for model inference that is valid for 90 days. For more details, see [Free quota for new users](/help/en/model-studio/new-free-quota).

**Note**

You will be charged if your free quota is used up or expires. To avoid these charges, you can enable the [Free quota only](/help/en/model-studio/new-free-quota#d1cb80ac11i92) feature. The actual fees are subject to the pricing displayed in the console and your final bill.

### Set environment variables

To access the Model Studio service through the Anthropic-compatible API, set the following two environment variables.

1.  `ANTHROPIC_BASE_URL`: Set this to https://dashscope-intl.aliyuncs.com/apps/anthropic.
    
2.  `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`: Set this to your [Model Studio API key](/help/en/model-studio/get-api-key).
    
    > `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` for access authentication. You only need to set one of them. This topic uses `ANTHROPIC_API_KEY` as an example.
    

## macOS

1.  In the terminal, run the following command to check your default shell type.
    
    ```
    echo $SHELL
    ```
    
2.  Set the environment variables based on your shell type. The commands are as follows:
    
    ## Zsh
    
    ```
    # Replace YOUR_DASHSCOPE_API_KEY with your Model Studio API key.
    echo 'export ANTHROPIC_BASE_URL="https://dashscope-intl.aliyuncs.com/apps/anthropic"' >> ~/.zshrc
    echo 'export ANTHROPIC_API_KEY="YOUR_DASHSCOPE_API_KEY"' >> ~/.zshrc
    ```
    
    ## Bash
    
    ```
    # Replace YOUR_DASHSCOPE_API_KEY with your Model Studio API key.
    echo 'export ANTHROPIC_BASE_URL="https://dashscope-intl.aliyuncs.com/apps/anthropic"' >> ~/.bash_profile
    echo 'export ANTHROPIC_API_KEY="YOUR_DASHSCOPE_API_KEY"' >> ~/.bash_profile
    ```
    
3.  In the terminal, run the following command to apply the environment variables.
    
    ## Zsh
    
    ```
    source ~/.zshrc
    ```
    
    ## Bash
    
    ```
    source ~/.bash_profile
    ```
    
4.  Open a new terminal and run the following commands to verify that the environment variables are set correctly.
    
    ```
    echo $ANTHROPIC_BASE_URL
    echo $ANTHROPIC_API_KEY
    ```
    

## Windows

1.  In Windows, you can use CMD or PowerShell to set the base URL and [API key](/help/en/model-studio/get-api-key) from Alibaba Cloud Model Studio as environment variables.
    
    ## CMD
    
    1.  In CMD, run the following commands to set the environment variables.
        
        ```
        # Replace YOUR_DASHSCOPE_API_KEY with your Model Studio API key
        setx ANTHROPIC_API_KEY "YOUR_DASHSCOPE_API_KEY"
        setx ANTHROPIC_BASE_URL "https://dashscope-intl.aliyuncs.com/apps/anthropic"
        ```
        
    2.  Open a new CMD window and run the following commands to verify that the environment variables are set correctly.
        
        ```
        echo %ANTHROPIC_API_KEY%
        echo %ANTHROPIC_BASE_URL%
        ```
        
    
    ## PowerShell
    
    1.  In PowerShell, run the following commands to set the environment variables.
        
        ```
        # Replace YOUR_DASHSCOPE_API_KEY with your Model Studio API key.
        [Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "YOUR_DASHSCOPE_API_KEY", [EnvironmentVariableTarget]::User)
        [Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://dashscope-intl.aliyuncs.com/apps/anthropic", [EnvironmentVariableTarget]::User)
        ```
        
    2.  Open a new PowerShell window and run the following commands to verify that the environment variables are set correctly.
        
        ```
        echo $env:ANTHROPIC_API_KEY
        echo $env:ANTHROPIC_BASE_URL
        ```
        
    

### API call - Text chat

## cURL

```
curl -X POST "https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${ANTHROPIC_API_KEY}" \
  -d '{
    "model": "qwen-plus",
    "max_tokens": 1024,
    "stream": true,
    "thinking": {
      "type": "enabled",
      "budget_tokens": 1024
    },
    "system": "You are a helpful assistant",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Who are you?"
                }
            ]
        }
    ]
}'
```

## Python

1.  **Install the Anthropic SDK**
    
    ```
    pip install anthropic
    ```
    
2.  **Code example**
    
    ```
    import anthropic
    import os
    
    client = anthropic.Anthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        base_url=os.getenv("ANTHROPIC_BASE_URL"),
    )
    
    message = client.messages.create(
        model="qwen-plus",
        max_tokens=1024,
        stream=True,
        system="you are a helpful assistant",
        # Deep thinking. Only supported by some models. See the list of supported models.
        thinking={
            "type": "enabled",
            "budget_tokens": 1024
        },
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Who are you?"
                    }
                ]
            }
        ]
    )
    
    print("=== Thinking process ===")
    first_text = True
    for chunk in message:
        if chunk.type == "content_block_delta":
            if hasattr(chunk.delta, 'thinking'):
                print(chunk.delta.thinking, end="", flush=True)
            elif hasattr(chunk.delta, 'text'):
                if first_text:
                    print("\n\n=== Response ===")
                    first_text = False
                print(chunk.delta.text, end="", flush=True)
    ```
    

## TypeScript

1.  **Install the Anthropic TypeScript SDK**
    
    ```
    npm install @anthropic-ai/sdk
    ```
    
2.  **Code example**
    
    ```
    import Anthropic from "@anthropic-ai/sdk";
    
    async function main() {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: process.env.ANTHROPIC_BASE_URL,
      });
    
      const stream = await anthropic.messages.create({
        model: "qwen-plus",
        max_tokens: 1024,
        stream: true,
        // Deep thinking. Only supported by some models. See the list of supported models.
        thinking: { type: "enabled", budget_tokens: 1024 },
        system: "You are a helpful assistant",
        messages: [{ 
          role: "user", 
          content: [
            {
              type: "text",
              text: "Who are you?"
            }
          ]
        }]
      });
    
      console.log("=== Thinking process ===");
      let firstText = true;
    
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta") {
          if ('thinking' in chunk.delta) {
            process.stdout.write(chunk.delta.thinking);
          } else if ('text' in chunk.delta) {
            if (firstText) {
              console.log("\n\n=== Response ===");
              firstText = false;
            }
            process.stdout.write(chunk.delta.text);
          }
        }
      }
      console.log();
    }
    
    main().catch(console.error);
    ```
    

## Compatibility details

### **HTTP header**

| **Field** | **Supported** |
| --- | --- |
| x-api-key | Supported |
| Authorization Bearer | Supported |
| anthropic-beta/anthropic-version | Not supported |

### **Basic fields**

| **Field** | **Supported** | **Description** | **Example value** |
| --- | --- | --- | --- |
| model | Supported | The model name, see [Supported models](#07833dedefft7). | qwen-plus |
| max\\_tokens | Supported | The maximum number of tokens to generate. | 1024 |
| container | Not supported | \\- | \\- |
| mcp\\_servers | Not supported | \\- | \\- |
| metadata | Not supported | \\- | \\- |
| service\\_tier | Not supported | \\- | \\- |
| stop\\_sequences | Supported | Custom text sequences that cause the model to stop generating. | \\["}"\\] |
| stream | Supported | Streaming output | True |
| system | Supported | System prompt | You are a helpful assistant |
| temperature | Supported | The temperature coefficient, which controls the diversity of the generated text. | 1.0 |
| thinking | Supported | Thinking mode (Not supported by Qwen-Max and Qwen-Coder series models). | {"type": "enabled", "budget\\_tokens": 1024} |
| top\\_k | Supported | The size of the candidate set for sampling during generation. | 10  |
| top\\_p | Supported | The probability threshold for nucleus sampling, which controls the diversity of the generated text. | 0.1 |

> Because both the temperature and top\_p parameters control the diversity of the generated text, set only one of them. For more information, see [Overview of text generation models](/help/en/model-studio/text-generation#ad7b336bec5fw).

### **Tool fields**

**tools**

| **Field** | **Supported** |
| --- | --- |
| name | Supported |
| input\\_schema | Supported |
| description | Supported |
| cache\\_control | Supported |

**tool\_choice**

| **Value** | **Supported** |
| --- | --- |
| none | Supported |
| auto | Supported |
| any | Supported |
| tool | Supported |

### **Message fields**

| **Field** | **Type** | **Subfield** | **Supported** | **Description** |
| --- | --- | --- | --- | --- |
| content | string | \\- | Supported | Plain text content. |
| array, type="text" | text | Supported | The content of the text block. |
| cache\\_control | Supported | Controls the caching behavior of this text block. |
| citations | Not supported | \\- |
| array, type="image" | \\- | Not supported | \\- |
| array, type="video" | \\- | Not supported | \\- |
| array, type="document" | \\- | Not supported | \\- |
| array, type="search\\_result" | \\- | Not supported | \\- |
| array, type="thinking" | \\- | Not supported | \\- |
| array, type="redacted\\_thinking" | \\- | Not supported | \\- |
| array, type="tool\\_use" | id  | Supported | The unique identifier for the tool call. |
| input | Supported | The parameter object passed when calling the tool. |
| name | Supported | The name of the tool being called. |
| cache\\_control | Supported | Controls the caching behavior of this tool call. |
| array, type="tool\\_result" | tool\\_use\\_id | Supported | The ID of the `tool_use` corresponding to this result. |
| content | Supported | The result returned after the tool is executed, usually a string or a JSON string. |
| cache\\_control | Supported | Controls the caching behavior of this tool result. |
| is\\_error | Not supported | \\- |
| array, type="server\\_tool\\_use" | \\- | Not supported | \\- |
| array, type="web\\_search\\_tool\\_result" | \\- | Not supported | \\- |
| array, type="code\\_execution\\_tool\\_result" | \\- | Not supported | \\- |
| array, type="mcp\\_tool\\_use" | \\- | Not supported | \\- |
| array, type="mcp\\_tool\\_result" | \\- | Not supported | \\- |
| array, type="container\\_upload" | \\- | Not supported | \\- |

## **Error codes**

| **HTTP status code** | **Error type** | **Description** |
| --- | --- | --- |
| 400 | invalid\\_request\\_error | The request format or content is invalid. This can be caused by missing required parameters or incorrect data types for parameter values. |
| 403 | authentication\\_error | The API key is invalid. This can be caused by a missing API key in the request header or an incorrect API key. |
| 404 | not\\_found\\_error | The requested resource was not found. This can be caused by a misspelled compatible interface or a model in the request header that does not exist. |
| 429 | rate\\_limit\\_error | The account has reached its rate limit. Reduce the request frequency. |
| 500 | api\\_error | A general internal server error occurred. Retry the request later. |
| 529 | overloaded\\_error | The API server is currently overloaded and cannot process new requests. |