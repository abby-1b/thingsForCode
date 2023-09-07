scoreboard objectives add UseEnder minecraft.used:minecraft.warped_fungus_on_a_stick
scoreboard objectives add Sneak minecraft.custom:minecraft.sneak_time
scoreboard objectives add Recharge dummy
scoreboard objectives add BridgeAmount dummy
tag CodeIGuess add EnderUser

## REPEAT
execute as @e[scores={Recharge=1..}] run scoreboard players set @s UseEnder 0
execute as @e[tag=!EnderUser,scores={UseEnder=1..}] run scoreboard players set @s UseEnder 0
execute as @e[scores={Sneak=1..}] run tag @s add Sneaking
execute as @e[scores={Sneak=0}] run tag @s remove Sneaking
execute as @e[scores={Sneak=1..}] run scoreboard players remove @s Sneak 1

# Sneak
execute at @e[tag=EnderUser,tag=Sneaking,scores={Recharge=0}] run effect give @e[distance=1..5] levitation 1 2 true
execute at @e[tag=EnderUser,tag=Sneaking,scores={Recharge=0}] run particle minecraft:dust 0.68 0 1 2 ~ ~0.3 ~ 1.2 0.2 1.2 0.05 1

# Click
execute as @e[scores={UseEnder=1..}] at @s run particle minecraft:dust 0.68 0 1 5 ~ ~1 ~ 0.25 0.55 0.25 1 20 normal @a
execute as @e[scores={UseEnder=1..},tag=!Sneaking] at @s run tp @s ^ ^ ^3
scoreboard players add @e[scores={UseEnder=1..},tag=!Sneaking] Recharge 3

# Click + Sneak
execute as @e[scores={UseEnder=1..},tag=Sneaking] at @s run tag @e[distance=..3] add TPWith
execute as @e[scores={UseEnder=1..},tag=Sneaking] at @s run tp @e[tag=TPWith] ^ ^ ^20
scoreboard players add @e[scores={UseEnder=1..},tag=Sneaking] Recharge 30
tag @e[tag=TPWith] remove TPWith
execute as @e[scores={UseEnder=1..}] at @s run particle minecraft:dust 0.68 0 1 3 ~ ~1 ~ 0.25 0.55 0.25 1 5 normal @a

# Drop
execute as @e[tag=EnderUser] at @s positioned ~ ~1.5 ~ run tag @e[type=item,nbt={Item:{id:"minecraft:warped_fungus_on_a_stick"}},distance=..1,limit=1] add DroppedEnder
execute as @e[tag=DroppedEnder] at @s as @p[tag=EnderUser,scores={Recharge=0},tag=!Sneaking] at @s run scoreboard players set @s BridgeAmount 100
execute at @e[tag=DroppedEnder] as @p[tag=EnderUser,scores={Recharge=0},tag=!Sneaking] at @s run scoreboard players set @s Recharge 80

execute as @e[tag=EnderUser] at @s run fill ~-3 ~-3 ~-3 ~3 ~2 ~3 air replace purpur_block
execute as @e[scores={BridgeAmount=1..}] at @s run fill ~-1 ~-1 ~-1 ~1 ~-1 ~1 purpur_block replace air

# Drop + Sneak
execute as @e[tag=DroppedEnder] at @s run effect give @p[tag=EnderUser,scores={Recharge=0},tag=Sneaking] speed 10 1 true
execute as @e[tag=DroppedEnder] at @s run spreadplayers ~ ~ 0 40 false @p[tag=EnderUser,scores={Recharge=0},tag=Sneaking]
execute at @e[tag=DroppedEnder] as @p[tag=EnderUser,scores={Recharge=0},tag=Sneaking] at @s run scoreboard players set @s Recharge 120

# Reset drop
execute as @e[tag=DroppedEnder] at @s run item replace entity @p[tag=EnderUser] weapon with warped_fungus_on_a_stick
kill @e[tag=DroppedEnder]

# Show recharge
execute as @a[scores={Recharge=2..}] run title @s actionbar {"score":{"name":"@s","objective":"Recharge"},"color":"yellow"}
execute as @a[scores={Recharge=1}] run title @s actionbar {"text":"0"}
scoreboard players remove @e[scores={Recharge=1..}] Recharge 1
scoreboard players remove @e[scores={BridgeAmount=1..}] BridgeAmount 1

execute as @e[scores={UseEnder=1..}] run scoreboard players set @s UseEnder 0

# item replace entity CodeIGuess armor.feet with minecraft:leather_boots{Unbreakable:1b,display:{color:8273333,Name:'{"text":"Ab*y\'s Boots"}'},Enchantments:[{id:"minecraft:feather_falling",lvl:255},{id:"minecraft:protection",lvl:255},{id:"minecraft:thorns",lvl:10},{id:"minecraft:depth_strider",lvl:3}]}

