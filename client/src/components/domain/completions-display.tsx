import { useClipboard } from "@u-tools/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../../App.css";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAppState } from "../../socket-context";
import { Button } from "../ui/button";

export const CompletionsDisplay = () => {
  const { state } = useAppState();
  const { setClipboard } = useClipboard();
  return (
    <ScrollArea className="h-[90vh] w-full rounded-md border p-4 text-left shadow-inner">
      {state.completionResponse?.choices.map((choice) => {
        return (
          <ReactMarkdown
            children={choice.message.content || ""}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const text = String(children).replace(/\n$/, "");
                return !inline && match ? (
                  <div>
                    <SyntaxHighlighter
                      {...props}
                      children={text}
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                    />
                    <Button
                      onClick={() => {
                        setClipboard(text);
                      }}
                      className="mt-2"
                    >
                      {" "}
                      Copy Code{" "}
                    </Button>
                  </div>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          />
        );
      })}
    </ScrollArea>
  );
};
