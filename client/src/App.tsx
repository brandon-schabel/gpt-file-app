import { useFetcher } from "@instant-bun/react-fetcher";
import { createFetchFactory } from "instant-bun/modules/fetch-factory";
import { FileDirInfo } from "instant-bun/modules/files-factory/files-folder";
import { useEffect, useState } from "react";
import "./App.css";
import { ROUTE_VIEW_DIR } from "../../server/index";
// import viteLogo from './assets/vite.svg'

const fetchFactory = createFetchFactory({
  baseUrl: "http://localhost:8080",
});

// todo create session storage and lcoal storage facotry function
// then save the current view path to local storage

function App() {
  const [prevViewPaths, setPrevViewPaths] = useState<FileDirInfo[]>([]);
  const [currentViewPath, setNewViewPath] = useState<FileDirInfo>({
    fullPath: "/Users/brandon",
    name: "instant bun dir",
    type: "directory",
  });
  const { useData, postJSON } = useFetcher<FileDirInfo[]>({
    fetchFactory,
  });
  const [filePathsToSubmit, setFilePathsToSubmit] = useState<FileDirInfo[]>([]);
  const [prompt, setPrompt] = useState("");

  const data = useData();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    postJSON("/gpt-request-with-files", {
      files: filePathsToSubmit,
      prompt,
    });
  };

  useEffect(() => {
    fetchPath("/Users/brandon");
  }, []);

  const fetchPath = (path: string) => {
    return postJSON(ROUTE_VIEW_DIR, {
      path,
    });
  };

  const backNDirs = (numDirs: number = 1) => {
    const prevPath = prevViewPaths[prevViewPaths.length - numDirs];

    if (prevPath) {
      setNewViewPath(prevPath);
      fetchPath(prevPath.fullPath);
      setPrevViewPaths((prevPaths) => {
        return prevPaths.slice(0, prevPaths.length - numDirs);
      });
    }
  };

  const changeDir = (fileOrDir: FileDirInfo) => {
    setPrevViewPaths((prevPaths) => {
      return [...prevPaths, currentViewPath];
    });
    setNewViewPath(fileOrDir);
    fetchPath(fileOrDir.fullPath);
  };

  return (
    <>
      <div>
        <button
          disabled={prevViewPaths.length === 0}
          onClick={() => {
            backNDirs(1);
          }}
        >
          Back Dir
        </button>

        {data?.map((fileOrDir) => {
          return (
            <div>
              <div>
                <span>
                  {fileOrDir.name} - {fileOrDir.type}
                </span>
              </div>
              <button
                onClick={() => {
                  //  copy to clipboard the full file path
                  navigator.clipboard.writeText(fileOrDir.fullPath);
                }}
              >
                Copy Path
              </button>
              {fileOrDir.type === "file" && (
                <button
                  onClick={() => {
                    setFilePathsToSubmit((prevState) => [
                      ...prevState,
                      fileOrDir,
                    ]);
                  }}
                >
                  Add File To Queue
                </button>
              )}

              {fileOrDir.type === "directory" && (
                <button
                  onClick={() => {
                    changeDir(fileOrDir);
                  }}
                >
                  View Dir
                </button>
              )}
              <hr></hr>
            </div>
          );
        })}
      </div>

      <form>
        <label>Prompt</label>
        <textarea
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Additional Prompt"
        ></textarea>
        <p>Files:</p>
        {filePathsToSubmit.map((file) => {
          return (
            <p>
              {file.name} - {file.fullPath}
            </p>
          );
        })}
        <button onClick={handleSubmit}>Submit</button>
      </form>
    </>
  );
}

export default App;
