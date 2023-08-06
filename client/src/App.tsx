import { FileDirInfo } from "instant-bun/modules/files-factory/files-folder";
import { useEffect, useState } from "react";
import { ROUTE_VIEW_DIR, ViewDirectoryResponse } from "../../server/index";
import "./App.css";
import useApiFactory from "./use-api-factory";
// import viteLogo from './assets/vite.svg'

type GPTFileServerAppEndpoints = {
  "/gpt-request-with-files": {
    body: {
      files: FileDirInfo[];
      prompt: string;
    };
    response: {
      test: string;
    };
    params: {
      maxFiles: number;
    };
  };
  [ROUTE_VIEW_DIR]: {
    body: {
      path: string;
    };
    response: ViewDirectoryResponse;
  };
};

function App() {
  const result = useApiFactory<GPTFileServerAppEndpoints>({
    baseUrl: "http://localhost:8080",
    endpoints: [
      { endpoint: "/gpt-request-with-files", method: "post" },
      {
        endpoint: "/view-directory",
        method: "post",
      },
    ],
  });

  const useGptRequest = result["/gpt-request-with-files"];
  const useViewDirectory = result[ROUTE_VIEW_DIR];

  const { data: viewDirectoryData, post: postViewDirectory } =
    useViewDirectory();

  const { data: gptRequestData, post: postGptRequest } = useGptRequest();


  console.log({
    viewDirectoryData,  })

  const [prevViewPaths, setPrevViewPaths] = useState<FileDirInfo[]>([]);
  const [currentViewPath, setNewViewPath] = useState<FileDirInfo>({
    fullPath: "/Users/brandon",
    name: "instant bun dir",
    type: "directory",
  });

  const [filePathsToSubmit, setFilePathsToSubmit] = useState<FileDirInfo[]>([]);
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const result = await postGptRequest({ files: filePathsToSubmit, prompt });

    console.log("result", result);
  };

  useEffect(() => {
    fetchPath("/Users/brandon");
  }, []);

  const fetchPath = (path: string) => {
    return postViewDirectory({
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

        {viewDirectoryData?.map((fileOrDir) => {
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
                  // @ts-ignore
                  navigator?.clipboard.writeText(fileOrDir.fullPath);
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
          onChange={(e) => setPrompt(e.target?.value as any)}
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
