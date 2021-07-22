class Game
{
    constructor(canvasEl, window)
    {
        this.lifes = 3;
        this.window = window;
        this.canvas = canvasEl;
        this.paused = false;
        this.running = false;
        this.movingPaddleLeft = false;
        this.movingPaddleRight = false;

        this.screen = new Screen(this.canvas.getContext('2d'));
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height - 30, 10);
        this.paddle = new Paddle(this.canvas.width / 2, this.canvas.height - 10, this.ball);
        this.screen.addPaddle(this.paddle);
        this.screen.addBall(this.ball);
        this.level = new Level(this.ball, 1).levelFactory();
        this.level.bricks.forEach((brick) => this.screen.addBrick(brick));

        this.initElements();
        this.render();
    }

    initElements()
    {
        var game = this;

        game.ball.lost_life = function ()
        {
            game.ball = new Ball(game.canvas.width / 2, game.canvas.height - 30, 10);
            game.paddle = new Paddle(game.canvas.width / 2, game.canvas.height - 10, game.ball);
            game.screen.addPaddle(game.paddle);
            game.screen.addBall(game.ball);
            game.level.ball = game.ball;

            game.lifes = game.lifes - 1;
            game.playing = false;
        };
    }

    start(options)
    {
        this.canvas.classList.add('gameRunning');
        this.playing = true;
    }

    render = () =>
    {
        var that = this;
        window.requestAnimationFrame(function ()
        {
            let paddleLen = that.paddle.width;
            let xPaddleEnd = that.paddle.ScreenPosition.xPosition + paddleLen;

            if (!that.paused && that.lifes > 0)
            {
                if (that.movingPaddleLeft)
                    that.paddle.moveLeft(0);
                if (that.movingPaddleRight)
                    that.paddle.moveRight(that.canvas.width);

                if (that.playing && !that.paused)
                    that.ball.move(0, 0, that.canvas.height, that.canvas.width);
                else
                    that.ball.setPositionX(xPaddleEnd - (paddleLen / 2));
            }

            that.screen.draw();
            that.render();
            that.drawStatistics(that.screen.context);

        });
    }

    movePaddleLeft()
    {
        this.stopPaddle();
        this.movingPaddleLeft = true;
    }

    movePaddleRight()
    {
        this.stopPaddle();
        this.movingPaddleRight = true;

    }

    stopPaddle()
    {
        this.movingPaddleLeft = false;
        this.movingPaddleRight = false;
    }

    pause()
    {
        this.canvas.classList = [];
        this.paused = !this.paused;
        if (this.paused)
            this.canvas.classList.add('gamePaused');
        else
            this.canvas.classList.add('gameRunning');
    }

    drawStatistics(canvasContext)
    {
        let point = this.level.bricks.filter(b => b.destroyed).length * 100;
        canvasContext.font = "30px Arial";
        canvasContext.fillStyle = "#fff";
        canvasContext.fillText(point, 10, 30);

        var img = document.getElementById("scream");
        canvasContext.drawImage(img, this.canvas.width - 70, 5, 30, 30);

        canvasContext.font = "30px Arial";
        canvasContext.fillStyle = "#fff";
        canvasContext.fillText(this.lifes, this.canvas.width - 35, 30);
    }
}

class Screen
{
    constructor(canvasContext)
    {
        this.context = canvasContext;
        this.screenElements = [];
        this.paddle = {};
        this.ball = {};
    }

    draw()
    {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.ball.drawSelf(this.context);
        this.paddle.drawSelf(this.context);
        this.screenElements.forEach((element) =>
        {
            element.ball = this.ball;
            if (!element.destroyed)
                element.drawSelf(this.context)
        });
    }

    addBrick(_element)
    {
        this.screenElements.push(_element);
    }

    addBall(_element)
    {
        this.ball = _element;
    }

    addPaddle(_element)
    {
        this.paddle = _element;
    }
}

class Paddle
{
    deltaX = 5;
    constructor(initialX, InitialY, ball)
    {
        this.identifier = 'paddle';
        this.width = 100;
        this.height = 20;
        this.ScreenPosition = new ScreenPosition(initialX - this.width / 2, InitialY - this.height);
        this.ball = ball;
    }

    drawSelf(canvasContext)
    {
        if (this.ball.ScreenPosition.yPosition + this.ball.radius > this.ScreenPosition.yPosition &&
            this.ball.ScreenPosition.xPosition >= this.ScreenPosition.xPosition &&
            this.ball.ScreenPosition.xPosition <= (this.ScreenPosition.xPosition + this.width))
        {
            let colisionPoint = this.ball.ScreenPosition.xPosition - (this.ScreenPosition.xPosition + this.width / 2);
            colisionPoint = colisionPoint / (this.width / 2);

            let angle = colisionPoint * (Math.PI / 3);
            this.ball.setDeltaY(-Math.cos(angle));
            this.ball.setDeltaX(Math.sin(angle));
        }

        canvasContext.fillStyle = "#223548";
        canvasContext.fillRect(
            this.ScreenPosition.xPosition,
            this.ScreenPosition.yPosition,
            this.width, this.height);

        canvasContext.strokeStyle = "#ffcd85";
        canvasContext.strokeRect(
            this.ScreenPosition.xPosition,
            this.ScreenPosition.yPosition,
            this.width, this.height);
    }

    moveLeft(limitLeft)
    {
        if (this.ScreenPosition.xPosition - this.deltaX >= limitLeft)
            this.ScreenPosition.xPosition -= this.deltaX;
    }
    moveRight(limitRight)
    {
        if (this.ScreenPosition.xPosition + this.width + this.deltaX <= limitRight)
            this.ScreenPosition.xPosition += this.deltaX;
    }
    increaseLife() { }
    decreaseLife() { }
}

class ScreenPosition
{
    constructor(xPosition, yPosition)
    {
        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }
}

class Ball
{
    constructor(initialX, InitialY, radius)
    {
        this.deltaX = 5;
        this.deltaY = -5;
        this.identifier = 'ball';
        this.speed = 5;
        this.radius = radius;
        this.ScreenPosition = new ScreenPosition(initialX, InitialY - radius);
    }

    drawSelf(canvasContext)
    {
        canvasContext.beginPath();
        canvasContext.arc(
            (this.ScreenPosition.xPosition),
            (this.ScreenPosition.yPosition),
            (this.radius),
            0,
            (Math.PI * 2)
        );
        canvasContext.fillStyle = "red";
        canvasContext.fill();

        canvasContext.strokeStyle = "#8c0b0b";
        canvasContext.stroke();
        canvasContext.closePath();
    }

    move(limitTop, limitLeft, limitBottom, limitRight)
    {
        if ((this.ScreenPosition.xPosition - this.radius <= limitLeft) ||
            (this.ScreenPosition.xPosition + this.radius >= limitRight))
            this.deltaX = -this.deltaX - ((this.deltaX * 5.3) / 100);

        if (this.ScreenPosition.yPosition - this.radius <= limitTop)
            this.deltaY = -this.deltaY - ((this.deltaY * 5.3) / 100);

        if (this.ScreenPosition.yPosition + this.radius >= limitBottom)
            this.lost_life();

        this.ScreenPosition.xPosition += this.deltaX;
        this.ScreenPosition.yPosition += this.deltaY;


    }

    setDeltaX(angle)
    {
        this.deltaX = angle * this.speed;
    }

    setDeltaY(angle)
    {
        this.deltaY = angle * this.speed;
    }

    setPositionX(x)
    {
        this.ScreenPosition.xPosition = x;
    }
}

class Brick
{
    deltaX = 0;
    constructor(initialX, InitialY, ball)
    {
        this.identifier = 'brick' + Date.now();
        this.width = 50;
        this.height = 20;
        this.ball = ball;
        this.destroyed = false;
        this.ScreenPosition = new ScreenPosition(initialX, InitialY + this.height);
    }

    drawSelf(canvasContext)
    {
        if (this.ball.ScreenPosition.yPosition + this.ball.radius >= this.ScreenPosition.yPosition
            && this.ball.ScreenPosition.yPosition <= this.ScreenPosition.yPosition + this.height
            &&
            this.ball.ScreenPosition.xPosition >= this.ScreenPosition.xPosition
            &&
            this.ball.ScreenPosition.xPosition <= (this.ScreenPosition.xPosition + this.width))
        {
            this.destroyed = true;
            this.ball.deltaY = -this.ball.deltaY;
        }

        canvasContext.fillStyle = "#9e9595";
        canvasContext.fillRect(
            this.ScreenPosition.xPosition,
            this.ScreenPosition.yPosition,
            this.width, this.height);

        canvasContext.strokeStyle = "#ffcd85";
        canvasContext.strokeRect(
            this.ScreenPosition.xPosition,
            this.ScreenPosition.yPosition,
            this.width, this.height);

    }
}

class Level
{
    constructor(ball, levelNumber = 1)
    {
        this.levelNumber = levelNumber;
        this.bricks = [];
        this.ball = ball
    }

    levelFactory = () =>
    {
        if (this.levelNumber == 1)
        {
            let lines = 3;
            while (lines > 0)
            {
                for (let index = 0; index < 8; index++)
                {
                    let brick = new Brick(0, 0, this.ball);
                    brick.ScreenPosition.xPosition = (brick.width * index + brick.width)
                    brick.ScreenPosition.yPosition = (brick.height * lines) + 300;
                    this.bricks.push(brick);
                }

                lines--;
            }

        }

        return this;
    }


}