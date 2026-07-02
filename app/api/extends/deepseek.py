import openai
from app.config import settings

openai.api_key =  settings.DEEPSEEK_API_KEY # 你的 DeepSeek API 密钥
openai.api_base = settings.DEEPSEEK_API_URL  # DeepSeek API 的基础 URL


# 存储对话历史
conversation_history = []

async def call_deepseek(question: str) -> str:
    try:
        conversation_history.append({"role": "user", "content": question})

        response = openai.ChatCompletion.create(
            model="deepseek-chat",  # DeepSeek 使用的模型名称
            messages=conversation_history,  # 提供所有对话历史
            max_tokens=2000,  # 最大的 token 数量（可以根据需要调整）
            n=1,  
            stop=None,  #
        )

        # 获取返回的答案
        answer = response['choices'][0]['message']['content'].strip()

        # 将助手的回答添加到对话历史中
        conversation_history.append({"role": "assistant", "content": answer})

        return answer
    
    except Exception as e:
        return f"调用 DeepSeek API 失败: {e}"

