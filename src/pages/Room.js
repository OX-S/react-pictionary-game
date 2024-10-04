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
    const [showWaitingModal, setShowWaitingModal] = useState(false);

    const modalRef = useRef(null);

    // keep track of the newest timer
    const timerRef = useRef(null);

    useEffect(() => {
        socket.on('userList', (userList) => {
            setUsers(userList);

            // wait for second player popup
            if (userList.length < 2) {
                setShowWaitingModal(true);
                if (modalRef.current) {
                    modalRef.current.showModal();
                }
            } else {
                setShowWaitingModal(false);
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

            setTimeLeft(60);

            // Kill all old timers
            if (timerRef.current) {
                socket.off('timerUpdate', timerRef.current);
            }

            // New timer listener
            timerRef.current = (time) => {
                setTimeLeft(time);
            };
            socket.on('timerUpdate', timerRef.current);
        });

        timerRef.current = (time) => {
            setTimeLeft(time);
        };
        socket.on('timerUpdate', timerRef.current);

        socket.on('updateScores', (updatedScores) => {
            setScores(updatedScores);
        });

        return () => {
            // Kill all old socket listeners on component unmount
            socket.off('userList');
            socket.off('wordAssigned');
            socket.off('newRound');
            socket.off('updateScores');

            if (timerRef.current) {
                socket.off('timerUpdate', timerRef.current);
            }
        };
    }, [username]);

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Room: {roomId}</h1>
            <div className="timer mb-4">Time Left: {timeLeft} seconds</div>
            {isDrawer && assignedWord && (
                <div className="alert alert-info mb-4">
                    Your word to draw: <strong>{assignedWord}</strong>
                </div>
            )}
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-3/4 lg:mr-4">
                    <Canvas disabled={!isDrawer} />
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

            {/* Waiting for players popup */}
            <dialog id="waiting_modal" className="modal" ref={modalRef}>
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">Waiting for Other Players</h3>
                    <p className="py-4">
                        You are the only player in the room. Please wait for others to join.
                    </p>
                    <div className="modal-action">
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
