
## REPEAT
tag @e[type=item] add OutFill

execute as @e[tag=OutFill] at @s if block ~1 ~ ~ stone run fill ~1 ~ ~ ~ ~ ~ air destroy
execute as @e[tag=OutFill] at @s if block ~-1 ~ ~ stone run fill ~-1 ~ ~ ~ ~ ~ air destroy
execute as @e[tag=OutFill] at @s if block ~ ~1 ~ stone run fill ~ ~1 ~ ~ ~ ~ air destroy
execute as @e[tag=OutFill] at @s if block ~ ~-1 ~ stone run fill ~ ~-1 ~ ~ ~ ~ air destroy
execute as @e[tag=OutFill] at @s if block ~ ~ ~1 stone run fill ~ ~ ~1 ~ ~ ~ air destroy
execute as @e[tag=OutFill] at @s if block ~ ~ ~-1 stone run fill ~ ~ ~-1 ~ ~ ~ air destroy

kill @e[tag=OutFill]
