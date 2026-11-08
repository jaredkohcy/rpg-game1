import Phaser from "phaser";
import { QuestionSystem } from "../systems/QuestionSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { Monster } from "../types/Monster";

export class BattleScene extends Phaser.Scene {

  private monster!: Monster;
  private monsterHp = 0;

  private returnX = 400;
  private returnY = 300;

  private playerHp = 100;

  private showMonsterImage() {
    const textureKey = `monster-${this.monster.id}`;
    const addMonsterImage = () => {
      if (this.textures.exists(textureKey)) {
        this.add.image(
          this.scale.width - 200,
          170,
          textureKey
        ).setDisplaySize(160, 160);
      }
    };

    if (this.textures.exists(textureKey)) {
      addMonsterImage();
      return;
    }

    this.load.once(
      `filecomplete-image-${textureKey}`,
      addMonsterImage
    );
    this.load.once(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      (file: Phaser.Loader.File) => {
        if (file.key === textureKey) {
          console.error(`Failed to load monster image: ${this.monster.image}`);
        }
      }
    );
    this.load.image(textureKey, this.monster.image);
    this.load.start();
  }

  currentQuestion: any;

  playerHpText!: Phaser.GameObjects.Text;
  monsterHpText!: Phaser.GameObjects.Text;
  questionText!: Phaser.GameObjects.Text;

  constructor() {
    super("BattleScene");
  }

  loadNewQuestion() {

    let nextQuestion;

    do {

      nextQuestion =
        QuestionSystem.getRandomQuestion();

    } while (
      this.currentQuestion &&
      nextQuestion.id ===
      this.currentQuestion.id
    );

    this.currentQuestion =
      nextQuestion;

    this.questionText.setText(
      this.currentQuestion.question
    );
  }

  create(data: {
    monster: Monster;
    playerX: number;
    playerY: number;
  }) {

    this.cameras.main.setBackgroundColor(
      "#111111"
    );

    this.monster = data.monster;
    this.monsterHp = this.monster.maxHp;

    this.returnX = data.playerX;
    this.returnY = data.playerY;

    //
    // Load persisted HP
    //
    this.playerHp =
      SaveSystem.getPlayerHp();

    //
    // Register as seen
    //
    SaveSystem.seeMonster(
      this.monster.id
    );

    //
    // Header
    //
    this.add.text(
      100,
      40,
      "??? Appeared!",
      {
        fontSize: "32px",
        color: "#ffffff"
      }
    );

    //
    // HP
    //
    this.monsterHpText =
      this.add.text(
        40,
        100,
        `Monster HP: ${this.monsterHp}`,
        {
          fontSize: "24px",
          color: "#ff6666"
        }
      );

    this.playerHpText =
      this.add.text(
        40,
        150,
        `Player HP: ${this.playerHp}`,
        {
          fontSize: "24px",
          color: "#66ff66"
        }
      );

    if (this.monster.image) {
      this.showMonsterImage();
    }

    //
    // Question
    //
    this.questionText =
      this.add.text(
        40,
        250,
        "",
        {
          fontSize: "28px",
          color: "#ffffff",
          wordWrap: {
            width: 1200
          }
        }
      );

    this.loadNewQuestion();

    //
    // DOM Form
    //
    const form = this.add.dom(
      this.scale.width / 2,
      this.scale.height * 0.65
    ).createFromHTML(`
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

    const inputBox =
      form.node.querySelector(
        "#answer"
      ) as HTMLInputElement;

    const button =
      form.node.querySelector(
        "#submit"
      ) as HTMLButtonElement;

    setTimeout(() => {

      inputBox.focus();

    }, 50);

    //
    // Cleanup
    //
    const cleanup = () => {

      form.destroy();

    };

    //
    // Submit Answer
    //
    const submitAnswer = () => {

      const answer =
        inputBox.value
          .toLowerCase()
          .trim();

      if (
        answer.length === 0
      ) {
        return;
      }

      if (
        QuestionSystem.isCorrect(
          answer,
          this.currentQuestion.answers
        )
      ) {

        //
        // Correct answer
        //
        this.monsterHp -= 10;

        if (
          this.monsterHp < 0
        ) {
          this.monsterHp = 0;
        }

        this.monsterHpText.setText(
          `Monster HP: ${this.monsterHp}`
        );

        //
        // Monster captured
        //
        if (
          this.monsterHp <= 0
        ) {

          SaveSystem.captureMonster(
            this.monster.id
          );

          SaveSystem.setPlayerHp(
            this.playerHp
          );

          alert(
            `Captured ${this.monster.name}!\n\n${this.monster.lore}`
          );

          cleanup();

          this.scene.start(
            "WorldScene",
            {
              playerX:
                this.returnX,
              playerY:
                this.returnY
            }
          );

          return;
        }

        this.loadNewQuestion();

      } else {

        //
        // Wrong answer
        //
        this.playerHp -= 10;

        if (
          this.playerHp < 0
        ) {
          this.playerHp = 0;
        }

        SaveSystem.setPlayerHp(
          this.playerHp
        );

        this.playerHpText.setText(
          `Player HP: ${this.playerHp}`
        );

        //
        // Defeat
        //
        if (
          this.playerHp <= 0
        ) {

          alert(
            "You Were Defeated"
          );

          cleanup();

          this.scene.start(
            "WorldScene",
            {
              playerX:
                this.returnX,
              playerY:
                this.returnY
            }
          );

          return;
        }
      }

      inputBox.value = "";

      inputBox.focus();
    };

    //
    // Button Click
    //
    button.addEventListener(
      "click",
      submitAnswer
    );

    //
    // Enter Key
    //
    inputBox.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          submitAnswer();

        }
      }
    );

    //
    // Scene Cleanup
    //
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {

        form.destroy();

      }
    );
  }
}