import Phaser from 'phaser';

class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Test' });
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 200, 200, 0x4a7c3a);

    this.add.text(width / 2, 100, '🌱 Зелёная Империя', {
      fontSize: '32px',
      color: '#e8c547',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 100, 'Тапни по экрану', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.on('pointerdown', () => {
      this.cameras.main.flash(200, 74, 124, 58);
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1a2a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  scene: [TestScene],
};

new Phaser.Game(config);

const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('✅ Telegram WebApp работает');
} else {
  console.log('⚠️ Открыто вне Telegram');
}
