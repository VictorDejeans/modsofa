import { world, system } from "@minecraft/server";

world.sendMessage("§a[MODSOFA] Script loaded!");

system.runTimeout(() => {
  world.sendMessage("§b[MODSOFA] System active!");
}, 20);

world.afterEvents.chatSend.subscribe((event) => {
  if (event.message === "!test") {
    event.sender.sendMessage("§a✓ Script works!");
  }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  if (event.block.typeId === "furniture:modbench") {
    world.sendMessage("§d[MODSOFA] Bench placed!");
  }
});
