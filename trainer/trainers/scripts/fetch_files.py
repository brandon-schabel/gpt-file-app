import base64
import os
import requests
import json

BASE_URL = "https://api.github.com/repos/oven-sh/bun/git/trees/main?recursive=1"


def generate_prompt_from_filename(filename):
    # Split the filename from its extension
    base_name = os.path.splitext(filename)[0]

    # Convert underscores or hyphens to spaces
    formatted_name = base_name.replace("_", " ").replace("-", " ")

    # Capitalize each word
    capitalized_name = ' '.join([word.capitalize()
                                for word in formatted_name.split()])

    return f"Summarize the {capitalized_name} instructions from the following content:"


def fetch_files_from_repo(base_url=BASE_URL, filter_filename=None):
    response = requests.get(base_url)

    # Check if the request was successful
    if response.status_code != 200:
        print(
            f"Error fetching data from GitHub. Status code: {response.status_code}")
        print(f"Response content: {response.text}")
        return []

    data = response.json()

    # Check for the 'tree' key in the response data
    if 'tree' not in data:
        print(f"Unexpected response data: {data}")
        return []

    # Filter only the markdown files from the 'docs' directory that are blobs
    doc_files = [item for item in data['tree']
                 if item['path'].startswith("docs/") and item['path'].endswith('.md') and item['type'] == 'blob']

    if filter_filename:
        doc_files = filter(
            lambda item: filter_filename in item['path'], doc_files)

    file_contents = []

    for file in doc_files:
        file_response = requests.get(file['url'])
        file_data = file_response.json()

        # Check for the 'content' key in the response data
        if 'content' not in file_data:
            print(f"Unexpected file data for {file['path']}: {file_data}")
            continue

        file_content = file_data['content']
        file_content_decoded = base64.b64decode(file_content).decode('utf-8')

        # Generate dynamic prompt
        prompt_text = generate_prompt_from_filename(file['path'])

        # Organize data in chat completions format
        entry = {
            "messages": [
                {"role": "system", "content": "You are a TypeScript Wizard and Bun Expert."},
                {"role": "user", "content": prompt_text},
                {"role": "assistant", "content": file_content_decoded}
            ]
        }

        file_contents.append(entry)

    return file_contents


def download_md_to_jsonl(save_file_path, base_url=BASE_URL, filter_filename=None):
    file_contents = fetch_files_from_repo(base_url, filter_filename)

    with open(save_file_path, "w") as f:
        for item in file_contents:
            f.write(json.dumps(item) + "\n")

    return file_contents
