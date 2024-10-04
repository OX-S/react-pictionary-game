import React, { useRef, useEffect, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import socket from '../socket';

const Canvas = ({ disabled }) => {
    const canvasRef = useRef(null);

    const [color, setColor] = useState('#000000');
    const [brushRadius, setBrushRadius] = useState(5);
    const [isEraserActive, setIsEraserActive] = useState(false);
    const [previousColor, setPreviousColor] = useState('#000000'); // Stores previous color, so I can return to prev color after deselecting eraser



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

    const undo = () => {
        if (canvasRef.current) {
            canvasRef.current.undo();
            handleStroke();
        }
    };

    const redo = () => {
        if (canvasRef.current) {
            canvasRef.current.redo();
            handleStroke();
        }
    };

    const handleStroke = async () => {
        if (canvasRef.current) {
            const data = await canvasRef.current.exportPaths();
            socket.emit('drawing', data);
        }
    };

    const toggleEraser = () => {
        setIsEraserActive(!isEraserActive);
        if (!isEraserActive) {
            setPreviousColor(color);
            setColor('#FFFFFF');
        } else {
            setColor(previousColor);
        }
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
            socket.emit('clearCanvas');
        }
    };

    // const fillCanvas = async () => {
    //     if (canvasRef.current) {
    //         // Get the current paths
    //         const paths = await canvasRef.current.exportPaths();
    //
    //         // Create a new path that fills the canvas
    //         const fillPath = {
    //             drawMode: 'fill',
    //             paths: [
    //                 {
    //                     x: 0,
    //                     y: 0,
    //                 },
    //                 {
    //                     x: canvasRef.current.props.width,
    //                     y: canvasRef.current.props.height,
    //                 },
    //             ],
    //             strokeColor: color,
    //             strokeWidth: 0,
    //         };
    //
    //         // Add the fill path
    //         canvasRef.current.loadPaths([...paths, fillPath]);
    //
    //         // Emit the updated paths
    //         const data = await canvasRef.current.exportPaths();
    //         socket.emit('drawing', data);
    //     }
    // };


    return (
        <div className="border border-gray-300 p-2">
            {/* Brush Controls */}
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

                    {/* Brush Size */}
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

                    {/* Clear Canvas */}
                    <button className="btn btn-error mr-2" onClick={clearCanvas}>
                        Clear Canvas
                    </button>


                    {/*<button className="btn mr-2" onClick={fillCanvas}>*/}
                    {/*    Fill*/}
                    {/*</button>*/}


                    {/* Undo/Redo */}
                    <button className="btn mr-2" onClick={undo}>
                        Undo
                    </button>
                    <button className="btn mr-2" onClick={redo}>
                        Redo
                    </button>
                </div>
            )}

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
