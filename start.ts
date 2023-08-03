// Define the commands and directories
const command = ["bun", "run", "dev"];
const serverDir = "./server";
const clientDir = "./client";

// Spawn the server process
let serverProc = Bun.spawn(command, {
  cwd: serverDir, // Change the current working directory to the server directory
  onExit(proc, exitCode, signalCode, error) {
    if (error) {
      console.error(`Server process exited with an error: ${error}`);
    } else {
      console.log(`Server process exited with code ${exitCode}`);
    }
  },
});

// Spawn the client process
let clientProc = Bun.spawn(command, {
  cwd: clientDir, // Change the current working directory to the client directory
  onExit(proc, exitCode, signalCode, error) {
    if (error) {
      console.error(`Client process exited with an error: ${error}`);
    } else {
      console.log(`Client process exited with code ${exitCode}`);
    }
  },
});

// Wait for both processes to exit
Promise.all([serverProc.exited, clientProc.exited]).then(() => {
  console.log("Both processes have exited.");
});
