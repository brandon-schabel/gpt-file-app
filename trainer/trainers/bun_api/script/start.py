import json
from time import sleep
import os
import typer
import openai
from ...scripts.upload_training_data import upload_training_data
from ...scripts.fetch_files import download_md_to_jsonl
from ...scripts.prepare_data import prepare_data
from ...scripts.setup import OPEN_AI_KEY
from loguru import logger

app = typer.Typer()

openai.api_key = OPEN_AI_KEY

# Constants
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DOCS_PATH = os.path.join(SCRIPT_DIR, "../data/raw_docs_data.jsonl")
CLEANED_DOCS_PATH = os.path.join(SCRIPT_DIR, "../data/cleaned_docs_data.jsonl")
UPLOAD_INFO_PATH = os.path.join(SCRIPT_DIR, "../data/uploaded_info.json")

logger.add(os.path.join(SCRIPT_DIR, "script_logs.log"),
           rotation="1 day")  # Rotating log every day


def save_data_to_file(filename: str, data: list) -> None:
    with open(filename, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")


def load_data_from_file(file_path: str) -> list:
    with open(file_path, 'r') as f:
        return [json.loads(line.strip()) for line in f.readlines()]


def download_and_save(file_path: str, filter_filename: str = "api/") -> list:
    try:
        logger.info("Downloading docs...")
        dataset = download_md_to_jsonl(file_path, filter_filename)
        logger.info(f"Docs saved to {file_path}")
        save_data_to_file(file_path, dataset)
        return dataset
    except Exception as err:
        logger.error(f"Error downloading docs: {err}")
        raise


@app.command()
def download():
    if os.path.exists(RAW_DOCS_PATH) and typer.confirm("Raw docs file already exists. Do you want to load it?"):
        dataset = load_data_from_file(RAW_DOCS_PATH)
        logger.info("Loaded existing raw docs data.")
        return dataset
    else:
        dataset = download_and_save(RAW_DOCS_PATH)
        return dataset


@app.command()
def clean():
    # Now using prepare_data for cleaning and summarizing if needed.
    prepare_data(RAW_DOCS_PATH, CLEANED_DOCS_PATH, summarize=True)
    logger.info("Data cleaned and summarized")


@app.command()
def upload():
    try:
        logger.info("Uploading data...")
        # Passing the path here
        upload_training_data(CLEANED_DOCS_PATH, UPLOAD_INFO_PATH)
        logger.info("Data uploaded")
    except Exception as err:
        logger.error(f"Error uploading data: {err}")


@app.command()
def train():
    # Load the uploaded data result from the file
    try:
        with open(UPLOAD_INFO_PATH, "r") as f:
            training_data_result = json.load(f)
    except FileNotFoundError:
        logger.error(
            "Uploaded data information not found. Please upload the training data first.")
        return

    currFineTune = openai.FineTuningJob.create(
        training_file=training_data_result['id'], model="gpt-3.5-turbo")
    while True:
        currFineTune = openai.FineTuningJob.retrieve(currFineTune.id)
        logger.info(currFineTune)
        if currFineTune.status == "succeeded":
            logger.info("Training succeeded")
            break
        elif currFineTune.status == "failed":
            logger.error("Training failed")
            break
        else:
            logger.info("Training in progress")
            sleep(5)

@app.command()
def list_fine_tuning_jobs():
    logger.info(openai.FineTuningJob.list())
    
def cancel_fine_tuning_job(job_id: str):
    logger.info(openai.FineTuningJob.cancel(job_id))
    
@app.command()
def cancel_fine_tuning_jobs():
    for job in openai.FineTuningJob.list():
        
        
        # log job object  as a string because it is an object
        logger.info(str(job))
        
        
        cancel_fine_tuning_job(job.id)

if __name__ == "__main__":
    app()
