import { v4 } from 'uuid';

export const getOrSetPlayerId = (): string => {
    const playerId = localStorage.getItem("playerId");
    if (playerId) {
        return playerId;
    }

    const newPlayerId = v4();
    localStorage.setItem("playerId", newPlayerId);
    return newPlayerId;
}