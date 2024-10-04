import React, {
    useState,
    useEffect,
} from 'react';
import socket from '../socket';

const Chat = () => {
    const [messages, setMessages] =
        useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((msgs) => [
                ...msgs,
                message,
            ]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit('guess', input);
            setInput('');
        }
    };

    return (
        <div className="chat-window bg-white p-4 border border-gray-300">
            <div className="messages h-64 overflow-y-scroll mb-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="message mb-2">
                        <strong>{msg.username}:</strong> {msg.text}
                        {msg.correct && (
                            <span className="text-green-500"> (Correct!)</span>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex">
                <input
                    className="input input-bordered w-full mr-2"
                    value={input}
                    onChange={(e) =>
                        setInput(e.target.value)
                    }
                />
                <button
                    className="btn btn-primary"
                    type="submit"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
