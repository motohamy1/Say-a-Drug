
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="w-10 h-10 border">
          <AvatarImage src="/placeholder.svg" alt="mira" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="w-10 h-10 border">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
