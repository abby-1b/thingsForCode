import pygame

# Some useful variables
blue = (0, 0, 65)
yellow = (255, 255, 128)
player_speed = 10

# Start up Pygame
pygame.init()
pygame.display.set_caption("Breakout")

# These are the window's dimensions
window_width = 640
window_height = 400
window = (window_width, window_height)

# Open the window
screen = pygame.display.set_mode(window)

# This caps the fps
clock = pygame.time.Clock()

class Game_Object:
    def __init__(self, pos, size, screen):
        # The numbers are: x, y, width, height
        self.rect = pygame.rect.Rect((pos[0], pos[1], size[0], size[1]))
        self.screen = screen
        self.s = 0
    
    def render(self):
        pygame.draw.rect(self.screen, yellow, self.rect)

class Player(Game_Object):
    def __init__(self, pos, screen):
        super().__init__(pos, (80, 80), screen)
    
    def bounds_check(self):
        if self.rect.left < 0:
            self.rect.left = 0
            self.s = 0
        elif self.rect.right > window_width:
            self.rect.right = window_width
            self.s = 0
    
    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.s -= 1
        if keys[pygame.K_RIGHT]:
            self.s += 1
        self.s *= 0.95
        self.rect.move_ip(self.s, 0)
        
        self.bounds_check()

class Ball(Game_Object):
    def __init__(self, pos, vel, screen):
        super().__init__(pos, (20, 20), screen)
        self.vel = vel
    
    def bounds_check(self):
        if self.rect.left < 0:
            self.rect.left = 0
        elif self.rect.right > window_width:
            self.rect.right = window_width
        
        if self.rect.top < 0:
            self.rect.top = 0
    
    def bounce(self, collided_against):
        backward_vel = [-self.vel[0], -self.vel[1]]
        ball_pre_movement = self.rect.move(backward_vel)
        
        if (
                ball_pre_movement.bottom <= collided_against.top or # Colliding from above
                ball_pre_movement.top >= collided_against.bottom): # Colliding from underneath
            self.vel[1] *= -1
            return
        
        if (
                ball_pre_movement.right <= collided_against.left or # Colliding from the left
                ball_pre_movement.left >= collided_against.right): # Colliding from the right
            self.vel[0] *= -1
            return
    
    def update(self):
        self.rect.move_ip(self.vel)
        collided_against = None
        
        if self.rect.top < 0:
            self.vel[1] *= -1
        
        if self.rect.left < 0 or self.rect.right > window_width:
            self.vel[0] *= -1
        
        # The ball goes off the bottom and dies!
        if self.rect.bottom > window_height:
            return False
        
        if self.rect.colliderect(player.rect):
            collided_against = player.rect
        
        for brick in bricks:
            if self.rect.colliderect(brick.rect):
                collided_against = brick.rect
                bricks.remove(brick)
                break
        
        if collided_against:
            self.bounce(collided_against)
        
        self.bounds_check()
        
        return  True

class Brick(Game_Object):
    def __init__(self, pos, screen):
        super().__init__(pos, (80, 20), screen)

player = Player((window_width / 2 - 40, window_height - 90), screen)
ball = Ball((window_width / 2 - 10, window_height - 110), [5, 5], screen)
bricks = []

# Use ranges to generate the stating bricks
for x in range(window_width // 12 - 40, window_width, window_width // 6):
    for y in range(10, window_height // 2, window_height // 8):
        bricks.append(Brick((x, y), screen))

done = False
f = 1000
while not done:
    # Check all the Pygame events
    for event in pygame.event.get():
        # That's the event representing clicking the [X] button on the window
        if event.type == pygame.QUIT:
            done = True
    
    player.update()
    # Ball's update returns True as long as it's alive
    if not ball.update():
        done = True
    f -= 1
    # print(f)
    
    screen.fill(blue)
    player.render()
    ball.render()
    # Loop through all the brick objects to render them individually
    for brick in bricks:
        brick.render()
    pygame.display.update()
    
    # This is 30 frames per 1000 milliseconds
    clock.tick(1000/30)

# Close the window and stop Pygame
pygame.quit()
