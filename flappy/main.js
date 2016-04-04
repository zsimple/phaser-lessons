// 初始化游戏，这里是游戏大小，并不一定与显示大小一致
var game = new Phaser.Game(768, 1024);

var gameState = {
  preload: function() {
    // 加载各种图像资源
    game.load.spritesheet('bird', '../assets/flappy/bird.png', 92, 64);
    game.load.image('pipe', '../assets/flappy/pipe.png');
    game.load.image('background', '../assets/flappy/background.png');
    game.load.image('ground', '../assets/flappy/ground.png');
  },

  create: function() {
    // 设置背景
    game.add.image(0, 0, 'background');
    // 游戏画面在浏览器界面中居中
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    // 开启物理引擎
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // 初始化小鸟和其精灵动画
    this.bird = game.add.sprite(game.world.centerX - 92, game.world.centerY, 'bird');
    this.bird.anchor.setTo(-0.1, .5);
    this.bird.animations.add('fly', [0, 1, 2]);
    this.bird.animations.play('fly', 5, true);
    // 开启碰撞
    game.physics.arcade.enable(this.bird);
    // 设置中立加速度
    this.bird.body.gravity.y = 1000;

    // 为所有的管子准备容器
    this.pipes = game.add.group();

    // 监听空格事件
    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    // 显示得分（这里简单的使用增加列管道加一分的策略，所以有一分的延迟）
    this.score = -1;
    this.labelScore = game.add.text(380, 100, "0", { font: "bold 50pt Arial", fill: "#ffffff", aligen: 'center' });
    this.labelScore.setShadow(5, 5, '#000000', 0);

    // 增加移动的地面
    this.ground = game.add.tileSprite(0, 896, 768, 128, 'ground');

    // 定时增加管道
    this.timer = game.time.events.loop(2500, this.addPipeRow, this);

  },

  jump: function() {
      // 给小鸟一个向上的速度
      this.bird.body.velocity.y = -400;
      // 修正鸟头向上
      game.add.tween(this.bird).to({angle: -20}, 100).start();
  },

  addPipe: function(x, y, d) {
    // 增加管道的函数
    var pipe = game.add.sprite(x, y, 'pipe');
    // 管道有两个方向，我们只有一张图片，所以使用flip来制作开头向下的管道
    if (d == 1) {
      pipe.anchor.setTo(0, .5);
      pipe.scale.y = -1;
      pipe.y -= 396;
    }

    // 假如管道容器并开启碰撞检测，向左定速移动
    this.pipes.add(pipe);
    game.physics.arcade.enable(pipe);
    pipe.body.velocity.x = -200;

    // 管道在离开画面后自动销毁
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  addPipeRow: function() {
    // 随机生成障碍管道
    var below = Math.round(Math.random() * 550) + 300;
    this.addPipe(768, below);
    this.addPipe(768, below - 250, 1);

    // 增加并显示得分
    this.score += 1;
    this.labelScore.text = this.score;
  },

  restartGame: function() {
      // 开始游戏
      game.state.start('game');
  },

  // 每帧调用
  update: function() {
    // 判断太高太低的生死
    if (this.bird.y < -100 || this.bird.y > 900) this.restartGame();
    // 默认鸟头往下
    if (this.bird.angle < 30) this.bird.angle += 1;
    // 地面移动动画
    this.ground.tilePosition.x -= 200 * (game.time.elapsed / 1000);
    // 鸟与管道的碰撞检测，这里碰到了简单重新开始游戏
    game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
  }
};

// 增加游戏状态并开始执行
game.state.add('game', gameState);
game.state.start('game');
