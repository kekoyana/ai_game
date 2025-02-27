import React from 'react'
import './MessageBox.css'

interface MessageBoxProps {
  text: string
}

const MessageBox: React.FC<MessageBoxProps> = ({ text }) => {
  return (
    <div className="message-box">
      <div className="message-content">
        {text}
      </div>
    </div>
  )
}

export default MessageBox