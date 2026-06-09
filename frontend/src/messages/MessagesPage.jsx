import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './MessagesPage.module.css';
import { getConversations, getMessages, sendMessage, buildConversationId } from '../services/messageService';
import { useSocket } from '../context/SocketContext';

function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  const withUserId = searchParams.get('with');
  const listingId = searchParams.get('listing');
  const withUserName = searchParams.get('name');

  useEffect(() => {
    getConversations()
      .then((data) => {
        setConversations(data);
        if (withUserId) {
          const convId = buildConversationId(currentUserId, withUserId, listingId);
          const existing = data.find((c) => c.conversationId === convId);
          if (existing) {
            setActiveId(existing.conversationId);
          } else {
            setActiveId(convId);
            setConversations((prev) => [
              {
                conversationId: convId,
                otherUser: { _id: withUserId, name: withUserName || 'New conversation' },
                listing: listingId ? { _id: listingId } : null,
                lastMessage: null,
                unread: 0,
                isDraft: true,
              },
              ...prev,
            ]);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [withUserId, listingId, withUserName, currentUserId]);

  useEffect(() => {
    if (!activeId || activeId.includes('undefined')) return;
    const draft = conversations.find((c) => c.conversationId === activeId)?.isDraft;
    if (draft) {
      setMessages([]);
      return;
    }
    getMessages(activeId).then(setMessages).catch((err) => setError(err.message));
  }, [activeId, conversations]);

  useEffect(() => {
    if (!socket || !activeId || !currentUserId) return;

    const otherUserId = withUserId || conversations.find((c) => c.conversationId === activeId)?.otherUser?._id;
    socket.emit('join', currentUserId);
    if (otherUserId) {
      socket.emit('joinConversation', {
        userId: currentUserId,
        otherUserId,
        listingId: listingId || conversations.find((c) => c.conversationId === activeId)?.listing?._id,
      });
    }

    const handler = (msg) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.conversationId === msg.conversationId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: msg, isDraft: false };
        return updated;
      });
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [socket, activeId, currentUserId, withUserId, listingId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const active = conversations.find((c) => c.conversationId === activeId);

  const selectConversation = (conv) => {
    setActiveId(conv.conversationId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('with', conv.otherUser._id);
      if (conv.listing?._id) next.set('listing', conv.listing._id);
      else next.delete('listing');
      return next;
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    setError('');
    try {
      const msg = await sendMessage({
        receiver: active.otherUser._id,
        listing: active.listing?._id || listingId || undefined,
        text: text.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setText('');
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === activeId
            ? {
                ...c,
                lastMessage: msg,
                isDraft: false,
                otherUser:
                  String(msg.receiver?._id || msg.receiver) === String(currentUserId)
                    ? msg.sender || c.otherUser
                    : msg.receiver || c.otherUser,
              }
            : c
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2>Messages</h2>
      <p className={styles.hint}>Chat with restaurants or NGOs about pickups and donations.</p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {loading ? (
            <p>...</p>
          ) : conversations.length === 0 ? (
            <p className={styles.empty}>No conversations yet. Message a restaurant from a listing or the map.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.conversationId}
                type="button"
                className={activeId === c.conversationId ? styles.active : ''}
                onClick={() => selectConversation(c)}
              >
                <span className={styles.convName}>
                  {c.otherUser?.name || 'User'}
                  {c.unread > 0 && <span className={styles.unread}>({c.unread})</span>}
                </span>
                {c.listing?.title && <span className={styles.convListing}>Re: {c.listing.title}</span>}
                {c.lastMessage?.text && <span className={styles.convPreview}>{c.lastMessage.text}</span>}
              </button>
            ))
          )}
        </aside>
        <section className={styles.chat}>
          {active ? (
            <>
              <div className={styles.chatHeader}>
                <strong>{active.otherUser?.name || 'Conversation'}</strong>
                {active.listing?.title && <span> — {active.listing.title}</span>}
              </div>
              <div className={styles.messages}>
                {messages.length === 0 && <p className={styles.emptyChat}>No messages yet. Say hello!</p>}
                {messages.map((m) => {
                  const isMine = String(m.sender?._id || m.sender) === String(currentUserId);
                  return (
                    <div
                      key={m._id}
                      className={`${styles.bubble} ${isMine ? styles.mine : styles.theirs}`}
                    >
                      {!isMine && <span className={styles.senderName}>{m.sender?.name}</span>}
                      <p>{m.text}</p>
                      <time className={styles.time}>
                        {new Date(m.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className={styles.form}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !text.trim()}>
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <p className={styles.emptyChat}>Select a conversation or start one from a listing.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default MessagesPage;
