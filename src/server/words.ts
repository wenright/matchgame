const Words: string[] = [
    "Rain_",
    "Foot_",
    "_Air",
    "Fire_",
];

const getRandomWord = (previousWords: string[]): string => {
    const words = Words.filter((word) => !previousWords.includes(word));
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex] ?? "out of words";
}

export default getRandomWord;