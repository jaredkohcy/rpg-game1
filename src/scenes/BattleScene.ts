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

  private questionImage?: Phaser.GameObjects.Image;
  private questionImageMask?: Phaser.Display.Masks.GeometryMask;
  private questionImageMaskSource?: Phaser.GameObjects.Graphics;
  private questionScrollHint?: Phaser.GameObjects.Text;
  private questionImageViewport = { x: 40, y: 250, width: 1520, height: 610 };
  private questionImageHeight = 0;
  private questionImageScrollOffset = 0;

  private positionQuestionImage() {
    if (!this.questionImage) {
      return;
    }

    const { y, height } = this.questionImageViewport;
    const imageY = this.questionImageHeight <= height
      ? y + height / 2
      : y + this.questionImageHeight / 2 - this.questionImageScrollOffset;

    this.questionImage.setPosition(this.scale.width / 2, imageY);
  }

  private handleQuestionWheel(
    pointer: Phaser.Input.Pointer,
    _currentlyOver: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ) {
    const { x, y, width, height } = this.questionImageViewport;
    const maxOffset = Math.max(0, this.questionImageHeight - height);

    if (
      !this.questionImage?.visible ||
      maxOffset === 0 ||
      pointer.x < x ||
      pointer.x > x + width ||
      pointer.y < y ||
      pointer.y > y + height
    ) {
      return;
    }

    this.questionImageScrollOffset = Phaser.Math.Clamp(
      this.questionImageScrollOffset + deltaY,
      0,
      maxOffset
    );
    this.positionQuestionImage();
  }

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

  private showQuestionImage() {
    const question = this.currentQuestion;
    if (!question?.image) {
      return;
    }

    const textureKey = `question-${question.id}`;
    const addQuestionImage = () => {
      if (this.currentQuestion.id !== question.id) {
        return;
      }

      const source = this.textures.get(textureKey).getSourceImage();
      const scale = Math.min(
        this.questionImageViewport.width / source.width,
        1
      );
      const imageWidth = source.width * scale;
      this.questionImageHeight = source.height * scale;
      this.questionImageScrollOffset = 0;

      if (!this.questionImage) {
        this.questionImage = this.add.image(
          this.scale.width / 2,
          0,
          textureKey
        );
      } else {
        this.questionImage.setTexture(textureKey);
      }

      this.questionImage
        .setDisplaySize(imageWidth, this.questionImageHeight)
        .setMask(this.questionImageMask!)
        .setVisible(true);
      this.positionQuestionImage();
      this.questionScrollHint?.setVisible(
        this.questionImageHeight > this.questionImageViewport.height
      );
    };

    if (this.textures.exists(textureKey)) {
      addQuestionImage();
      return;
    }

    this.load.once(`filecomplete-image-${textureKey}`, addQuestionImage);
    this.load.once(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      (file: Phaser.Loader.File) => {
        if (file.key === textureKey) {
          console.error(`Failed to load question image: ${question.image}`);
        }
      }
    );
    this.load.image(textureKey, question.image);
    this.load.start();
  }

  currentQuestion: any;

  playerHpText!: Phaser.GameObjects.Text;
  monsterHpText!: Phaser.GameObjects.Text;
  questionText!: Phaser.GameObjects.Text;
  answerFeedback!: Phaser.GameObjects.Text;

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

    this.questionImage?.setVisible(false);
    this.questionScrollHint?.setVisible(false);
    this.questionImageScrollOffset = 0;
    this.showQuestionImage();
  }

  create(data: {
    monster: Monster;
    playerX: number;
    playerY: number;
  }) {

    this.cameras.main.setBackgroundColor(
      "#111111"
    );

    this.questionImageViewport = {
      x: 40,
      y: 250,
      width: this.scale.width - 80,
      height: this.scale.height - 290
    };

    this.questionImageMaskSource?.destroy();
    this.questionImageMaskSource = this.make.graphics({ x: 0, y: 0 });
    this.questionImageMaskSource.fillStyle(0xffffff);
    this.questionImageMaskSource.fillRect(
      this.questionImageViewport.x,
      this.questionImageViewport.y,
      this.questionImageViewport.width,
      this.questionImageViewport.height
    );
    this.questionImageMask = this.questionImageMaskSource.createGeometryMask();

    this.questionScrollHint = this.add.text(
      this.scale.width / 2,
      this.scale.height - 24,
      "Scroll over the image to view more",
      {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#111111",
        padding: { x: 8, y: 4 }
      }
    ).setOrigin(0.5).setVisible(false);

    this.input.on(
      Phaser.Input.Events.POINTER_WHEEL,
      this.handleQuestionWheel,
      this
    );

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.input.off(
          Phaser.Input.Events.POINTER_WHEEL,
          this.handleQuestionWheel,
          this
        );
        this.questionImageMask?.destroy();
        this.questionImageMaskSource?.destroy();
        this.questionImageMask = undefined;
        this.questionImageMaskSource = undefined;
        this.questionImage = undefined;
        this.questionScrollHint = undefined;
      }
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

    this.answerFeedback = this.add.text(
      this.scale.width / 2,
      215,
      "",
      {
        fontSize: "20px",
        color: "#ff6666"
      }
    ).setOrigin(0.5);

    //
    // DOM Form
    //
    const form = this.add.dom(
      this.scale.width / 2,
      170
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
        const damage = Math.min(10, this.monsterHp);
        this.monsterHp -= damage;
        this.answerFeedback
          .setColor("#66ff66")
          .setText(
            `Correct! Monster life has been reduced by ${damage} HP.`
          );

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

          cleanup();
          const captureMessage = this.add.dom(
            this.scale.width / 2,
            this.scale.height / 2
          ).createFromHTML(`
            <div style="
              width: 440px;
              padding: 24px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
              color: white;
              background: #222;
              border: 3px solid #66ff66;
              border-radius: 12px;
              text-align: center;
              font-family: sans-serif;
            ">
              <h2 style="margin: 0;">Captured!</h2>
              <img
                data-monster-image
                alt=""
                style="width: 180px; height: 180px; object-fit: contain;"
              />
              <strong data-monster-name style="font-size: 22px;"></strong>
              <p data-monster-lore style="margin: 0;"></p>
              <button style="font-size: 18px; padding: 8px 20px;">
                Continue
              </button>
            </div>
          `);

          (captureMessage.node.querySelector(
            "[data-monster-image]"
          ) as HTMLImageElement).src = this.monster.image;
          captureMessage.node.querySelector(
            "[data-monster-name]"
          )!.textContent = this.monster.name;
          captureMessage.node.querySelector(
            "[data-monster-lore]"
          )!.textContent = this.monster.lore;
          const closeCaptureMessage = () => {
            window.removeEventListener(
              "keydown",
              handleCaptureMessageKeydown
            );
            captureMessage.destroy();
            this.scene.start(
              "WorldScene",
              {
                playerX: this.returnX,
                playerY: this.returnY
              }
            );
          };
          const handleCaptureMessageKeydown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
              event.preventDefault();
              closeCaptureMessage();
            }
          };
          window.setTimeout(
            () => window.addEventListener(
              "keydown",
              handleCaptureMessageKeydown
            ),
            0
          );
          captureMessage.node.querySelector("button")!.addEventListener(
            "click",
            closeCaptureMessage
          );

          return;
        }

        this.loadNewQuestion();

      } else {

        this.answerFeedback.setColor("#ff6666");
        this.answerFeedback.setText(
          "Wrong answer! You lost 10 HP."
        );

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