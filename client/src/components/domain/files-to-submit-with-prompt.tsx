import { useAppState } from "../../socket-context";

export const FilesToSubmitWithPrompt = ({}) => {
  const {
    state: { filesToSubmit },
    control,
  } = useAppState();
  return (
    <div className="flex flex-col gap-y-2 mb-4">
      {filesToSubmit?.map((file) => {
        return (
          <p
            onClick={() => {
              const updatedFilesToSubmit = filesToSubmit.filter(
                (fileToSubmit) => {
                  return fileToSubmit.fullPath !== file.fullPath;
                }
              );

              return control.filesToSubmit.set(updatedFilesToSubmit);
            }}
            className="hover:bg-red-200 rounded"
            key={file.fullPath}
          >
            {file.name} - {file.fullPath}
          </p>
        );
      })}
    </div>
  );
};
