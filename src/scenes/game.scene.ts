import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private readonly PLAYER_SPEED = 200;
  private readonly PAUSED_GAME_TEXT = `game is paused, press P to unpause`;

  player1!: Phaser.GameObjects.Rectangle;
  player2!: Phaser.GameObjects.Rectangle;
  ball!: Phaser.Geom.Circle;
  ballVelocity = { x: -200, y: 150 };
  deltaMs!: number;
  lastPlayerTouch: number = 0;
  player1Score: number = 0;
  player2Score: number = 0;
  scoreBoard!: Phaser.GameObjects.Text;
  ballGraphics!: Phaser.GameObjects.Graphics;

  isGameRunning = false;

  constructor() {
    super("game-scene");
  }

  create() {
    this.player1 = this.add.rectangle(50, 200, 20, 80, 0xff0000);
    this.player2 = this.add.rectangle(750, 200, 20, 80, 0x0000ff);

    this.ball = new Phaser.Geom.Circle(400, 200, 10);
    this.ballGraphics = this.add.graphics();

    this.ballGraphics.fillStyle(0xffffff);
    this.ballGraphics.fillCircleShape(this.ball);

    this.scoreBoard = this.add
      .text(this.cameras.main.centerX, 100, this.PAUSED_GAME_TEXT)
      .setOrigin(0.5);

    this.isGameRunning = false;

    this.input.keyboard?.on("keyup-P", () => {
      this.scoreBoard.text = this.isGameRunning
        ? this.PAUSED_GAME_TEXT
        : `${this.player1Score} X ${this.player2Score}`;
      this.isGameRunning = !this.isGameRunning;
    });

    this.input.keyboard?.on("keyup-R", (e: KeyboardEvent) => {
      if (!e.shiftKey) return;

      this.scoreBoard.text = `restarting game`;
      this.isGameRunning = false;
      this.ballVelocity = { x: -200, y: 150 };

      setTimeout(() => {
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1.y = 200;
        this.player2.y = 200;

        this.ballGraphics.clear();
        this.ball.x = 400;
        this.ball.y = 200;
        this.ballGraphics.fillStyle(0xffffff);
        this.ballGraphics.fillCircleShape(this.ball);

        this.scoreBoard.text = this.PAUSED_GAME_TEXT;
      }, 1000);
    });
  }

  update(): void {
    if (!this.isGameRunning) return;

    this.ballMovement();

    this.playersMovement();

    this.colisionPlayerWithBall();

    this.playerScore();
  }

  private colisionPlayerWithBall() {
    const time = Math.floor(this.time.now / 1000);

    const player1Bounds = this.player1.getBounds();
    const player2Bounds = this.player2.getBounds();

    const colideWithPlayer1 = Phaser.Geom.Intersects.CircleToRectangle(
      this.ball,
      player1Bounds,
    );
    const colideWithPlayer2 = Phaser.Geom.Intersects.CircleToRectangle(
      this.ball,
      player2Bounds,
    );
    const isFirstTouch = this.lastPlayerTouch === 0;
    const canTouch =
      isFirstTouch ||
      // last touch over 1 second ago
      time - this.lastPlayerTouch > 1;

    if ((colideWithPlayer1 || colideWithPlayer2) && canTouch) {
      this.ballVelocity.x *= -1;
      this.lastPlayerTouch = time;
    }
  }

  private playersMovement() {
    this.playerMovementUp(this.player1, "W", "D");
    this.playerMovementDown(this.player1, "S", "D");

    this.playerMovementUp(
      this.player2,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    );
    this.playerMovementDown(
      this.player2,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    );
  }

  private playerMovementUp(
    player: Phaser.GameObjects.Rectangle,
    key: Phaser.Input.Keyboard.Key | string | number,
    speedKey: Phaser.Input.Keyboard.Key | string | number,
  ) {
    const playerPosition = player.getTopCenter().y - 1;
    const speedMultiplier = this.input.keyboard?.addKey(speedKey).isDown
      ? 1.5
      : 1;

    if (this.input.keyboard?.addKey(key).isDown && playerPosition > 0) {
      const deltaMs = this.game.loop.delta / 1000;

      player.y -= this.PLAYER_SPEED * deltaMs * speedMultiplier;
    }
  }

  private playerMovementDown(
    player: Phaser.GameObjects.Rectangle,
    key: Phaser.Input.Keyboard.Key | string | number,
    speedKey: Phaser.Input.Keyboard.Key | string | number,
  ) {
    const playerPosition = player.getBottomCenter().y + 1;
    const speedMultiplier = this.input.keyboard?.addKey(speedKey).isDown
      ? 1.5
      : 1;

    if (
      this.input.keyboard?.addKey(key).isDown &&
      playerPosition < this.scene.scene.game.context.canvas.height
    ) {
      const deltaMs = this.game.loop.delta / 1000;

      player.y += this.PLAYER_SPEED * deltaMs * speedMultiplier;
    }
  }

  private ballMovement() {
    this.ballGraphics.clear();
    const deltaMs = this.game.loop.delta / 1000;

    this.ball.x += this.ballVelocity.x * deltaMs;
    this.ball.y += this.ballVelocity.y * deltaMs;

    /**
     * ball touching the ceiling
     */
    if (
      this.ball.y - this.ball.radius <= 0 ||
      this.ball.y + this.ball.radius >= 600
    ) {
      this.ballVelocity.y *= -1;
    }

    this.ballGraphics.fillStyle(0xffffff);
    this.ballGraphics.fillCircleShape(this.ball);
  }

  private playerScore() {
    const { width } = this.scene.scene.game.context.canvas;

    const player1Scored = this.ball.x >= width - this.ball.radius;
    const player2Scored = this.ball.x <= this.ball.radius;
    if (player1Scored) {
      this.player1Score += 1;
      this.updateScoreboard();
    }

    if (player2Scored) {
      this.player2Score += 1;
      this.updateScoreboard();
    }
  }

  private updateScoreboard() {
    this.scoreBoard.text = `${this.player1Score} X ${this.player2Score}`;
    this.ball.setPosition(400, 200);

    this.isGameRunning = false;
    setTimeout(() => {
      this.isGameRunning = true;
    }, 1000);
  }
}
