import React from "react";

export default function Cell({ index, turn, isMyTurn, value }) {
    return (
        <div className="cell" onClick={() => turn(index)} style={{ cursor: isMyTurn ? "pointer" : "not-allowed" }}>
            {value}
        </div>
    );
}
