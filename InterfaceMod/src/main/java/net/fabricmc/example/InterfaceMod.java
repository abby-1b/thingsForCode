package net.fabricmc.example;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.fabricmc.api.ClientModInitializer;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.text.LiteralText;
import net.minecraft.util.math.BlockPos;
import net.minecraft.world.World;
import net.minecraft.world.dimension.DimensionType;
import net.minecraft.world.gen.feature.StructureFeature;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerPlayerEntity;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.lwjgl.glfw.GLFW;

public class InterfaceMod implements ModInitializer {
	boolean isOutputting = false;
	int dataFrame = 0;

	@Override
	public void onInitialize() {
		System.out.println("Interface Mod client starting...");
        this.register();
        System.out.println("Interface Mod client started!");
	}

	private void register() {
        KeyBinding toggleHudKey = new KeyBinding(
                "key.interface_mod.toggle_output",
                GLFW.GLFW_KEY_BACKSLASH,
                "key.category.interface_mod.interface"
        );

        KeyBinding toggleOutput = KeyBindingHelper.registerKeyBinding(toggleHudKey);
		ServerTickEvents.END_SERVER_TICK.register(server -> {
			List<ServerPlayerEntity> players = server.getPlayerManager().getPlayerList();
			if (players.size() < 1) return;
			ServerPlayerEntity player = players.get(0);
            if (player == null) return;

            if (toggleOutput.wasPressed()) {
                isOutputting = !isOutputting;
                player.sendMessage(new LiteralText((isOutputting ? "§a" : "§c") + "WS Output turned " + (isOutputting ? "on" : "off")), true);
            }
            /*
                Desert temples
                Ruined portals
                Desert village
            */
            dataFrame++;
            if (isOutputting && dataFrame >= 2) {
                dataFrame = 0;
                // Yaw
                float yaw = player.getYaw();
                while (yaw < 0) yaw += 360;
                while (yaw > 360) yaw -= 360;
                player.setYaw(yaw); // This should help with yaw floating point presicion (not that important but still)

                String structureLocations = Math.round(player.getX() * 100.0) / 100.0 + ":" + Math.round(player.getZ() * 100.0) / 100.0;
                if (player.world.getDimension().hasCeiling()) { // Nether
                    structureLocations += ",nt";
                    BlockPos fortress = this.nearestStructure(1, server, player, StructureFeature.FORTRESS);
                    BlockPos bastion = this.nearestStructure(1, server, player, StructureFeature.BASTION_REMNANT);
                    BlockPos portal = this.nearestStructure(1, server, player, StructureFeature.RUINED_PORTAL);
                    BlockPos stronghold = this.nearestStructure(0, server, player, StructureFeature.STRONGHOLD);
                    structureLocations += ",Fortress:" + fortress.getX() + ":" + fortress.getZ();
                    structureLocations += ",Bastion:" + bastion.getX() + ":" + bastion.getZ();
                    structureLocations += ",Portal:" + portal.getX() + ":" + portal.getZ();
                    structureLocations += ",Stronghold:" + (stronghold.getX() / 8) + ":" + (stronghold.getZ() / 8);
				} else if (player.world.getDimension().isBedWorking()) { // Overworld
                    structureLocations += ",ov";
                    BlockPos village = this.nearestStructure(0, server, player, StructureFeature.VILLAGE);
                    BlockPos temple = this.nearestStructure(0, server, player, StructureFeature.DESERT_PYRAMID);
                    BlockPos portal = this.nearestStructure(0, server, player, StructureFeature.RUINED_PORTAL);
                    BlockPos stronghold = this.nearestStructure(0, server, player, StructureFeature.STRONGHOLD);
                    structureLocations += ",Village:" + village.getX() + ":" + village.getZ();
                    structureLocations += ",Temple:" + temple.getX() + ":" + temple.getZ();
                    structureLocations += ",Portal:" + portal.getX() + ":" + portal.getZ();
                    structureLocations += ",Stronghold:" + stronghold.getX() + ":" + stronghold.getZ();
				} else { // The End
                    structureLocations += ",nd";
				}

                String sendString = "yw\":\"" + (int)yaw + "\",\"ls\":\"" + structureLocations;
                try {
                    URL url = new URL("http://10.0.0.4:100");
                    URLConnection con = url.openConnection();
                    HttpURLConnection http = (HttpURLConnection)con;
                    try {
                        http.setRequestMethod("POST");
                        http.setDoOutput(true);

                        byte[] out = sendString.getBytes(StandardCharsets.UTF_8);
                        int length = out.length;
                        http.setFixedLengthStreamingMode(length);
                        http.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                        http.connect();
                        try (OutputStream os = http.getOutputStream()) {
                            os.write(out);
                        }
                    } catch (Exception e) {}
                } catch (Exception e) {}
            }
        });
    }

    private BlockPos nearestStructure(int wid, MinecraftServer server, ServerPlayerEntity player, StructureFeature struct) {
        BlockPos structPos;
        if (wid == 0) {
            structPos = server.getWorld(World.OVERWORLD).locateStructure(struct, player.getBlockPos(), 256, false);
        } else {
            structPos = server.getWorld(World.NETHER).locateStructure(struct, player.getBlockPos(), 256, false);
        }
        if (structPos == null) {
            return player.getBlockPos();
        } else {
            return structPos;
        }
    }
}
