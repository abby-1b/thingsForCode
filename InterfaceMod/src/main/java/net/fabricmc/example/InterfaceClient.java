package net.fabricmc.example;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.text.LiteralText;
import net.minecraft.util.math.BlockPos;
import net.minecraft.world.gen.feature.StructureFeature;
import net.minecraft.server.MinecraftServer;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;

import org.lwjgl.glfw.GLFW;

public class InterfaceClient implements ClientModInitializer {
    boolean isOutputting = false;
    int dataFrame = 0;

    @Override
    public void onInitializeClient() {
        // System.out.println("Interface Mod client starting...");
        // this.registerKeybindings();
        // System.out.println("Interface Mod client started!");
    }

    // private void registerKeybindings() {
    //     KeyBinding toggleHudKey = new KeyBinding(
    //             "key.interface_mod.toggle_output",
    //             GLFW.GLFW_KEY_BACKSLASH,
    //             "key.category.interface_mod.interface"
    //     );

    //     KeyBinding toggleOutput = KeyBindingHelper.registerKeyBinding(toggleHudKey);

    //     ClientTickEvents.END_CLIENT_TICK.register(client -> {
    //         if (client.player == null) return;

    //         if (toggleOutput.wasPressed()) {
    //             isOutputting = !isOutputting;
    //             client.player.sendMessage(new LiteralText((isOutputting ? "§a" : "§c") + "WS Output turned " + (isOutputting ? "on" : "off")), true);
    //         }
    //         /*
    //             Desert temples
    //             Ruined portals
    //             Desert village
    //         */
    //         dataFrame++;
    //         if (isOutputting && dataFrame >= 10) {
    //             dataFrame = 0;
    //             // Yaw
    //             float yaw = client.player.getYaw();
    //             while (yaw < 0) yaw += 360;
    //             while (yaw > 360) yaw -= 360;
    //             client.player.setYaw(yaw); // This should help with yaw floating point presicion (not that important but still)

    //             // Locate structure
    //             // client.player.getWorld().locateStructure(structure, blockPos, 100, false);
    //             // client.player.getServer()
    //             // MinecraftServer
    //             // World
    //             // source.getWorld().locateStructure(structure, blockPos, 100, false);
    //             // client.player.getServer().getWorlds();
    //             MinecraftServer server = client.player.getServer();
    //             if (server != null) {
    //                 BlockPos structPos = server.getOverworld().locateStructure(StructureFeature.VILLAGE, client.player.getBlockPos(), 100, false);
    //                 if (structPos == null) {
    //                     System.out.println("Structure doesn't exist. L");
    //                 } else {
    //                     System.out.println(structPos);
    //                 }
    //             } else {
    //                 System.out.println("Server is null. L");
    //             }
    //             // LocateCommand

    //             String sendString = "\"yw\":\"" + (int)yaw + "\",\"st\":\"\"";
    //             try {
    //                 URL url = new URL("http://localhost:100");
    //                 URLConnection con = url.openConnection();
    //                 HttpURLConnection http = (HttpURLConnection)con;
    //                 try {
    //                     http.setRequestMethod("POST");
    //                     http.setDoOutput(true);

    //                     byte[] out = sendString.getBytes(StandardCharsets.UTF_8);
    //                     int length = out.length;
    //                     http.setFixedLengthStreamingMode(length);
    //                     http.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
    //                     http.connect();
    //                     try (OutputStream os = http.getOutputStream()) {
    //                         os.write(out);
    //                     }
    //                 } catch (Exception e) {}
    //             } catch (Exception e) {}
    //         }
    //     });
    // }
}
