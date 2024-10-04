import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import socket from '../socket';

const Room = () => {
    const { roomId } = useParams();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('userList', (userList) => {
            setUsers(userList);
        });

        return () => {
            socket.off('userList');
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Room: {roomId}</h1>
            <div className="flex">
                <div className="w-3/4 mr-4">
                    <Canvas color="#000" brushRadius={2} />
                </div>
                <div className="w-1/4">
                    <Chat />
                    <div className="user-list mt-4">
                        <h2 className="text-xl mb-2">Players</h2>
                        <ul>
                            {users.map((user) => (
                                <li key={user.id} className="mb-1">
                                    {user.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Room;
