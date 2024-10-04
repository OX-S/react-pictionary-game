// src/components/Canvas.js

import React, { useRef, useEffect, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import socket from '../socket';

const Canvas = ({ disabled }) => {
    const canvasRef = useRef(null);

    // State for drawing controls
    const [color, setColor] = useState('#000000');
    const [brushRadius, setBrushRadius] = useState(5);
    const [isEraserActive, setIsEraserActive] = useState(false);

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

    // Toggle eraser mode
    const toggleEraser = () => {
        setIsEraserActive(!isEraserActive);
        if (!isEraserActive) {
            setColor('#FFFFFF'); // Assuming white background
        } else {
            setColor('#000000'); // Default back to black or previous color
        }
    };

    // Clear canvas function
    const clearCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
            socket.emit('clearCanvas');
        }
    };

    return (
        <div className="border border-gray-300 p-2">
            {/* Drawing Controls */}
            {!disabled && (
                <div className="flex items-center mb-2">
                    {/* Color Picker */}
                    <label className="flex items-center mr-4">
                        <span className="mr-2">Color:</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={isEraserActive}
                            className="input input-bordered p-0 w-10 h-10"
                        />
                    </label>

                    {/* Brush Size Slider */}
                    <label className="flex items-center mr-4">
                        <span className="mr-2">Brush Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushRadius}
                            onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                            className="range range-xs"
                        />
                    </label>

                    {/* Eraser Toggle */}
                    <button
                        className={`btn mr-2 ${isEraserActive ? 'btn-active' : ''}`}
                        onClick={toggleEraser}
                    >
                        {isEraserActive ? 'Eraser On' : 'Eraser Off'}
                    </button>

                    {/* Clear Canvas Button */}
                    <button className="btn btn-error" onClick={clearCanvas}>
                        Clear Canvas
                    </button>
                </div>
            )}

            {/* Drawing Canvas */}
            <ReactSketchCanvas
                ref={canvasRef}
                strokeColor={isEraserActive ? '#FFFFFF' : color}
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
