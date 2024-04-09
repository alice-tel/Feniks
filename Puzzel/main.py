import machine
import neopixel
import time
import random

# Pin van de lampies
PIN = 14

# kleurtjes
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
AQUA = (0, 255, 255)
WHITE = (255, 255, 255)

NUM_LEDS = 4
np = neopixel.NeoPixel(machine.Pin(PIN), NUM_LEDS)

def set_pixel_color(pixel, color):
    np[pixel] = color
    np.write()

def random_color():
    return random.choice([RED, GREEN, BLUE, YELLOW, AQUA, WHITE])

def debounce(callback):
    last_call = 0
    def wrapper(pin):
        nonlocal last_call
        current_time = time.ticks_ms()
        if current_time - last_call > 200:  # debounce time (200 ms)
            callback(pin)
            last_call = current_time
    return wrapper

def handle_button27(pin):
    global running
    running = False
    set_pixel_color(0, random_color())

def handle_button26(pin):
    global running
    running = False
    set_pixel_color(1, random_color())

def handle_button25(pin):
    global running
    running = False
    set_pixel_color(2, random_color())

def handle_button12(pin):
    global running
    running = False
    set_pixel_color(3, random_color())

button27 = machine.Pin(27, machine.Pin.IN, machine.Pin.PULL_UP)
button27.irq(trigger=machine.Pin.IRQ_FALLING, handler=debounce(handle_button27))

button26 = machine.Pin(26, machine.Pin.IN, machine.Pin.PULL_UP)
button26.irq(trigger=machine.Pin.IRQ_FALLING, handler=debounce(handle_button26))

button25 = machine.Pin(25, machine.Pin.IN, machine.Pin.PULL_UP)
button25.irq(trigger=machine.Pin.IRQ_FALLING, handler=debounce(handle_button25))

button12 = machine.Pin(12, machine.Pin.IN, machine.Pin.PULL_UP)
button12.irq(trigger=machine.Pin.IRQ_FALLING, handler=debounce(handle_button12))

running = True

def jump_effect():
    color = random_color()
    for i in range(NUM_LEDS * 2):
        np.fill((0, 0, 0))  # Clear LEDs
        if i < NUM_LEDS:
            set_pixel_color(i, color)  # Move color to the right
        else:
            set_pixel_color(NUM_LEDS * 2 - i - 1, color)  # Move color back to the left
        np.write()
        if not running:  # Check if the running flag is False
            return
        time.sleep_ms(100)  # Adjust speed here

# Main loop
def main():
    global running
    running = True

    while running:
        jump_effect()

if __name__ == "__main__":
    main()
