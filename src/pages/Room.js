// src/pages/Room.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import socket from '../socket';

const Room = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const username = location.state.username;

    const [users, setUsers] = useState([]);
    const [isDrawer, setIsDrawer] = useState(false);
    const [assignedWord, setAssignedWord] = useState('');
    const [scores, setScores] = useState({});
    const [timeLeft, setTimeLeft] = useState(60);

    // State to control modal visibility
    const [showWaitingModal, setShowWaitingModal] = useState(false);

    // Reference to the modal element
    const modalRef = useRef(null);

    useEffect(() => {
        socket.on('userList', (userList) => {
            setUsers(userList);

            // Show modal if only one player is in the room
            if (userList.length < 2) {
                setShowWaitingModal(true);
                // Show the modal using the ref
                if (modalRef.current) {
                    modalRef.current.showModal();
                }
            } else {
                setShowWaitingModal(false);
                // Close the modal if more players join
                if (modalRef.current) {
                    modalRef.current.close();
                }
            }
        });

        socket.on('wordAssigned', (word) => {
            setAssignedWord(word);
            setIsDrawer(true);
        });

        socket.on('newRound', ({ drawer }) => {
            setIsDrawer(drawer === username);
            if (drawer !== username) {
                setAssignedWord('');
            }
        });

        socket.on('updateScores', (updatedScores) => {
            setScores(updatedScores);
        });

        socket.on('timerUpdate', (time) => {
            setTimeLeft(time);
        });

        return () => {
            socket.off('userList');
            socket.off('wordAssigned');
            socket.off('newRound');
            socket.off('updateScores');
            socket.off('timerUpdate');
        };
    }, [username]);

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Room: {roomId}</h1>
            <div className="timer mb-4">Time Left: {timeLeft} seconds</div>
            {isDrawer && (
                <div className="alert alert-info mb-4">
                    Your word to draw: <strong>{assignedWord}</strong>
                </div>
            )}
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-3/4 lg:mr-4">
                    <Canvas color="#000" brushRadius={2} disabled={!isDrawer} />
                </div>
                <div className="lg:w-1/4">
                    <Chat />
                    <div className="user-list mt-4">
                        <h2 className="text-xl mb-2">Players</h2>
                        <ul className="menu bg-base-100 w-full p-2 rounded-box">
                            {users.map((user) => (
                                <li key={user.id}>
                                    <a>{user.username}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="scores mt-4">
                        <h2 className="text-xl mb-2">Scores</h2>
                        <ul className="menu bg-base-100 w-full p-2 rounded-box">
                            {Object.entries(scores).map(([player, score]) => (
                                <li key={player}>
                                    <a>
                                        {player}: {score}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* DaisyUI Modal */}
            <dialog id="waiting_modal" className="modal" ref={modalRef}>
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">Waiting for Other Players</h3>
                    <p className="py-4">
                        You are the only player in the room. Please wait for others to join.
                    </p>
                    <div className="modal-action">
                        {/* The button will close the modal */}
                        <button className="btn" onClick={() => modalRef.current.close()}>
                            Close
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default Room;
