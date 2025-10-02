import { world, Player } from "@minecraft/server";

// Get the player's look direction
function getLookVector(player) {
  const rot = player.getRotation();
  const pitch = rot.x * (Math.PI / 180);
  const yaw = rot.y * (Math.PI / 180);

  return {
    x: -Math.sin(yaw) * Math.cos(pitch),
    y: -Math.sin(pitch),
    z: Math.cos(yaw) * Math.cos(pitch)
  };
}

// Raycast up to maxDistance blocks
function raycast(player, maxDistance = 10) {
  const start = player.location;
  const dir = getLookVector(player);

  for (let i = 1; i <= maxDistance; i++) {
    const pos = {
      x: start.x + dir.x * i,
      y: start.y + dir.y * i,
      z: start.z + dir.z * i
    };

    for (const entity of world.getDimension("overworld").getEntities()) {
      if (entity.id === player.id) continue; // skip self

      const dx = entity.location.x - pos.x;
      const dy = entity.location.y - pos.y;
      const dz = entity.location.z - pos.z;

      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 1.5) {
        return entity;
      }
    }
  }
  return null;
}

// Trigger when player uses an item (like swinging a sword)
world.afterEvents.itemUse.subscribe(event => {
  const player = event.source;
  if (!(player instanceof Player)) return;

  const target = raycast(player, 10);
  if (target) {
    target.applyDamage(6, { cause: "entityAttack", damagingEntity: player });
    player.sendMessage(`You hit ${target.typeId} from 10 blocks away!`);
  }
});