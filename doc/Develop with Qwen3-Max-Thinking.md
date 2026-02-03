# Develop with Qwen3-Max-Thinking
Qwen3-Max-Thinking is now available in Qwen Chat, where users can interact with the model and its adaptive tool-use capabilities. Meanwhile, the API of Qwen3-Max-Thinking (whose model name is qwen3-max-2026-01-23) is available. You can first register an Alibaba Cloud account and activate Alibaba Cloud Model Studio service, and then navigate to the console and create an API key.

Since the APIs of Qwen are OpenAI-API compatible, we can directly follow the common practice of using OpenAI APIs. Below is an example of using Qwen3-Max-Thinking in Python:

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

completion = client.chat.completions.create(
    model="qwen3-max-2026-01-23",
    messages=[
      {'role': 'user', 'content': 'Give me a short introduction to large language model.'}
    ],
    extra_body={"enable_thinking": True}
)

print(completion.choices[0].message)
```

The APIs of Qwen are also compatible with the Anthropic API protocol, enabling Qwen3-Max-Thinking to work seamlessly with Claude Code. Simply use the API key created at Alibaba Cloud account and install Claude Code to elevate your coding experience. Below is the quick start script.

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Configure Environment Variables
export ANTHROPIC_MODEL="qwen3-max-2026-01-23" 
export ANTHROPIC_SMALL_FAST_MODEL="qwen3-max-2026-01-23"
export ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/apps/anthropic
export ANTHROPIC_AUTH_TOKEN=your-dashscope-apikey

# Execute
claude
```

Citation
Feel free to cite the following article if you find Qwen3-Max-Thinking helpful.

```
@misc{qwen3maxthinking,
    title = {Pushing Qwen3-Max-Thinking Beyond its Limits},
    url = {https://qwen.ai/blog?id=qwen3-max-thinking},
    author = {Qwen Team},
    month = {January},
    year = {2026}
}
```