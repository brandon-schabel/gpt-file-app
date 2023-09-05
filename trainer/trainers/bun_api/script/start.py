import json
from time import sleep
import os

import openai
from ...scripts.upload_training_data import upload_training_data
from ...scripts.fetch_files import download_md_to_jsonl
from ...scripts.prepare_data import clean_markdown
from ...scripts.setup import OPEN_AI_KEY

# Step 2.1: Importing loguru
from loguru import logger

openai.api_key = OPEN_AI_KEY

# Constants
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DOCS_PATH = os.path.join(SCRIPT_DIR, "../data/raw_docs_data.jsonl")
CLEANED_DOCS_PATH = os.path.join(SCRIPT_DIR, "../data/cleaned_docs_data.jsonl")

openai.api_key = OPEN_AI_KEY
logger.add(os.path.join(SCRIPT_DIR, "script_logs.log"), rotation="1 day")  # Rotating log every day


def save_data_to_file(filename, data):
    with open(filename, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")


def load_data_from_file(file_path):
    with open(file_path, 'r') as f:
        return [json.loads(line.strip()) for line in f.readlines()]


def get_user_input(prompt):
    return input(prompt).lower() == "y"


def download_and_save(file_path, filter_filename="api/"):
    try:
        logger.info("Downloading docs...")
        dataset = download_md_to_jsonl(file_path, filter_filename)
        logger.info(f"Docs saved to {file_path}")
        save_data_to_file(file_path, dataset)
        return dataset
    except Exception as err:
        logger.error(f"Error downloading docs: {err}")
        exit()


def clean_data(dataset):
    logger.info("Cleaning data...")
    for entry in dataset:
        for message in entry["messages"]:
            message["content"] = clean_markdown(message["content"])
    save_data_to_file(CLEANED_DOCS_PATH, dataset)
    logger.info("Data cleaned")


def main():
    logger.info("Script started")
    
    dataset = []
    if os.path.exists(RAW_DOCS_PATH) and get_user_input("Raw docs file already exists. Do you want to load it? (y/n): "):
        dataset = load_data_from_file(RAW_DOCS_PATH)
        logger.info("Loaded existing raw docs data.")
    else:
        dataset = download_and_save(RAW_DOCS_PATH)

    if get_user_input("Clean Data Next? (y/n): "):
        clean_data(dataset)
    else:
        logger.info("Exiting...")
        exit()

    if get_user_input("Upload? (y/n): "):
        try:
            logger.info("Uploading data...")
            training_data_result = upload_training_data(CLEANED_DOCS_PATH)
            logger.info("Data uploaded")
        except Exception as err:
            logger.error(f"Error uploading data: {err}")
            exit()
    else:
        logger.info("Exiting...")
        exit()

    if not get_user_input("Start training? (y/n): "):
        logger.info("Exiting...")
        exit()

    currFineTune = openai.FineTuningJob.create(
        training_file=training_data_result.id, model="gpt-3.5-turbo")

    while True:
        currFineTune = openai.FineTuningJob.retrieve(currFineTune.id)
        logger.info(currFineTune)

        if currFineTune.status == "succeeded":
            logger.info("Training succeeded")
            exit()
        elif currFineTune.status == "failed":
            logger.error("Training failed")
            exit()
        else:
            logger.info("Training in progress")
            sleep(5)


if __name__ == "__main__":
    main()
