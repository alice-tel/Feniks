from machine import Pin, I2C
import neopixel
import lib.mcp23017 as mcp23017
import lib.ssd1306 as ssd1306
from time import sleep_ms, time
import random
import urequests as requests
import config

LEDS_PIN = 25
INT_PIN = 26

TIMER = 20
NUM_LEDS = 8
BUTTONS = 8

# Kleuren: Red, Green, Blue, Yellow, Cyan, Magenta
COLORS = [(50, 0, 0), (0, 50, 0), (0, 0, 50), (50, 50, 0), (0, 50, 50), (50, 0, 50)]

gameStarted = False

print("Starting ...\n")

i2c = I2C(scl=Pin(21), sda=Pin(22))  # De pins instellen (de i2c pins)

print("Scanning I2C Bus ...\n")
print(i2c.scan())

mcp = mcp23017.MCP23017(i2c, 0x20) #variabele voor de mcp chip

def callback(p):
    print("Button pressed ", p)
    print(255 - mcp.interrupt_captured_gpio(port=0))

int_buttons = Pin(INT_PIN, mode=Pin.IN, pull=Pin.PULL_UP)
int_buttons.irq(trigger=Pin.IRQ_RISING, handler=callback)

display = ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3c)

for i in range(BUTTONS):
    mcp.pin(i, mode=1, pullup=True, interrupt_enable=1)

leds = neopixel.NeoPixel(Pin(LEDS_PIN), NUM_LEDS)

# Initialize LEDs naar 0,0,0 (uit)
for i in range(NUM_LEDS):
    leds[i] = (0, 0, 0)
leds.write()

#De tekst die wordt laten zien als er nog niks gebeurd
display.text('Feniks IoT', 20, 1, 1)
display.show()

color_index = 0 

#Randomize de leds, dus alle leds krijgen een random kleur
def randomize_leds():
    for i in range(NUM_LEDS):
        leds[i] = random.choice(COLORS)
    leds.write()

#Checkt of alle leds dezelfde kleur zijn
def all_leds_same_color(color):
    for i in range(NUM_LEDS):
        if leds[i] != color:
            return False
    return True

#Het effect aan het begin van de game
def jump_effect():
    color = random.choice(COLORS)
    for i in range(7):
        if mcp[i].value() == 0:
            global gameStarted
            gameStarted = True
            resetGame()
            break

        if i < 8:
            leds[i+1] = (0, 0, 0)  
        leds[i] = color
        if i > 0:
            leds[i-1] = (0, 0, 0)
        leds.write()
        sleep_ms(100)
    leds[6] = (0,0,0)
    leds[7] = color
    leds.write()
    sleep_ms(100)
    leds[7] = (0,0,0)
    leds.write()
    sleep_ms(100)

#De code ophalen van de server, configuratie in de config.py file
def fetch_code():
    url = f"http://{config.SERVER}:{config.PORT}{config.ENDPOINT}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data.get("code", "No code found")
        else:
            return "Error fetching code"
    except Exception as e:
        return str(e)

timerStarted = False
timeAtStart = 0
timeLeft = TIMER

def resetGame():
    randomize_leds()
    global timeLeft
    timeLeft = TIMER
    global timeAtStart
    timeAtStart = 0
    global timerStarted
    timerStarted = False
    display.fill(0)
    display.text('Feniks IoT', 20, 1, 1)
    display.show()

while not gameStarted:
    print("lol")
    for i in range(BUTTONS):
        if mcp[i].value() == 0:
            gameStarted = True
            resetGame()
            
    if not gameStarted:   
        jump_effect()

while gameStarted:
    print("bob")
    if timerStarted:
        display.fill(0)
        display.text('Je tijd over is:', 1, 1, 1)
        timeLeft = TIMER - (time() - timeAtStart)
        display.text(str(timeLeft), 20, 40, 1) 
        display.show()
        if timeLeft <= 0:
            resetGame()
    for i in range(BUTTONS):
        if mcp[i].value() == 0:
            if not timerStarted:
                timerStarted = True
                timeAtStart = time()
            leds[i] = random.choice(COLORS) 
            leds.write()
            if all_leds_same_color((0, 50, 0)):
                code = fetch_code()
                display.fill(0)
                display.text('Je code is:', 20, 20, 1)
                display.text(code, 20, 40, 1)  
                display.show()
                
                sleep_ms(20000)
                resetGame()

    sleep_ms(100)
