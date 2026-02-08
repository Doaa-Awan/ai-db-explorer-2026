import ReactMarkdown from 'react-markdown';
import { useEffect, useRef } from 'react';

const ChatMessages = ({ messages }) => {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onCopyMessage = (e) => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', selection);
    }
  };

  return (
    <div className='chat-messages'>
      {messages.map((message, index) => (
        <div
          key={index}
          onCopy={onCopyMessage}
          ref={index === messages.length - 1 ? lastMessageRef : null}
          className={`chat-message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
