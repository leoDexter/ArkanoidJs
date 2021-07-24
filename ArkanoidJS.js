class Game
{
    constructor(canvasEl, window)
    {
        canvasEl.height = window.screen.height;
        this.lifes = 3;
        this.window = window;
        this.canvas = canvasEl;
        this.paused = false;
        this.running = false;
        this.movingPaddleLeft = false;
        this.movingPaddleRight = false;

        this.screen = new Screen(this.canvas.getContext('2d'));
        this.ball = new Ball(10);
        this.paddle = new Paddle();

        this.ball.lost_life = () =>
        {
            this.lifes = game.lifes - 1;
            this.playing = false;
            this.initElements();
        };

        this.screen.addPaddle(this.paddle);
        this.screen.addBall(this.ball);
        this.screen.setLevel(new Level(this.canvas.width).getNextLevel());

        this.initElements();
        this.render();
    }

    initElements = () =>
    {
        this.ball.setPositionX(this.canvas.width / 2);
        this.ball.setPositionY(this.canvas.height - 30 - this.ball.radius);

        this.paddle.setPositionX(this.canvas.width / 2 - this.paddle.width / 2);
        this.paddle.setPositionY(this.canvas.height - 30);
    }

    start()
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
            let won = that.screen.level.bricks.filter(b => !b.destroyed).length == 0;
            if (won)
                that.screen.setLevel(that.screen.level.getNextLevel(that.canvas.width));

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
        let point = this.screen.level.bricks.filter(b => b.destroyed).length * 100;
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
        this.level = {};
        this.paddle = {};
        this.ball = {};
    }

    draw()
    {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.ball.drawSelf(this.context);
        this.paddle.drawSelf(this.context, this.ball);
        this.level.bricks.forEach((element) =>
        {
            if (!element.destroyed)
                element.drawSelf(this.context, this.ball);
        });
    }

    setLevel(level)
    {
        this.level = level;
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
    constructor(initialX, InitialY)
    {
        this.deltaX = 5;
        this.width = 100;
        this.height = 20;
        this.ScreenPosition = new ScreenPosition(0, 0);
    }

    drawSelf(canvasContext, ball)
    {
        if (ball.ScreenPosition.yPosition + ball.radius > this.ScreenPosition.yPosition &&
            ball.ScreenPosition.xPosition >= this.ScreenPosition.xPosition &&
            ball.ScreenPosition.xPosition <= (this.ScreenPosition.xPosition + this.width))
        {
            let colisionPoint = ball.ScreenPosition.xPosition - (this.ScreenPosition.xPosition + this.width / 2);
            colisionPoint = colisionPoint / (this.width / 2);

            let angle = colisionPoint * (Math.PI / 3);
            ball.setDeltaY(-Math.cos(angle));
            ball.setDeltaX(Math.sin(angle));
        }

        canvasContext.fillStyle = "#223548";
        canvasContext.fillRect(this.ScreenPosition.xPosition, this.ScreenPosition.yPosition, this.width, this.height);

        canvasContext.strokeStyle = "#ffcd85";
        canvasContext.strokeRect(this.ScreenPosition.xPosition, this.ScreenPosition.yPosition, this.width, this.height);
    }

    moveLeft(limitLeft)
    {
        if (this.ScreenPosition.xPosition - this.deltaX >= limitLeft)
            this.setPositionX(this.ScreenPosition.xPosition - this.deltaX);
    }

    moveRight(limitRight)
    {
        if (this.ScreenPosition.xPosition + this.width + this.deltaX <= limitRight)
            this.setPositionX(this.ScreenPosition.xPosition + this.deltaX);
    }

    setPositionX = (x) => this.ScreenPosition.xPosition = x;
    setPositionY = (y) => this.ScreenPosition.yPosition = y;
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
    constructor(radius)
    {
        this.deltaX = 5;
        this.deltaY = -5;
        this.speed = 5;
        this.radius = radius;
        this.ScreenPosition = new ScreenPosition(0, 0);
    }

    drawSelf(canvasContext)
    {
        canvasContext.beginPath();
        canvasContext.arc((this.ScreenPosition.xPosition), (this.ScreenPosition.yPosition), (this.radius), 0, (Math.PI * 2));
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

    setDeltaX = (angle) => this.deltaX = angle * this.speed;

    setDeltaY = (angle) => this.deltaY = angle * this.speed;

    setPositionX = (x) => this.ScreenPosition.xPosition = x;

    setPositionY = (y) => this.ScreenPosition.yPosition = y;
}

class Brick
{
    constructor()
    {
        this.lifes = 1;
        this.width = 50;
        this.height = 20;
        this.destroyed = false;
        this.ScreenPosition = new ScreenPosition(0, 0 + this.height);
    }

    drawSelf(canvasContext, ball)
    {
        if (ball.ScreenPosition.yPosition + ball.radius >= this.ScreenPosition.yPosition &&
            ball.ScreenPosition.yPosition <= this.ScreenPosition.yPosition + this.height &&
            ball.ScreenPosition.xPosition >= this.ScreenPosition.xPosition &&
            ball.ScreenPosition.xPosition <= (this.ScreenPosition.xPosition + this.width))
        {
            this.lifes--;
            this.destroyed = this.lifes == 0;
            ball.deltaY = -ball.deltaY;
        }

        canvasContext.fillStyle = this.lifes == 1 ? "#9e9595" : this.lifes == 2 ? "#008000" : "#ca0c52";
        canvasContext.fillRect(this.ScreenPosition.xPosition, this.ScreenPosition.yPosition, this.width, this.height);


        canvasContext.strokeRect(this.ScreenPosition.xPosition, this.ScreenPosition.yPosition, this.width, this.height);
    }

    setTotalLife = (l) => this.lifes = l;
    setPositionX = (x) => this.ScreenPosition.xPosition = x;
    setPositionY = (y) => this.ScreenPosition.yPosition = y;
}

class Level
{
    constructor(screenWidth)
    {
        this.levelNumber = 0;
        this.bricks = [];
        this.screenWidth = screenWidth;
    }

    getNextLevel = () =>
    {
        this.levelNumber++;
        this.bricks = [];
        if (this.levelNumber === 1)
        {
            let lines = 3;
            while (lines > 0)
            {
                for (let index = 0; index < 8; index++)
                {
                    let brick = new Brick();
                    brick.setPositionX(brick.width * index + brick.width)
                    brick.setPositionY(brick.height * lines + 50);
                    this.bricks.push(brick);
                }
                lines--;
            }
        }

        if (this.levelNumber === 2)
        {
            let lines = 3;
            while (lines > 0)
            {
                for (let index = 0; index < 8; index++)
                {
                    let brick = new Brick();
                    brick.setPositionX(brick.width * index + brick.width)
                    brick.setPositionY(brick.height * lines + 50);
                    brick.setTotalLife(this.getRandomIntInclusive(1, 3));
                    this.bricks.push(brick);
                }
                lines--;
            }

            for (let index = 0; index < 8; index++)
            {
                let brick = new Brick();
                brick.setPositionX(index * brick.width)
                brick.setPositionY(500);
                brick.setTotalLife(3);
                this.bricks.push(brick);
            }
        }

        if (this.levelNumber === 3)
        {
            let lines = 3;
            while (lines > 0)
            {
                for (let index = 0; index < 8; index++)
                {
                    let brick = new Brick(0, 0);
                    brick.setPositionX(brick.width * index + brick.width)
                    brick.setPositionY(brick.height * lines + 50);
                    brick.setTotalLife(this.getRandomIntInclusive(1, 3));
                    this.bricks.push(brick);
                }
                lines--;
            }

            for (let index = 8; index >= 0; index--)
            {
                let brick = new Brick();
                brick.setPositionX(this.screenWidth - index * brick.width)
                brick.setPositionY(300);
                brick.setTotalLife(3);
                this.bricks.push(brick);
            }

            for (let index = 0; index < 8; index++)
            {
                let brick = new Brick();
                brick.setPositionX(index * brick.width)
                brick.setPositionY(500);
                brick.setTotalLife(3);
                this.bricks.push(brick);
            }

        }

        return this;
    }

    getRandomIntInclusive(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


}