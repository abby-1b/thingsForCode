
# Summon the stand!
execute as @e[scores={clicks=1..}] at @s run summon armor_stand ~ ~ ~ {NoGravity:1b}



# Remove
execute as @e[scores={clicks=1..}] run scoreboard players remove @s clicks 1
