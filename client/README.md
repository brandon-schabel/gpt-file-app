# GPT File App

This app, written in TypeScript with Bun, Vite, and React, is a file manager that allows users to navigate through directories and interact with files. It is a React application that utilizes various custom hooks and components.

The app starts by importing necessary dependencies and styling files. It then imports components such as buttons, inputs, tables, scroll areas, and switches from their respective directories. It also imports custom hooks for managing bookmarks, file server, file submit queue, and path control.

Inside the `App` function, the app initializes the necessary state variables and hooks. It uses the `useBookmarks` hook to manage bookmarks, including adding and removing bookmarks. It also uses the `useLocalStorage` hook to store the state of the bookmark toggle.

The `usePathControl` hook is used to manage directory navigation. It keeps track of the current view path, previous view paths, forward paths, back N directories, forward N directories, and the directory data. The `changeDir` function is called to navigate to a specific directory based on user input.

The `useFileServer` hook is used to handle file server operations. It initializes the necessary variables and functions for submitting files to the server.

The `useFileSubmitQueue` hook manages the file submit queue by adding and removing files from the queue.

The `useSubmitFilesPaths` hook is used to submit files paths and return the response data.

The state variables and hooks are then used to render the UI components. The app displays a list of bookmarks, with an option to remove them if the bookmark toggle is enabled. Users can also manually input a directory path and navigate to it by clicking the "Go To Path" button.

The app also provides navigation buttons for going back and forward through directories, with the ability to disable these buttons if there are no previous or forward paths available.

The file manager displays a table of files and directories within the current directory. Each file or directory is displayed with its name, file type, an "Add" button (if it is a file), its full path, and options to bookmark or remove the file/directory.

Users can also enter a prompt, add files to a submit queue, and submit the files along with the prompt. The submitted files and the result of the submission are displayed below the submit button. Users can copy the content of the result to their clipboard by clicking the "Copy Content" button.

Overall, this app provides a user-friendly file manager interface with bookmarking, directory navigation, file submission, and result display features.

### Starting App

in both the server and client directories:
`bun run dev`

You'll need to configure a OPEN_AI_KEY in a .env in the server folder.
