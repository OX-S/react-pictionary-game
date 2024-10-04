import React, { useRef, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import socket from '../socket';

const Canvas = ({ color, brushRadius, disabled }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!disabled) {
            socket.on('drawing', (data) => {
                if (canvasRef.current && data) {
                    canvasRef.current.loadPaths(data);
                }
            });

            return () => {
                socket.off('drawing');
            };
        }
    }, [disabled]);

    const handleChange = async () => {
        if (canvasRef.current) {
            const data = await canvasRef.current.exportPaths();
            socket.emit('drawing', data);
        }
    };

    return (
        <div className="border border-gray-300">
            <ReactSketchCanvas
                ref={canvasRef}
                strokeColor={color}
                strokeWidth={brushRadius}
                onStroke={handleChange}
                width="100%"
                height="400px"
                style={{ border: 'none' }}
            />
        </div>
    );
};

export default Canvas;
