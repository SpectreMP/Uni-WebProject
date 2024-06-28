class Creature extends Phaser.Physics.Arcade.Sprite{
    constructor(config){
        super(config.scene, config.x, config.y, config.texture);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.creatures.add(this);

        this.setScale(config.scale);
        this.setBodySize(5, 5)
        this.setOffset(this.width/2 - 5/2, this.height - 5/2)

        this.setData('health', config.health);
        this.setData('damage', config.damage);
        this.setData('speed', config.speed);
        this.setData('attackReach', config.attackReach);
        this.setData('iframes', 0);
        this.setData('attackCooldown', 0);
        this.setData('isDead', false);
        this.setData('isPlayer', false);        

        this.idleAnimation = config.idleAnimation;
        this.moveAnimation = config.moveAnimation;
        this.attackAnimation = config.attackAnimation;
        this.deathAnimation = config.deathAnimation;

        if (DEBUG){
            this.debugPositionPoint = this.scene.add.ellipse(this.body.center.x, this.body.center.y, this.scale*5, this.scale*5, 0xff0000)
        }
    }
    
    takeDamage(damage){
        if (this.data.values.iframes == 0){
            this.data.values.health -= damage;

            this.data.values.iframes = 20;
        };
        if (this.data.values.health == 0){
            this.data.values.isDead = true;
        }
    }

    attack(target, damage, delay, cooldown){
        if (this.data.values.attackCooldown == 0){
            this.scene.time.delayedCall(delay, function(){
                let hitbox = this.scene.add.rectangle(this.body.center.x + (this.flipX ? -this.width : this.width), this.body.center.y, this.data.values.attackReach, this.data.values.attackReach, 0x000000, 0);
                let hitboxBody = new Phaser.Physics.Arcade.StaticBody(this.scene.physics.world, hitbox);
                let hitboxCollider = this.scene.physics.add.overlap(hitbox, target, function(object1, object2){object2.takeDamage(damage)})
                hitbox.body = hitboxBody;

                this.scene.time.delayedCall(200, function(){hitbox.destroy(); hitboxBody.destroy(); hitboxCollider.destroy();})
            }, null, this)
            
            this.data.values.attackCooldown = cooldown;

            let slash = this.scene.add.sprite(this.body.center.x, this.body.center.y - this.height/2, 'slash').setDepth(this.body.center.y+1)
            if (this.flipX){
                slash.flipX = true;
            }
            slash.anims.play('slash');
        }
    }
    
    progressEffects(){
        if (this.data.values.iframes > 0){
            this.data.values.iframes -= 1;
        }
        if (this.data.values.attackCooldown>0){
            this.data.values.attackCooldown -= 1;
        }
    }

    playerControl(input){

        let direction = new Phaser.Math.Vector2(0,0);

        if (input.left.isDown){
            direction.x = -1;
        }
        if (input.right.isDown){
            direction.x = 1;
        }
        if (input.up.isDown){
            direction.y = -1;
        }
        if (input.down.isDown){
            direction.y = 1;
        }
        if (input.space.isDown){
            this.attack(this.scene.enemies, this.data.values.damage, 0, 20);
        }
        
        direction.normalize();
        this.body.setVelocity(direction.x * this.data.values.speed, direction.y * this.data.values.speed);
    }
    
    preUpdate(delta, time){
        super.preUpdate(delta, time);

        if (this.data.values.isDead){
            this.setVelocity(0);
            this.anims.play(this.deathAnimation, true);
            if (this.anims.currentFrame.isLast){
                this.removeFromUpdateList();
            }
            return 0;
        }

        if (this.data.values.isPlayer){
            this.playerControl(this.scene.cursors);
        }

        if (this.body.velocity.x<0){
            this.flipX = true;
        }
        if (this.body.velocity.x>0){
            this.flipX = false;
        }
        if (this.body.velocity.length() == 0){
            this.anims.play(this.idleAnimation, true);
        } else {
            this.anims.play(this.moveAnimation, true);
        }

        this.setDepth(this.body.center.y);
        this.progressEffects();

        if (DEBUG){
            this.debugPositionPoint.setPosition(this.body.center.x, this.body.center.y);
        }
    }
}

class EnemyCreature extends Creature{
    constructor(config){
        super(config);
        this.scene.enemies.add(this);

        this.healthbar = this.scene.add.text(this.x, this.y-this.height/2, this.data.values.health, { fontSize: '20px', color: '#ffffff', strokeThickness: 1, stroke: '#000'});
    }
    preUpdate(delta, time){
        super.preUpdate(delta, time);
        
        this.healthbar.setPosition(this.x-this.healthbar.width/2, this.y-this.height/2);
        this.healthbar.setText(this.data.values.health);
        if (this.data.values.health>0){
            this.healthbar.setColor('#fff');
        } else {
            this.healthbar.setColor('#b6b');
        }

        if (this.data.values.isDead){
            this.healthbar.setText('')
            return 0;
        }

        if (this.data.values.health>0){
            this.clearTint();
        } else {
            this.setTint(0xbb66bb)
        }

        if (this.data.values.isPlayer){
            return 0;
        };

        let distanceToPlayer = Phaser.Math.Distance.Between(this.scene.player.body.center.x, this.scene.player.body.center.y, this.body.center.x, this.body.center.y);
        if (distanceToPlayer < 250 && distanceToPlayer > 50){
            this.scene.physics.moveToObject(this, this.scene.player, this.data.values.speed);
        } else {
            this.setVelocity(0);
        }
        if (distanceToPlayer <= 50){
            this.setVelocity(0);
            this.attack(this.scene.player, this.data.values.damage, 400, 60);
            if (this.body.center.x > this.scene.player.body.center.x){
                this.flipX = true;
            } else {
                this.flipX = false;
            }
        }
    }
}

class AllyCreature extends Creature{
    constructor(config){
        super(config);
        this.scene.allies.add(this);
    }
    preUpdate(delta, time){
        super.preUpdate(delta, time);

        if (this.data.values.iframes>0){
            
        }

        if (this.data.values.isPlayer){
            return 0;
        }

        let distanceToPlayer = Phaser.Math.Distance.Between(this.scene.player.body.center.x, this.scene.player.body.center.y, this.body.center.x, this.body.center.y);
        if (distanceToPlayer>50){
            this.scene.physics.moveToObject(this, this.scene.player, this.data.values.speed*0.95)
        } else {
            this.setVelocity(0);
            if (this.body.center.x > this.scene.player.body.center.x){
                this.flipX = true;
            } else {
                this.flipX = false;
            }
        }
    }
}
