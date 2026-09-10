import Phaser from 'phaser';

/**
 * UI-слой поверх FarmScene.
 * Рисует HUD сверху и хотбар снизу.
 * Пока без настоящей логики — только визуал и события.
 */
export class UIScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private hotbarButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'UI' });
  }

  create(): void {
    this.createHUD();
    this.createHotbar();
    this.createStatusText();

    // Подписки на события FarmScene
    this.game.events.on('tile-tapped', this.onTileTapped, this);

    // Обновление при ресайзе
    this.scale.on('resize', this.onResize, this);

    // Отписки при выключении сцены
    this.events.once('shutdown', () => {
      this.game.events.off('tile-tapped', this.onTileTapped, this);
      this.scale.off('resize', this.onResize, this);
    });
  }

  /**
   * Верхняя панель: заголовок, день, деньги, уровень.
   */
  private createHUD(): void {
    const { width } = this.scale;

    // Тёмная плашка сверху
    this.add
      .rectangle(0, 0, width, 90, 0x0f1a0f, 0.95)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);

    // Тонкая золотая линия под HUD
    this.add
      .rectangle(0, 90, width, 2, 0xe8c547, 0.8)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(101);

    // Заголовок
    this.add
      .text(width / 2, 24, '🌱 Зелёная Империя', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#e8c547',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    // Статус-строка (день, деньги, уровень)
    this.hudText = this.add
      .text(width / 2, 62, 'День 1   💰 1000   ⭐ Ур. 1', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#a0d97c',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);
  }

  /**
   * Нижняя панель с кнопками действий (хотбар).
   * 7 кнопок — как в требованиях.
   */
  private createHotbar(): void {
    const { width, height } = this.scale;

    const buttonData = [
      { key: 'water',   emoji: '💧', label: 'Полив' },
      { key: 'fert',    emoji: '🌿', label: 'Удобр.' },
      { key: 'trim',    emoji: '✂️', label: 'Трим' },
      { key: 'inspect', emoji: '🔍', label: 'Осмотр' },
      { key: 'build',   emoji: '🏗', label: 'Стройка' },
      { key: 'sell',    emoji: '💱', label: 'Продажа' },
      { key: 'quests',  emoji: '📋', label: 'Задания' },
    ];

    const barHeight = 100;
    const barY = height - barHeight;

    // Фон хотбара
    this.add
      .rectangle(0, barY, width, barHeight, 0x0f1a0f, 0.95)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);

    // Золотая линия над хотбаром
    this.add
      .rectangle(0, barY - 2, width, 2, 0xe8c547, 0.8)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(101);

    const btnSize = Math.min(64, Math.floor((width - 32) / 7) - 8);
    const gap = 8;
    const totalWidth = buttonData.length * btnSize + (buttonData.length - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const y = barY + barHeight / 2;

    buttonData.forEach((btn, i) => {
      const x = startX + i * (btnSize + gap) + btnSize / 2;
      const container = this.add.container(x, y).setScrollFactor(0).setDepth(102);

      const bg = this.add.rectangle(0, 0, btnSize, btnSize, 0x3a2a1a);
      bg.setStrokeStyle(2, 0x8b6b3a);

      const emoji = this.add
        .text(0, -8, btn.emoji, { fontSize: `${Math.floor(btnSize * 0.4)}px` })
        .setOrigin(0.5);

      const label = this.add
        .text(0, btnSize * 0.28, btn.label, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#e8c547',
        })
        .setOrigin(0.5);

      container.add([bg, emoji, label]);
      container.setSize(btnSize, btnSize);

      // Интерактивность через прямоугольник
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.onHotbarPress(btn.key, btn.label);
      });

      this.hotbarButtons.push(container);
    });
  }

  /**
   * Строка статуса — что происходит (для отладки и обратной связи).
   */
  private createStatusText(): void {
    const { width, height } = this.scale;
    const hotbarHeight = 100;

    this.statusText = this.add
      .text(width / 2, height - hotbarHeight - 30, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#a0d97c',
        backgroundColor: '#0f1a0fcc',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);
  }

  private showStatus(message: string): void {
    this.statusText.setText(message);

    // Плавное исчезновение через 2 секунды
    this.tweens.killTweensOf(this.statusText);
    this.statusText.setAlpha(1);
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      delay: 2000,
      duration: 500,
    });
  }

  private onTileTapped(data: { index: number; x: number; y: number }): void {
    this.showStatus(`Тайл (${data.x}, ${data.y})`);
  }

  private onHotbarPress(key: string, label: string): void {
    this.showStatus(`Выбрано: ${label}`);

    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('medium');

    // Уведомляем FarmScene
    this.game.events.emit('hotbar-action', key);
  }

  private onResize(): void {
    // При ресайзе пересоздаём хотбар на новых размерах
    for (const btn of this.hotbarButtons) btn.destroy();
    this.hotbarButtons = [];
    this.createHotbar();
  }
}
