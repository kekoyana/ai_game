import React from "react";

type MessageAreaProps = {
  message: string;
  messageLog?: string[];
};

const MessageArea: React.FC<MessageAreaProps> = ({ message, messageLog }) => (
  <div>
    <div className="message-area">{message}</div>
    {messageLog && (
      <div data-testid="message-log" style={{ display: "none" }}>
        {messageLog.join("\n")}
      </div>
    )}
  </div>
);

export default MessageArea;