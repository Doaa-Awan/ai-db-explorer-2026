import React from 'react';

const TypingIndicator = () => {
  return (
    <div className='bot-typing'>
      <div className='bot-typing-dot'></div>
      <div
        className='bot-typing-dot'
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div
        className='bot-typing-dot'
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );
};

export default TypingIndicator;
