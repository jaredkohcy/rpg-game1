import questions from "../data/questions.json";
export class QuestionSystem {
    static getRandomQuestion() {
        const index = Math.floor(Math.random() * questions.length);
        return questions[index];
    }
    static isCorrect(answer, acceptedAnswers) {
        const normalized = answer
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "");
        return acceptedAnswers.some(a => a
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "") === normalized);
    }
}
