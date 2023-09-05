import openai
import os
import json
from setup import OPEN_AI_KEY

# import json file named "uploaded.json"
fileData = json.load(open("uploaded.json", "r"))

openai.FineTuningJob.create(training_file=fileData.id, model="gpt-3.5-turbo", api_key=OPEN_AI_KEY)