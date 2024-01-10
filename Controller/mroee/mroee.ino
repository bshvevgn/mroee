#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <BluetoothSerial.h>
#include <BleKeyboard.h>
#include <EEPROM.h>
#include <Preferences.h>
#include "GyverTimer.h"
#include "GyverButton.h"
#include "icons.h"
#include <HardwareSerial.h>

/* Confuguration section */
#define DIM_ENABLED true
#define DEVICE_INFO "mroee;S/N092300001"

HardwareSerial SerialPort(2);

#define BTN1 4
#define BTN2 34
#define BTN3 2
#define BTN4 15

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display1(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display2(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display3(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display4(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BleKeyboard keyboard("mroee", "Higlight House", 100);

GButton butt1(BTN1);
GButton butt2(BTN2);
GButton butt3(BTN3);
GButton butt4(BTN4);

Preferences preferences;

GTimer connectionTimer(MS);
GTimer brTimer(MS);

const uint8_t INITIAL_ICON_WIDTH = 60;
const uint8_t INITIAL_ICON_HEIGHT = 60;
const uint8_t TARGET_ICON_WIDTH = 60;
const uint8_t TARGET_ICON_HEIGHT = 60;

int dimMode = 2;

#define MAX_KEY_LENGTH 16
#define MAX_VALUE_LENGTH 32
#define MAX_ENTRIES 10

struct KeyValuePair {
  char key[MAX_KEY_LENGTH];
  char value[MAX_VALUE_LENGTH];
};

void TCA9548A(uint8_t bus) {
  Wire.beginTransmission(0x70);
  Wire.write(1 << bus);
  if (Wire.endTransmission()) {
    Serial.println("WIRE ERROR");
  };
}

class KeyValueCollection {
public:
  KeyValueCollection() {
    EEPROM.begin(sizeof(KeyValuePair) * MAX_ENTRIES);
    loadCollection();
  }

  void add(const char* key, const char* value) {
    if (size >= MAX_ENTRIES) {
      return;
    }

    for (int i = 0; i < size; i++) {
      if (strcmp(entries[i].key, key) == 0) {
        strncpy(entries[i].value, value, MAX_VALUE_LENGTH);
        saveCollection();
        return;
      }
    }

    KeyValuePair entry;
    strncpy(entry.key, key, MAX_KEY_LENGTH);
    strncpy(entry.value, value, MAX_VALUE_LENGTH);

    entries[size] = entry;
    size++;

    saveCollection();
  }

  const char* get(const char* key) {
    for (int i = 0; i < size; i++) {
      if (strcmp(entries[i].key, key) == 0) {
        return entries[i].value;
      }
    }

    return nullptr;
  }

private:
  KeyValuePair entries[MAX_ENTRIES];
  int size = 0;

  void loadCollection() {
    for (int i = 0; i < MAX_ENTRIES; i++) {
      EEPROM.get(i * sizeof(KeyValuePair), entries[i]);
      if (entries[i].key[0] == '\0') {
        break;
      }
      size++;
    }
  }

  void saveCollection() {
    for (int i = 0; i < size; i++) {
      EEPROM.put(i * sizeof(KeyValuePair), entries[i]);
    }
    EEPROM.commit();
  }
};

KeyValueCollection collection;

void saveIconState(uint32_t screenNumber, uint32_t iconNumber) {
  preferences.begin("iconStorage", false);
  preferences.putUInt((String("screen") + String(screenNumber)).c_str(), iconNumber);
  preferences.end();
}

uint8_t loadIconState(uint32_t screenNumber) {
  preferences.begin("iconStorage", true);
  uint32_t iconNumber = preferences.getUInt((String("screen") + String(screenNumber)).c_str(), 0);
  preferences.end();
  return iconNumber;
}

void saveShortcutState(uint32_t screenNumber, String shortcut) {
  preferences.begin("iconStorage", false);
  preferences.putString((String("screenSC") + String(screenNumber)).c_str(), shortcut);
  preferences.end();
}

String loadShortcutState(uint32_t screenNumber) {
  preferences.begin("iconStorage", true);
  String shortcut = preferences.getString((String("screenSC") + String(screenNumber)).c_str());
  preferences.end();
  return shortcut;
}

void restoreState() {
  for (uint32_t screenNumber = 1; screenNumber <= 4; ++screenNumber) {
    uint32_t iconNumber = loadIconState(screenNumber);
    String shortcut = loadShortcutState(screenNumber);
    changeIcon(screenNumber, iconNumber);
    collection.add(String(screenNumber).c_str(), shortcut.c_str());
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(10);

  SerialPort.begin(115200, SERIAL_8N1, 16, 17);
  SerialPort.setTimeout(10);

  SerialPort.println(DEVICE_INFO);

  pinMode(5, OUTPUT);
  pinMode(36, INPUT);
  pinMode(4, INPUT_PULLUP);
  pinMode(34, INPUT_PULLUP);
  pinMode(2, INPUT_PULLUP);
  pinMode(15, INPUT_PULLUP);
  digitalWrite(5, HIGH);

  Wire.begin();
  connectionTimer.setInterval(5000);
  brTimer.setInterval(100);
  Serial.println("Starting mroee controller");
  Serial.println(DEVICE_INFO);

  TCA9548A(4);
  display1.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display1.setRotation(2);
  display1.clearDisplay();

  drawIconS1(logo, INITIAL_ICON_WIDTH, INITIAL_ICON_HEIGHT);
  delay(1000);

  TCA9548A(5);
  display2.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display2.setRotation(2);
  display2.clearDisplay();

  TCA9548A(2);
  display3.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display3.clearDisplay();

  TCA9548A(3);
  display4.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display4.clearDisplay();

  preferences.begin("iconStorage", false);
  restoreState();
  keyboard.begin();
  SerialPort.println("Ready");

  TCA9548A(2);
  display1.clearDisplay();
}

void loop() {
  butt1.tick();
  butt2.tick();
  butt3.tick();
  butt4.tick();

  if (connectionTimer.isReady()) {
    SerialPort.println(DEVICE_INFO);
    //Serial.println(DEVICE_INFO);
    //TCA9548A(4);
    //display1.setRotation(2);
    //display1.clearDisplay();
    //display1.drawBitmap((display1.width() - ICON_WIDTH) / 2, (display1.height() - ICON_HEIGHT) / 2, copy_ico, ICON_WIDTH, ICON_HEIGHT, 1);
    //display1.display();
  };

  if (dimMode == 2) {
    if (brTimer.isReady()) {
      //Serial.println(analogRead(36));
      if (analogRead(36) > 10) {
        setHighBrightness();
      } else {
        setLowBrightness();
      }
    }
  }

  if (butt1.isClick()) {
    Serial.println("1st");
    SerialPort.println("1st");
    executeShortcut(collection.get("1"));
    delay(300);
  }
  if (butt2.isClick()) {
    SerialPort.println("2nd");
    executeShortcut(collection.get("2"));
    delay(300);
  }
  if (butt3.isClick()) {
    SerialPort.println("3rd");
    executeShortcut(collection.get("3"));
    delay(300);
  }
  if (butt4.isClick()) {
    SerialPort.println("4th");
    executeShortcut(collection.get("4"));
    delay(300);
  }

  if (SerialPort.available() > 0) {
    String received = SerialPort.readString();
    received.trim();
    parseString(received);
  }
}

void setHighBrightness() {
  TCA9548A(4);
  display1.dim(false);
  TCA9548A(5);
  display2.dim(false);
  TCA9548A(2);
  display3.dim(false);
  TCA9548A(3);
  display4.dim(false);
}

void setLowBrightness() {
  TCA9548A(4);
  display1.dim(true);
  TCA9548A(5);
  display2.dim(true);
  TCA9548A(2);
  display3.dim(true);
  TCA9548A(3);
  display4.dim(true);
}

void executeShortcut(String str) {
  parseAndPressKeys(str);
}

void parseAndPressKeys(String command) {
  int index = 0;
  String tokens[3];
  while ((index < 3) && (command.length() > 0)) {
    int semicolonIndex = command.indexOf(';');
    if (semicolonIndex > 0) {
      tokens[index] = command.substring(0, semicolonIndex);
      command = command.substring(semicolonIndex + 1);
    } else {
      tokens[index] = command;
      command = "";
    }
    index++;
  }

  for (int i = 0; i < index; i++) {
    SerialPort.print("Button: ");
    SerialPort.println(tokens[i]);
  }

  for (int i = 0; i < index; i++) {
    if (tokens[i] == "ctrl" || tokens[i] == "control")
      keyboard.press(KEY_LEFT_CTRL);
    else if (tokens[i] == "alt")
      keyboard.press(KEY_LEFT_ALT);
    else if (tokens[i] == "meta" || tokens[i] == "gui")
      keyboard.press(KEY_LEFT_GUI);
    else if (tokens[i] == "shift")
      keyboard.press(KEY_LEFT_SHIFT);
    else if (tokens[i] == "space")
      //keyboard.press(KEY_SPACE);
      continue;
    else if (tokens[i] == "arrowleft")
      keyboard.press(KEY_LEFT_ARROW);
    else if (tokens[i] == "arrowdown")
      keyboard.press(KEY_DOWN_ARROW);
    else if (tokens[i] == "arrowup")
      keyboard.press(KEY_UP_ARROW);
    else if (tokens[i] == "arrowright")
      keyboard.press(KEY_RIGHT_ARROW);
    else if (tokens[i] == "tab")
      keyboard.press(KEY_TAB);
    else if (tokens[i] == "capslock")
      keyboard.press(KEY_CAPS_LOCK);
    else if (tokens[i] == "enter")
      keyboard.press(KEY_RETURN);
    else if (tokens[i] == "backspace")
      keyboard.press(KEY_BACKSPACE);
    else if (tokens[i] == "escape")
      keyboard.press(KEY_ESC);
    else if (tokens[i] == "f1")
      keyboard.press(KEY_F1);
    else if (tokens[i] == "f2")
      keyboard.press(KEY_F2);
    else if (tokens[i] == "f3")
      keyboard.press(KEY_F3);
    else if (tokens[i] == "f4")
      keyboard.press(KEY_F4);
    else if (tokens[i] == "f5")
      keyboard.press(KEY_F5);
    else if (tokens[i] == "f6")
      keyboard.press(KEY_F6);
    else if (tokens[i] == "f7")
      keyboard.press(KEY_F7);
    else if (tokens[i] == "f8")
      keyboard.press(KEY_F8);
    else if (tokens[i] == "f9")
      keyboard.press(KEY_F9);
    else if (tokens[i] == "f10")
      keyboard.press(KEY_F10);
    else if (tokens[i] == "f11")
      keyboard.press(KEY_F11);
    else if (tokens[i] == "f12")
      keyboard.press(KEY_F12);
    else if (tokens[i] == "play"){
      keyboard.press(KEY_MEDIA_PLAY_PAUSE);
      keyboard.release(KEY_MEDIA_PLAY_PAUSE);
      break;
    }
    else if (tokens[i] == "pause"){
      keyboard.press(KEY_MEDIA_PLAY_PAUSE);
      keyboard.release(KEY_MEDIA_PLAY_PAUSE);
      break;
    }
    else if (tokens[i] == "volumeup"){
      keyboard.press(KEY_MEDIA_VOLUME_UP);
      keyboard.release(KEY_MEDIA_VOLUME_UP);
      break;
    }
    else if (tokens[i] == "volumedown"){
      keyboard.press(KEY_MEDIA_VOLUME_DOWN);
      keyboard.release(KEY_MEDIA_VOLUME_DOWN);
      break;
    }
    else if (tokens[i] == "mute"){
      keyboard.press(KEY_MEDIA_MUTE);
      keyboard.release(KEY_MEDIA_MUTE);
      break;
    }
    else if (tokens[i] == "next")
      keyboard.press(KEY_MEDIA_NEXT_TRACK);
    else if (tokens[i] == "previous")
      keyboard.press(KEY_MEDIA_PREVIOUS_TRACK);
    else if (tokens[i] == "search")
      keyboard.press(KEY_F13);
    else if (tokens[i].length() == 1 && isAlphaNumeric(tokens[i][0]))
      keyboard.press(tokens[i][0]);
    else {
      continue;
    }
  }

  delay(10);
  keyboard.releaseAll();
  delay(10);
}


void parseString(String str) {
  int startPos = 0;
  int endPos = str.indexOf('\n');

  while (endPos != -1) {
    String line = str.substring(startPos, endPos);

    parseLine(line);

    startPos = endPos + 1;
    endPos = str.indexOf('\n', startPos);
  }

  String lastLine = str.substring(startPos);
  parseLine(lastLine);
}

// Функция парсинга для одной строки
void parseLine(String line) {
  int screen, icon;
  int pressed;
  int mode;
  String shortcut;

  if (line == "sendConnect") {
    SerialPort.println(DEVICE_INFO);
  } else {
    if (sscanf(line.c_str(), "s%di%d", &screen, &icon) == 2) {
      changeIcon(screen, icon);
    } else if (sscanf(line.c_str(), "p%d", &pressed) == 1) {
      String pressedS = String(pressed);
      executeShortcut(collection.get(pressedS.c_str()));
    } else if (sscanf(line.c_str(), "dim%d", &mode) == 1) {
      dimMode = mode;
      if(dimMode == 1) setHighBrightness();
      if(dimMode == 3) setLowBrightness();
    } else {
      String input = line;
      if (input.startsWith("s") && input.indexOf("sc") != -1) {
        int keyStartIndex = input.indexOf("s") + 1;
        int keyEndIndex = input.indexOf("sc");
        int valueStartIndex = input.indexOf("sc") + 2;

        if (keyStartIndex < keyEndIndex && keyEndIndex < valueStartIndex) {
          String key = input.substring(keyStartIndex, keyEndIndex);
          String value = input.substring(valueStartIndex);
          saveShortcutState(key.toInt(), value);
          collection.add(key.c_str(), value.c_str());

          SerialPort.print("Screen: ");
          SerialPort.print(key.c_str());
          SerialPort.print(" Shortcut: ");
          SerialPort.print(value.c_str());
          return;
        }
      }
    }
  }
}


void changeIcon(uint8_t screenNumber, uint8_t iconNumber) {
  saveIconState(screenNumber, iconNumber);
  SerialPort.print("Changing: ");
  SerialPort.print(screenNumber);
  SerialPort.print(" Icon: ");
  SerialPort.println(iconNumber);

  const unsigned char* icon = getIcon(iconNumber);

  uint8_t resizedIconWidth = TARGET_ICON_WIDTH;
  uint8_t resizedIconHeight = TARGET_ICON_HEIGHT;
  
  switch (screenNumber) {
    case 1:
      drawIconS1(icon, resizedIconWidth, resizedIconHeight);
      break;
    case 2:
      drawIconS2(icon, resizedIconWidth, resizedIconHeight);
      break;
    case 3:
      drawIconS3(icon, resizedIconWidth, resizedIconHeight);
      break;
    case 4:
      drawIconS4(icon, resizedIconWidth, resizedIconHeight);
      break;
  }
}


const unsigned char* getIcon(uint8_t number) {
  if (number >= 0 && number < epd_bitmap_allArray_LEN) {
    return epd_bitmap_allArray[number];
  } else {
    return nullptr;
  }
}

void drawIconS1(const unsigned char* icon, uint8_t width, uint8_t height) {
  TCA9548A(4);
  display1.clearDisplay();
  display1.drawBitmap((display1.width() - width) / 2, (display1.height() - height) / 2, icon, width, height, 1);
  display1.display();
}

void drawIconS2(const unsigned char* icon, uint8_t width, uint8_t height) {
  TCA9548A(5);
  display2.clearDisplay();
  display2.drawBitmap((display2.width() - width) / 2, (display2.height() - height) / 2, icon, width, height, 1);
  display2.display();
}

void drawIconS3(const unsigned char* icon, uint8_t width, uint8_t height) {
  TCA9548A(2);
  display3.clearDisplay();
  display3.drawBitmap((display3.width() - width) / 2, (display3.height() - height) / 2, icon, width, height, 1);
  display3.display();
}

void drawIconS4(const unsigned char* icon, uint8_t width, uint8_t height) {
  TCA9548A(3);
  display4.clearDisplay();
  display4.drawBitmap((display4.width() - width) / 2, (display4.height() - height) / 2, icon, width, height, 1);
  display4.display();
}
