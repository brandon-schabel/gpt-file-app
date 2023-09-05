import json
from time import sleep
import os

import openai
from ...scripts.upload_training_data import upload_training_data
from ...scripts.fetch_files import download_md_to_jsonl
from ...scripts.prepare_data import clean_markdown
from ...scripts.setup import OPEN_AI_KEY

openai.api_key = OPEN_AI_KEY


# Step 2.1: Importing loguru
from loguru import logger

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Step 2.2: Configuring loguru
logger.add(os.path.join(SCRIPT_DIR, "script_logs.log"), rotation="1 day")  # Rotating log every day
logger.info("Script started")

def save_data_to_file(filename, data):
    file_path = os.path.join(SCRIPT_DIR, filename)
    with open(file_path, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")

if __name__ == "__main__":
    raw_docs_data_path = os.path.join(
        SCRIPT_DIR, "../data/raw_docs_data.jsonl")
    cleaned_docs_data_path = os.path.join(
        SCRIPT_DIR, "../data/cleaned_docs_data.jsonl")

    logger.info(f"raw_docs_data_path: {raw_docs_data_path}")

    dataset = []

    if os.path.exists(raw_docs_data_path):
        user_input = input(
            "Raw docs file already exists. Do you want to load it? (y/n): ")

        if user_input.lower() == "y":
            with open(raw_docs_data_path, 'r') as f:
                dataset = [json.loads(line.strip()) for line in f.readlines()]
            logger.info("Loaded existing raw docs data.")
        else:
            try:
                logger.info("Downloading docs...")
                dataset = download_md_to_jsonl(
                    raw_docs_data_path, filter_filename="api/")
                logger.info("Docs saved to " + raw_docs_data_path)
                save_data_to_file(raw_docs_data_path, dataset)
            except Exception as err:
                logger.error(f"Error downloading docs: {err}")
                exit()
    else:
        try:
            logger.info("Downloading docs...")
            dataset = download_md_to_jsonl(
                raw_docs_data_path, filter_filename="api/")
            logger.info("Docs saved to docs.jsonl")
            save_data_to_file(raw_docs_data_path, dataset)
        except Exception as err:
            logger.error(f"Error downloading docs: {err}")
            exit()

    user_input = input("Clean Data Next? (y/n): ")

    if user_input.lower() == "y":
        logger.info("Continuing...")
    else:
        logger.info("Exiting...")
        exit()

    try:
        logger.info("Cleaning data...")
        for entry in dataset:
            for message in entry["messages"]:
                print(message)
                message["content"] = clean_markdown(message["content"])

        save_data_to_file(cleaned_docs_data_path, dataset)
        logger.info("Data cleaned")
    except Exception as err:
        logger.error(f"Error cleaning data: {err}")
        exit()

    with open(cleaned_docs_data_path, "w") as f:
        for entry in dataset:
            f.write(json.dumps(entry) + "\n")

    logger.info("Data cleaned")

    user_input = input("Upload? (y/n): ")
    if user_input.lower() == "y":
        logger.info("Uploading...")
    else:
        logger.info("Exiting...")
        exit()

    try:
        logger.info("Uploading data...")
        training_data_result = upload_training_data(cleaned_docs_data_path)
        logger.info("Data uploaded")
    except Exception as err:
        logger.error(f"Error uploading data: {err}")
        exit()

    user_input = input("Start training? (y/n): ")
    if user_input.lower() == "y":
        logger.info("Training...")
    else:
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
