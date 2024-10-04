import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const Login = () => {
    const [username, setUsername] =
        useState('');
    const [roomId, setRoomId] =
        useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (username.trim() && roomId.trim()) {
            socket.emit('joinRoom', roomId, username);
            navigate(`/room/${roomId}`, {
                state: { username },
            });
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="card w-96 bg-base-100 shadow-xl p-4">
                <h2 className="card-title mb-4">
                    Join a Room
                </h2>
                <input
                    className="input input-bordered w-full mb-2"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />
                <input
                    className="input input-bordered w-full mb-4"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) =>
                        setRoomId(e.target.value)
                    }
                />
                <button
                    className="btn btn-primary w-full"
                    onClick={handleJoin}
                >
                    Join
                </button>
            </div>
        </div>
    );
};

export default Login;
