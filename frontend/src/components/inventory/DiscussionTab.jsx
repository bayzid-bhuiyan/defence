import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next'; 
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const DiscussionTab = ({ inventory }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/inventory/${inventory.id}`);
        setMessages(response.data.data || []);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };
    fetchComments();

    socketRef.current = io('backend url', {
      withCredentials: true,
    });
    socketRef.current.emit('join_inventory', inventory.id);

    socketRef.current.on('receive_comment', (comment) => {
      setMessages((prev) => [...prev, comment]);
      scrollToBottom();
    });
    return () => {
      socketRef.current.emit('leave_inventory', inventory.id);
      socketRef.current.disconnect();
    };
  }, [inventory.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;

    try {
      const response = await api.post(`/comments/inventory/${inventory.id}`, { content: newMessage });
      const savedComment = response.data.data;
      setMessages((prev) => [...prev, savedComment]);
      socketRef.current.emit('send_comment', {
        room: `inventory_${inventory.id}`,
        comment: savedComment
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      alert(t('discussionTab.error_msg', "Failed to post comment."));
    }
  };
  const chatAreaBg = isDark ? 'bg-dark border-secondary' : 'bg-light border';
  const myBubbleBg = isDark ? '#0d6efd' : '#cfe2ff'; 
  const myBubbleBorder = isDark ? '#0a58ca' : '#9ec5fe';
  const myBubbleText = isDark ? 'text-white' : 'text-dark';
  const theirBubbleBg = isDark ? '#2b3035' : '#ffffff'; 
  const theirBubbleBorder = isDark ? '#495057' : '#dee2e6';
  const theirBubbleText = isDark ? 'text-light' : 'text-dark';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';

  return (
    <div className="p-2 d-flex flex-column" style={{ height: '600px' }}>
      <div className={`p-3 rounded mb-3 flex-grow-1 overflow-auto shadow-sm ${chatAreaBg}`}>
        {messages.length === 0 ? (
          <p className={`text-center mt-5 ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
            {t('discussionTab.no_messages', 'No messages yet. Start the discussion!')}
          </p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.author?.id === user?.id;
            return (
              <div key={msg.id || index} className={`mb-3 ${isMe ? 'text-end' : ''}`}>
                <div 
                  className={`d-inline-block p-3 rounded shadow-sm text-start`}
                  style={{ 
                    maxWidth: '75%', 
                    backgroundColor: isMe ? myBubbleBg : theirBubbleBg,
                    border: `1px solid ${isMe ? myBubbleBorder : theirBubbleBorder}`,
                    color: isMe ? myBubbleText : theirBubbleText 
                  }}
                >
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                    <strong className={isMe ? (isDark ? 'text-light' : 'text-primary') : (isDark ? 'text-info' : 'text-dark')}>
                      {msg.author?.name || t('discussionTab.unknown_user', 'Unknown User')}
                    </strong>
                    <span className={isDark ? 'text-light opacity-75 ms-3' : 'text-muted ms-3'}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`markdown-body text-break ${isMe ? myBubbleText : theirBubbleText}`} style={{ fontSize: '0.95rem' }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {isAuthenticated ? (
        <Form onSubmit={handleSendMessage} className="mt-auto">
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder={t('discussionTab.input_placeholder', 'Type a message... (Markdown is supported!)')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={inputBgClass}
              required
            />
            <Button type="submit" variant="primary" className="ms-2 px-4">
              {t('discussionTab.send_btn', 'Send')}
            </Button>
          </Form.Group>
        </Form>
      ) : (
        <Alert variant={isDark ? "dark" : "warning"} className={`text-center mb-0 ${isDark ? 'border-secondary text-white' : ''}`}>
          {t('discussionTab.login_required', 'You must be logged in to participate in the discussion.')}
        </Alert>
      )}
    </div>
  );
};

export default DiscussionTab;