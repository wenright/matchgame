const Phrases: string[] = [
    "Every morning, before coffee, [n] is absolutely [w].",
    "You know your date is going badly when they take you to a restaurant that serves [w] pizza.",
    "During the world's weirdest weather report, the meteorologist said tomorrow's forecast includes a slight chance of [w].",
    "The newest trend in fashion is the [w] hat, which looks great but is really hard to wear.",
    "At the company picnic, everyone was shocked when the boss jumped into the pool wearing a [w].",
    "[n] is so lazy, instead of a car, he rides to work on a [w].",
    "The secret ingredient in Grandma's pie was discovered to be [w], which explains why it was so addictive.",
    "The worst job at the zoo has to be the person who has to clean the [w] enclosure.",
    "For his science project, [n] created a volcano that instead of lava, erupted [w].",
    "I knew the apartment was too cheap to be true when I found out it was infested with [w].",
    "The latest fitness craze is a workout class based on [w], and it's surprisingly effective.",
    "At the medieval fair, the most popular attraction was the jousting tournament, but the least popular was the [w] kissing booth.",
    "The magician got arrested when his trick went wrong and he accidentally turned the mayor into a [w].",
    "In an effort to save money, [n] started using [w] instead of laundry detergent.",
    "The latest health craze is drinking [w] juice, which is supposed to have amazing benefits, but tastes like socks.",
    "[n]'s idea of a high-tech security system is a door lock that only opens if you whisper [w] to it.",
    "At the gym, [n] invented a new exercise that involves lifting [w] instead of weights.",
    "The theme for this year's office party was 'Bring Your [w] to Work Day', which turned out to be chaotic.",
    "[n] was surprised to find out that their new roommate was a professional [w] collector.",
];

const getRandomPhrase = (previousPhrases: number[]): number => {
    const phrases = Phrases.filter((phrase, index) => !previousPhrases[index]);
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return randomIndex ?? -1;
}

export default getRandomPhrase;

export { Phrases, getRandomPhrase };
