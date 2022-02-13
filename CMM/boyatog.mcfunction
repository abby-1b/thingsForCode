scoreboard objectives add UseElectric minecraft.used:minecraft.carrot_on_a_stick
scoreboard objectives add Sneak minecraft.custom:minecraft.sneak_time
scoreboard objectives add Recharge dummy
tag CodeIGuess add ElectricUser
tag boyatog add ElectricUser

# Repeat
#execute as @e[scores={Recharge=1..}] run scoreboard players set @s UseElectric 0
#execute as @e[tag=!ElectricUser,scores={UseElectric=1..}] run scoreboard players set @s UseElectric 0
#execute as @e[scores={Sneak=1..}] run tag @s add Sneaking
#execute as @e[scores={Sneak=0}] run tag @s remove Sneaking
#execute as @e[scores={Sneak=1..}] run scoreboard players remove @s Sneak 1

# Click
execute as @r[tag=!Sneaking,scores={UseElectric=1..}] at @s as @e[distance=1..15,type=!lightning_bolt] at @s run summon lightning_bolt ~ ~ ~

# Sneak
effect give @e[tag=ElectricUser,tag=Sneaking] jump_boost 1 5 true
effect give @e[tag=ElectricUser,tag=Sneaking] resistance 1 2 true
execute at @e[tag=Sneaking,nbt={OnGround:1b}] run particle minecraft:dust 1 1 0 2 ~ ~0.3 ~ 5 0.2 5 0.05 2
execute at @e[tag=Sneaking,nbt={OnGround:1b}] run effect give @e[distance=1..] wither 3 0 true

# Sneak + Click
execute as @e[tag=Sneaking,scores={UseElectric=1..}] at @s run summon lightning_bolt ~2 ~ ~
execute as @e[tag=Sneaking,scores={UseElectric=1..}] at @s run summon lightning_bolt ~-2 ~ ~
execute as @e[tag=Sneaking,scores={UseElectric=1..}] at @s run summon lightning_bolt ~ ~ ~2
execute as @e[tag=Sneaking,scores={UseElectric=1..}] at @s run summon lightning_bolt ~ ~ ~-2

execute as @e[scores={UseElectric=1..}] run scoreboard players set @s UseElectric 0

# item replace entity boyatog armor.feet with minecraft:leather_boots{Unbreakable:1b,display:{color:8273333,Name:"Ab*y's Boots"},Enchantments:[{id:"minecraft:feather_falling",lvl:255},{id:"minecraft:protection",lvl:255},{id:"minecraft:thorns",lvl:10},{id:"minecraft:depth_strider",lvl:3}]}
