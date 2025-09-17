"use client";

export function ChatLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <div className="flex gap-4 justify-start">
        {/* AI Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
            AI
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="flex flex-col max-w-[85%] items-start">
          <div className="rounded-2xl px-4 py-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-md">
            <div className="flex items-center gap-2">
              {/* Typing dots animation */}
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <div 
                  className="w-2 h-2 bg-current rounded-full animate-pulse" 
                  style={{animationDelay: "0.2s"}}
                ></div>
                <div 
                  className="w-2 h-2 bg-current rounded-full animate-pulse" 
                  style={{animationDelay: "0.4s"}}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1 px-2">
            AI Assistant • typing...
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        <div 
          className="w-2 h-2 bg-current rounded-full animate-bounce" 
          style={{animationDelay: "0.1s"}}
        ></div>
        <div 
          className="w-2 h-2 bg-current rounded-full animate-bounce" 
          style={{animationDelay: "0.2s"}}
        ></div>
      </div>
      <span>AI is typing...</span>
    </div>
  );
}