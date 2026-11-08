import Phaser from "phaser";
import { QuestionSystem } from "../systems/QuestionSystem";
import { SaveSystem } from "../systems/SaveSystem";
export class HealthStationScene extends Phaser.Scene {
    constructor() {
        super("HealthStationScene");
        this.stationId = "";
        this.returnX = 2500;
        this.returnY = 2500;
        this.currentQuestionNumber = 1;
        this.totalQuestions = 5;
        this.correctAnswers = 0;
    }
    loadNewQuestion() {
        this.currentQuestion =
            QuestionSystem.getRandomQuestion();
        this.questionText.setText(this.currentQuestion.question);
        this.progressText.setText(`Question ${this.currentQuestionNumber}/${this.totalQuestions}`);
    }
    create(data) {
        this.currentQuestionNumber = 1;
        this.correctAnswers = 0;
        this.stationId =
            data.stationId;
        this.returnX =
            data.playerX;
        this.returnY =
            data.playerY;
        this.cameras.main.setBackgroundColor("#003344");
        this.add.text(40, 30, "Health Crystal", {
            fontSize: "36px",
            color: "#00ffff"
        });
        this.add.text(40, 90, "Answer questions to restore health", {
            fontSize: "22px",
            color: "#ffffff"
        });
        this.progressText =
            this.add.text(40, 140, "", {
                fontSize: "20px",
                color: "#ffff66"
            });
        this.questionText =
            this.add.text(40, 220, "", {
                fontSize: "28px",
                color: "#ffffff",
                wordWrap: {
                    width: 1200
                }
            });
        this.loadNewQuestion();
        //
        // DOM Form
        //
        const form = this.add.dom(this.scale.width / 2, this.scale.height * 0.70).createFromHTML(`
      <div
        style="
          display:flex;
          gap:10px;
          align-items:center;
        "
      >
        <input
          id="answer"
          type="text"
          autocomplete="off"
          style="
            width:400px;
            font-size:20px;
            padding:8px;
          "
        />

        <button
          id="submit"
          style="
            font-size:20px;
            padding:8px 16px;
          "
        >
          Submit
        </button>
      </div>
    `);
        const inputBox = form.node.querySelector("#answer");
        const button = form.node.querySelector("#submit");
        setTimeout(() => inputBox.focus(), 50);
        const cleanup = () => {
            form.destroy();
        };
        const finishStation = () => {
            const healAmount = this.correctAnswers * 5;
            SaveSystem.healPlayer(healAmount);
            //   SaveSystem.markHealthStationUsed(
            //     this.stationId
            //   );
            alert(`Correct Answers: ${this.correctAnswers}/${this.totalQuestions}

Recovered ${healAmount} HP`);
            cleanup();
            this.scene.start("WorldScene", {
                playerX: this.returnX + 100,
                playerY: this.returnY + 100
            });
        };
        const submitAnswer = () => {
            const answer = inputBox.value
                .toLowerCase()
                .trim();
            if (answer.length === 0) {
                return;
            }
            const correct = QuestionSystem.isCorrect(answer, this.currentQuestion.answers);
            if (correct) {
                this.correctAnswers++;
            }
            this.currentQuestionNumber++;
            if (this.currentQuestionNumber >
                this.totalQuestions) {
                finishStation();
                return;
            }
            this.loadNewQuestion();
            inputBox.value = "";
            inputBox.focus();
        };
        button.addEventListener("click", submitAnswer);
        inputBox.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                submitAnswer();
            }
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            form.destroy();
        });
    }
}
