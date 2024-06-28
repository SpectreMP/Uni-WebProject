class GameScene extends Phaser.Scene{
    preload(){
        this.load.spritesheet('vagabond', 'src/vagabond.png', {frameWidth:64});
        this.load.spritesheet('priest', 'src/priest.png', {frameWidth:64});
        this.load.spritesheet('mannequin', 'src/mannequin_spritesheet.png', {frameWidth:48})
        this.load.spritesheet('slash', 'src/slash.png', {frameWidth: 275, frameHeight: 200})

        this.load.image('base', 'src/SampleMap/[Base]BaseChip_pipo.png')
        this.load.image('water', 'src/SampleMap/[A]Water_pipo.png')
        this.load.image('grass', 'src/SampleMap/[A]Grass_pipo.png')
        this.load.image('flower', 'src/SampleMap/[A]Flower_pipo.png')
        this.load.tilemapTiledJSON('samplemap', 'src/SampleMap/samplemap.json')
    }
    create(){
        const map = this.add.tilemap('samplemap' );

        const baseSet = map.addTilesetImage('[Base]BaseChip_pipo', 'base');
        const waterSet = map.addTilesetImage('[A]Water_pipo', 'water');
        const grassSet = map.addTilesetImage('[A]Grass_pipo', 'grass');
        const flowerSet = map.addTilesetImage('[A]Flower_pipo', 'flower');

        const groundLayer = map.createLayer('ground', [baseSet, waterSet, grassSet, flowerSet]);
        const grassLayer = map.createLayer('grass', [baseSet, waterSet, grassSet, flowerSet]);
        const waterLayer = map.createLayer('water', [baseSet, waterSet, grassSet, flowerSet]);
        const waterGrassLayer = map.createLayer('water_grass', [baseSet, waterSet, grassSet, flowerSet]);
        const buildingLayer = map.createLayer('building', [baseSet, waterSet, grassSet, flowerSet]);
        const farmLayer = map.createLayer('farm', [baseSet, waterSet, grassSet, flowerSet]);
        const farmUpLayer = map.createLayer('farm_up', [baseSet, waterSet, grassSet, flowerSet]);
        const collisionLayer = map.createLayer('collisions', DEBUG ? [baseSet] : []);
        const treeLayer = map.createLayer('tree', [baseSet, waterSet, grassSet, flowerSet]).setDepth(4096);
        const buildingUpLayer = map.createLayer('building_up', [baseSet, waterSet, grassSet, flowerSet]).setDepth(4096);

        this.creatures = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.allies = this.physics.add.group();

        //TODO: Добавить загрузку всего из одного файла
        const vagabond = new AllyCreature({
            scene: this,
            x: 260,
            y: 400,
            texture: 'vagabond',
            health: 10,
            damage: 2,
            attackReach: 150,
            speed: 250,
            scale: 2,
            idleAnimation: 'vagabondIdle',
            moveAnimation: 'vagabondMove',
            attackAnimation: 'slash',
            deathAnimation: 'vagabondIdle'
        })

        const priest = new AllyCreature({
            scene: this,
            x: 200,
            y: 400,
            texture: 'vagabond',
            health: 10,
            damage: -3,
            attackReach: 150,
            speed: 250,
            scale: 2,
            idleAnimation: 'priestIdle',
            moveAnimation: 'priestMove',
            attackAnimation: 'slash',
            deathAnimation: 'priestIdle'
        })
        
        this.createMannequinEnemy(400, 960, 7);
        this.createMannequinEnemy(280, 920, -4);
        const boss = this.createMannequinEnemy(1720, 1720, 13);
        boss.setScale(4);
        boss.data.values.damage = 2;

        this.anims.create({
            key:'vagabondMove',
            frames:this.anims.generateFrameNumbers('vagabond', {start:0, end:7}),
            frameRate: 8
        })

        this.anims.create({
            key:'vagabondIdle',
            frames: [{key:'vagabond', frame:8}],
            frameRate: 8
        })

        this.anims.create({
            key:'priestMove',
            frames:this.anims.generateFrameNumbers('priest', {start:0, end:7}),
            frameRate: 8
        })

        this.anims.create({
            key:'priestIdle',
            frames: [{key:'priest', frame:8}],
            frameRate: 8
        })

        this.anims.create({
            key:'mannequinMove',
            frames:this.anims.generateFrameNumbers('mannequin', {start:20, end:25}),
            frameRate: 8
        })
        
        this.anims.create({
            key:'mannequinIdle',
            frames:[{key: 'mannequin', frame: 3}],
            frameRate: 8
        })

        this.anims.create({
            key:'mannequinDeath',
            frames:this.anims.generateFrameNumbers('mannequin', {start:90, end:95}),
            frameRate: 8
        })

        this.anims.create({
            key: 'slash',
            frames: this.anims.generateFrameNumbers('slash', {start:0, end: 5}),
            showOnStart: true,
            hideOnComplete: true
        })

        this.cursors = this.input.keyboard.createCursorKeys();

        this.setPlayer(vagabond);

        collisionLayer.setCollision(294);
        this.physics.add.collider(this.creatures, collisionLayer);
        this.physics.add.collider(this.enemies, this.enemies);

        console.log(this)
    }
    update(){
        if (this.player.data.values.health <= 0){
            console.log("Вы умерли!")
        }
        
        if (this.cursors.shift.isDown && this.player.data.values.attackCooldown == 0){
            if (this.player == this.allies.getChildren()[0]){
                this.setPlayer(this.allies.getChildren()[1]);
            } else {
                this.setPlayer(this.allies.getChildren()[0]);
            }
            this.player.data.values.attackCooldown += 20;
        }
    }
    
    createMannequinEnemy(x, y, health){
        let mannequin = new EnemyCreature({
            scene: this,
            x: x,
            y: y,
            texture: 'mannequin',
            health: health,
            damage: 1,
            attackReach: 100,
            speed: 150,
            scale: 3,
            idleAnimation: 'mannequinIdle',
            moveAnimation: 'mannequinMove',
            attackAnimation: 'slash',
            deathAnimation: 'mannequinDeath'
        })
        return mannequin;
    }

    setPlayer(target){
        if (this.player) {
            this.player.data.values.isPlayer = false;
        }
        this.player = target;
        target.data.values.isPlayer = true;
        this.cameras.main.startFollow(target);
    }
}