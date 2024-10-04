// src/components/Canvas.js

import React, { useRef, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import socket from '../socket';

const Canvas = ({ color, brushRadius, disabled }) => {
    const canvasRef = useRef(null);

    // Listen for drawing data from other clients
    useEffect(() => {
        socket.on('drawing', (data) => {
            if (canvasRef.current && data) {
                canvasRef.current.loadPaths(data);
            }
        });

        return () => {
            socket.off('drawing');
        };
    }, []);

    // Listen for canvas clear event
    useEffect(() => {
        socket.on('clearCanvas', () => {
            if (canvasRef.current) {
                canvasRef.current.clearCanvas();
            }
        });

        return () => {
            socket.off('clearCanvas');
        };
    }, []);

    // Handle drawing events
    const handleStroke = async () => {
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
                width="100%"
                height="400px"
                className="canvas"
                onStroke={handleStroke}
                style={{ border: 'none' }}
                canvasColor="#FFFFFF"
                withTimestamp={true}
                allowOnlyPointerType="all"
                readOnly={disabled}
            />
        </div>
    );
};

export default Canvas;
