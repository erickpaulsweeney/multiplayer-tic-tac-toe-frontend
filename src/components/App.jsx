import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { nanoid } from "nanoid";
import Cell from "./Cell";

const socket = io("http://localhost:8000");

export default function App() {
    const [player, setPlayer] = useState("X");
    const [gameStart, setGameStart] = useState(false);
    const [roomLink, setRoomLink] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(""));
    const [turns, setTurns] = useState(0);
    const [turnData, setTurnData] = useState(false);
    const [XOTurn, setXOTurn] = useState("X");
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [winner, setWinner] = useState(false);

    const combinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // console.log(player, XOTurn);
    const params = window.location.href;
    const paramsRoom = params.split("/")[3];
    const [room, setRoom] = useState(paramsRoom || "No room yet");

    const sendTurn = (index) => {
        // console.log(board[index], winner, isMyTurn, gameStart)
        if (!board[index] && !winner & isMyTurn && gameStart) {
            socket.emit("turn-switch", JSON.stringify({ index, XOTurn, room }));
        }
    };

    const restart = () => {
        setBoard(Array(9).fill(""));
        setWinner(false);
        setTurns(0);
        setIsMyTurn(false);
    };

    const restartSignal = () => {
        socket.emit("restart", JSON.stringify({ room }));
    };

    useEffect(() => {
        if (paramsRoom.length > 0) {
            setXOTurn("O");
            setPlayer("O");
            socket.emit("join", paramsRoom);
            setRoom(paramsRoom);
            setIsMyTurn(false);
        } else {
            const roomID = nanoid(10);
            socket.emit("create", roomID);
            setRoom(roomID);
            setIsMyTurn(true);
        }
    }, [paramsRoom]);

    useEffect(() => {
        socket.on("opponent-move", (data) => {
            setTurnData(JSON.parse(data));
        });

        socket.on("restart", () => {
            restart();
        });

        socket.on("game-start", () => {
            setGameStart(true);
            setRoomLink(false);
        });
    }, []);

    useEffect(() => {
        console.log("status check", board)
        combinations.forEach((el) => {
            // console.log(board[el[0]], board[el[1]], board[el[2]]);
            if (
                board[el[0]] === board[el[1]] &&
                board[el[0]] === board[el[2]] &&
                board[el[0]] !== ""
            ) {
                setWinner(board[el[0]]);
                console.log(board[el[0]], player);
            }
        });

        if (turns === 0) {
            setIsMyTurn(XOTurn === "X" ? true : false);
        }
        // eslint-disable-next-line
    }, [board, turns, XOTurn]);

    useEffect(() => {
        if (turnData) {
            let newBoard = [...board];
            if (!newBoard[turnData.index] && !winner) {
                newBoard[turnData.index] = turnData.XOTurn;
                setBoard(newBoard);
                setTurns(turns + 1);
                setTurnData(false);
                setIsMyTurn(!isMyTurn);
            }
        }
        // eslint-disable-next-line
    }, [turnData, board, turns, isMyTurn, winner]);

    return (
        <div className="container-all">
            <div className="header">Multiplayer Tic Tac Toe</div>

            <div className="room-info">
                <div className="room">Room ID: {room}</div>
                {!gameStart && <button
                    className="create-button"
                    onClick={() => setRoomLink(!roomLink)}
                >
                    Create room
                </button>}
                {roomLink && (
                    <div className="link">
                        Room link for opponent:{" "}
                        <a href={room} className="room-link">
                            {window.location.href}{room}
                        </a>
                    </div>
                )}
            </div>

            <div className="game-info">
                <div className="turn">
                    Turn: {isMyTurn ? "You" : "Opponent"}
                </div>

                {!gameStart && (
                    <div className="waiting">Waiting for opponent...</div>
                )}

                {(winner || turns === 9) && (
                    <button className="restart" onClick={restartSignal}>
                        Play again
                    </button>
                )}

                {winner && (
                    <div className="winner">
                        {winner === player
                            ? "Congratulations! You win!"
                            : "Bad luck! Try again!"}
                    </div>
                )}

                {!winner && turns === 9 && (
                    <div className="draw">Game draw!</div>
                )}
            </div>

            <div className="board">
                <div className="row">
                    <Cell index={0} turn={sendTurn} isMyTurn={isMyTurn} value={board[0]} />
                    <Cell index={1} turn={sendTurn} isMyTurn={isMyTurn} value={board[1]} />
                    <Cell index={2} turn={sendTurn} isMyTurn={isMyTurn} value={board[2]} />
                </div>
                <div className="row">
                    <Cell index={3} turn={sendTurn} isMyTurn={isMyTurn} value={board[3]} />
                    <Cell index={4} turn={sendTurn} isMyTurn={isMyTurn} value={board[4]} />
                    <Cell index={5} turn={sendTurn} isMyTurn={isMyTurn} value={board[5]} />
                </div>
                <div className="row">
                    <Cell index={6} turn={sendTurn} isMyTurn={isMyTurn} value={board[6]} />
                    <Cell index={7} turn={sendTurn} isMyTurn={isMyTurn} value={board[7]} />
                    <Cell index={8} turn={sendTurn} isMyTurn={isMyTurn} value={board[8]} />
                </div>
            </div>
            
            <div className="area">
                <ul className="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    );
}
