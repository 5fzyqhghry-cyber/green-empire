import Phaser from 'phaser';

const TILE_SIZE = 64;      // размер тайла в пикселях (крупнее для тача)
const FARM_SIZE = 20;       // 20×20 тайлов
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

/**
 * Основная сцена фермы.
 * Рисует сетку 20×20, настраивает камеру с зумом и панорамированием,
 * обрабатывает тапы по тайлам.
 */
export class FarmScene extends Phaser.Scene {
  private tileSprites: Phaser.GameObjects.Rectangle[] = [];
  private selectedTileIndex: number | null = null;
  private selectionMarker?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'Farm' });
  }

  create(): void {
    this.renderFarm();
    this.setupCamera();
    this.setupInput();
    this.centerCamera();

    // При изменении размера окна (поворот телефона, ресайз)
    this.scale.on('resize', this.onResize, this);
  }

  /**
   * Рисуем сетку 20×20.
   * Каждый тайл — коричневый квадрат с зелёной рамкой.
   */
  private renderFarm(): void {
    const worldSize = FARM_SIZE * TILE_SIZE;

    // Фоновая заливка мира (трава)
    this.add
      .rectangle(0, 0, worldSize, worldSize, 0x2d4a1f)
      .setOrigin(0);

    // Тайлы
    for (let y = 0; y < FARM_SIZE; y++) {
      for (let x = 0; x < FARM_SIZE; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Чередование оттенков коричневого для эффекта грядок
        const color = (x + y) % 2 === 0 ? 0x4a3520 : 0x5a4028;

        const tile = this.add
          .rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE - 2, TILE_SIZE - 2, color)
          .setStrokeStyle(1, 0x3a2510);

        tile.setInteractive({ useHandCursor: true });
        tile.setData('x', x);
        tile.setData('y', y);
        tile.setData('index', y * FARM_SIZE + x);

        this.tileSprites.push(tile);
      }
    }

    // Маркер выделения тайла (невидимый изначально)
    this.selectionMarker = this.add
      .rectangle(0, 0, TILE_SIZE - 2, TILE_SIZE - 2)
      .setStrokeStyle(3, 0xe8c547)
      .setFillStyle()
      .setVisible(false);

    console.log(`🌱 Ферма отрисована: ${FARM_SIZE}×${FARM_SIZE} = ${FARM_SIZE * FARM_SIZE} тайлов`);
  }

  /**
   * Камера: зум колесиком (или pinch на телефоне) и панорамирование пальцем.
   */
  private setupCamera(): void {
    const worldSize = FARM_SIZE * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, worldSize, worldSize);
    this.cameras.main.setZoom(1.0);
    this.cameras.main.setBackgroundColor(0x1a2a1a);

    // Панорамирование: drag одним пальцем
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      if (pointer.getDuration() < 50) return; // игнорируем мгновенные тапы

      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    // Зум колесом мыши (для теста в Safari)
    this.input.on(
      'wheel',
      (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
        const newZoom = Phaser.Math.Clamp(
          this.cameras.main.zoom - dy * 0.001,
          MIN_ZOOM,
          MAX_ZOOM,
        );
        this.cameras.main.setZoom(newZoom);
      },
    );

    // Pinch-zoom для телефона
    this.input.addPointer(1); // разрешаем второй палец

    let initialDistance = 0;
    let initialZoom = 1;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const p2 = this.input.pointer2;
      if (p2.isDown) {
        const dx = pointer.x - p2.x;
        const dy = pointer.y - p2.y;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = this.cameras.main.zoom;
      }
    });

    this.input.on('pointermove', () => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (!p1.isDown || !p2.isDown) return;

      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (initialDistance > 0) {
        const scale = distance / initialDistance;
        this.cameras.main.setZoom(
          Phaser.Math.Clamp(initialZoom * scale, MIN_ZOOM, MAX_ZOOM),
        );
      }
    });

    this.input.on('pointerup', () => {
      initialDistance = 0;
    });
  }

  /**
   * Обработка тапа по тайлу: подсветка + сообщение в UI.
   */
  private setupInput(): void {
    this.input.on(
      'gameobjectdown',
      (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
        const index = obj.getData('index');
        const x = obj.getData('x');
        const y = obj.getData('y');
        if (typeof index !== 'number') return;

        this.selectTile(index, x, y);

        // Уведомляем UIScene
        this.game.events.emit('tile-tapped', { index, x, y });

        // Тактильная отдача в Telegram
        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.impactOccurred('light');
      },
    );
  }

  private selectTile(index: number, x: number, y: number): void {
    this.selectedTileIndex = index;

    if (this.selectionMarker) {
      this.selectionMarker.setPosition(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
      );
      this.selectionMarker.setVisible(true);
    }
  }

  private centerCamera(): void {
    const worldSize = FARM_SIZE * TILE_SIZE;
    this.cameras.main.centerOn(worldSize / 2, worldSize / 2);
  }

  private onResize(): void {
    // При ресайзе — ничего специфического, камера сама подстроится
  }
}
