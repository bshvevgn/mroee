#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <BluetoothSerial.h>
#include <BleKeyboard.h>
#include <EEPROM.h>
#include <Preferences.h>
#include "GyverTimer.h"
#include "icons.h"

#define DIM_ENABLED true

#define DEVICE_INFO "mroee;S/N092300001"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display1(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display2(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display3(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_SSD1306 display4(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BleKeyboard keyboard("mroee", "Higlight House", 100);
Preferences preferences;

GTimer connectionTimer(MS);
GTimer brTimer(MS);

//static NimBLEUUID bmeServiceUUID("91bad492-b950-4226-aa2b-4ede9fa42f59");
//static NimBLEUUID stringUUID("cba1d466-344c-4be3-ab3f-189f80dd7518");

#define ICON_HEIGHT 60
#define ICON_WIDTH 60

#define OR_ICON_HEIGHT 64
#define OR_ICON_WIDTH 64

/*bool connectToServer(BLEAddress pAddress) {
   BLEClient* pClient = BLEDevice::createClient();
 
  // Connect to the remove BLE Server.
  pClient->connect(pAddress);
  Serial.println(" - Connected to server");
 
  // Obtain a reference to the service we are after in the remote BLE server.
  BLERemoteService* pRemoteService = pClient->getService(bmeServiceUUID);
  if (pRemoteService == nullptr) {
    Serial.print("Failed to find our service UUID: ");
    Serial.println(bmeServiceUUID.toString().c_str());
    return (false);
  }
 
  stringCharacteristic = pRemoteService->getCharacteristic(stringUUID);

  if (stringeCharacteristic == nullptr) {
    Serial.print("Failed to find our characteristic UUID");
    return false;
  }
  Serial.println(" - Found our characteristics");
 
  stringCharacteristic->registerForNotify(stringNotifyCallback);
  return true;
}*/





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
  if(Wire.endTransmission()) {
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

void restoreIconStates() {
  for (uint32_t screenNumber = 1; screenNumber <= 4; ++screenNumber) {
    uint32_t iconNumber = loadIconState(screenNumber);
    changeIcon(screenNumber, iconNumber);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(10);
  Serial.println(DEVICE_INFO);

  pinMode(5, OUTPUT);
  pinMode(36, INPUT);
  pinMode(4, INPUT);
  pinMode(34, INPUT);
  pinMode(2, INPUT);
  pinMode(15, INPUT);
  digitalWrite(5, HIGH);

  Wire.begin();
  connectionTimer.setInterval(500);
  brTimer.setInterval(100);
  Serial.println("Starting mroee controller");
  Serial.println(DEVICE_INFO);

  TCA9548A(4);
  display1.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display1.setRotation(2);
  display1.clearDisplay();

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
  display4.drawBitmap((display4.width() - ICON_WIDTH) / 2, (display4.height() - ICON_HEIGHT) / 2, lock, ICON_WIDTH, ICON_HEIGHT, 1);
  
  preferences.begin("iconStorage", false);
  restoreIconStates();
  Serial.println("Ready");

  TCA9548A(2);
  display1.clearDisplay();
}

void loop() {
  if (connectionTimer.isReady()) {
    //Serial.println(DEVICE_INFO);
    //TCA9548A(4);
    //display1.setRotation(2);
    //display1.clearDisplay();
    //display1.drawBitmap((display1.width() - ICON_WIDTH) / 2, (display1.height() - ICON_HEIGHT) / 2, copy_ico, ICON_WIDTH, ICON_HEIGHT, 1);
    //display1.display();

  };

  if (DIM_ENABLED) {
    if (brTimer.isReady()) {
      //Serial.println(analogRead(36));
      if (analogRead(36) > 10) {
        setHighBrightness();
      } else {
        setLowBrightness();
      }
    }
  }


  if (analogRead(4) > 4090) {
    Serial.println("1st");
    executeShortcut(collection.get("1"));
    delay(300);
  }
  if (analogRead(34) > 4090) {
    // Serial.println("2nd");
    // executeShortcut(collection.get("2"));
    // delay(300);
  }
  if (analogRead(2) > 4090) {
    Serial.println("3rd");
    executeShortcut(collection.get("3"));
    delay(300);
  }
  if (analogRead(15) > 4090) {
    Serial.println("4th");
    executeShortcut(collection.get("4"));
    delay(300);
  }

  if (Serial.available() > 0) {
    String received = Serial.readString();  //read until timeout
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
    Serial.print("Button: ");
    Serial.println(tokens[i]);
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
    else if (tokens[i] == "play")
      keyboard.press(KEY_MEDIA_PLAY_PAUSE);
    else if (tokens[i] == "pause")
      keyboard.press(KEY_MEDIA_PLAY_PAUSE);
    else if (tokens[i] == "volumeup")
      //keyboard.press(KEY_MEDIA_VOLUME_INC);
      continue;
    else if (tokens[i] == "volumedown")
      //keyboard.press(KEY_MEDIA_VOLUME_DEC);
      continue;
    else if (tokens[i] == "mute")
      keyboard.press(KEY_MEDIA_MUTE);
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

  keyboard.releaseAll();
}


void parseString(String str) {
  int screen, icon;
  int pressed;
  String shortcut;

  if (str == "sendConnect") {
    Serial.println(DEVICE_INFO);
    delay(100);
    Serial.println(DEVICE_INFO);
  } else {
    if (sscanf(str.c_str(), "s%di%d", &screen, &icon) == 2) {
      changeIcon(screen, icon);

    } else if (sscanf(str.c_str(), "p%d", &pressed) == 1) {
      String pressedS = String(pressed);
      executeShortcut(collection.get(pressedS.c_str()));

    } else {
      String input = str;
      if (input.startsWith("s") && input.indexOf("sc") != -1) {
          Serial.print("QQQ ");
          Serial.println(input);
          int keyStartIndex = input.indexOf("s") + 1;
          int keyEndIndex = input.indexOf("sc");
          int valueStartIndex = input.indexOf("sc") + 2;

          if (keyStartIndex < keyEndIndex && keyEndIndex < valueStartIndex) {
              String key = input.substring(keyStartIndex, keyEndIndex);
              String value = input.substring(valueStartIndex);

              collection.add(key.c_str(), value.c_str());

              Serial.print("Screen: ");
              Serial.print(key.c_str());
              Serial.print(" Shortcut: ");
              Serial.print(value.c_str());
              return;
          }
      }
    }
  }
}

void changeIcon(uint8_t screenNumber, uint8_t iconNumber) {
  saveIconState(screenNumber, iconNumber);
  Serial.print("Changing: ");
  Serial.print(screenNumber);
  Serial.print(" Icon: ");
  Serial.println(iconNumber);
  switch (screenNumber) {
    case 1:
      drawIconS1(getIcon(iconNumber));
      break;
    case 2:
      drawIconS2(getIcon(iconNumber));
      break;
    case 3:
      drawIconS3(getIcon(iconNumber));
      break;
    case 4:
      drawIconS4(getIcon(iconNumber));
      break;
  }
}


const unsigned char* ICONS_LIST[] = { copy_ico, paste_ico, mute_ico, volumeup, volumedown, pause_ico, play, backward, forward, screenshot, search, moon, lock };

const unsigned char* getIcon(int number) {
  if (number >= 0 && number < sizeof(ICONS_LIST) / sizeof(ICONS_LIST[0])) {
    return ICONS_LIST[number];
  } else {
    return 0;
  }
}

void drawIconS1(const unsigned char* icon) {
  TCA9548A(4);
  display1.clearDisplay();
  display1.drawBitmap((display1.width() - ICON_WIDTH) / 2, (display1.height() - ICON_HEIGHT) / 2, icon, ICON_WIDTH, ICON_HEIGHT, 1);
  display1.display();
}

void drawIconS2(const unsigned char* icon) {
  TCA9548A(5);
  display2.clearDisplay();
  display2.drawBitmap((display2.width() - ICON_WIDTH) / 2, (display2.height() - ICON_HEIGHT) / 2, icon, ICON_WIDTH, ICON_HEIGHT, 1);
  display2.display();
}

void drawIconS3(const unsigned char* icon) {
  TCA9548A(2);
  display3.clearDisplay();
  display3.drawBitmap((display3.width() - ICON_WIDTH) / 2, (display3.height() - ICON_HEIGHT) / 2, icon, ICON_WIDTH, ICON_HEIGHT, 1);
  display3.display();
}

void drawIconS4(const unsigned char* icon) {
  TCA9548A(3);
  display4.clearDisplay();
  display4.drawBitmap((display4.width() - ICON_WIDTH) / 2, (display4.height() - ICON_HEIGHT) / 2, icon, ICON_WIDTH, ICON_HEIGHT, 1);
  display4.display();
}
