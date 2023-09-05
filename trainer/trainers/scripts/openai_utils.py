import openai

from .setup import OPEN_AI_KEY

openai.api_key = OPEN_AI_KEY


def simple_completion(prompt, max_tokens=4000):
    return openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                        messages=[
                                            {
                                                role: "user",
                                                content: prompt

                                            }
                                        ],
                                        max_tokens=max_tokens
                                        )
