import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { useAppState } from "../../socket-context";

export const PathSegments = () => {
  const { state, navigateTo } = useAppState();

  const currentIndex = state.navigation.currentIndex;
  const currentPath = state.navigation.paths[currentIndex];
  // break down currentPath.fullPath into segments, and then create links to each
  // segment, each segment needs to be a concatination of all paths prior
  // to the current path, like cookie crumbs
  let currentPathSegment = "";

  const allSegments = currentPath.fullPath.split("/");

  const mappedSegments = allSegments.map(
    (
      segment,
      index
    ): {
      label: string;
      fileDirInfo: FileDirInfo;
    } => {
      currentPathSegment += segment;
      // add "/" for each segement except the last one
      if (index !== allSegments.length - 1) {
        currentPathSegment += "/";
      }

      return {
        label: segment,
        fileDirInfo: {
          fullPath: currentPathSegment,
          name: segment,
          type: "directory",
          extension: "",
          size: 0,
        },
      };
    }
  );

  const pathSegmentLinks = mappedSegments.map((segment, index) => {
    return (
      <span
        key={segment.fileDirInfo.fullPath + segment.label}
        onClick={() => {
          navigateTo(segment.fileDirInfo);
        }}
        className="hover:underline hover:text-green-400"
      >
        {segment.label}
        {index !== allSegments.length - 1 && "/"}
      </span>
    );
  });

  return <div>{pathSegmentLinks}</div>;
};
