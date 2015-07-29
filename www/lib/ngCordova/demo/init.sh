#!/bin/bash

function ap {
  cordova plugin add org.apache.cordova.$1
}

ap camera
ap console
ap contacts
ap device
ap dialogs
ap device-motion
ap device-orientation
ap network-information
ap geolocation
ap globalization
ap file
ap file-transfer
ap splashscreen
ap statusbar
ap vibration
ap media
ap inappbrowser
ap battery-status

cordova plugin add http://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="12345678" --variable APP_NAME="Name"
cordova plugin add http://github.com/driftyco/ionic-plugins-keyboard          # keyboard
cordova plugin add http://github.com/VitaliiBlagodir/cordova-plugin-datepicker.git    # date-picker
cordova plugin add http://github.com/wildabeast/BarcodeScanner.git     # barcode scanner
cordova plugin add http://github.com/chrisekelley/AppPreferences       # app preferences
cordova plugin add http://github.com/EddyVerbruggen/Flashlight-PhoneGap-Plugin.git    # flashlight
cordova plugin add http://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git         # toast
cordova plugin add uk.co.ilee.touchid       # touchID
cordova plugin add http://github.com/pushandplay/cordova-plugin-apprate.git    # AppRate
cordova plugin add http://github.com/katzer/cordova-plugin-local-notifications.git
cordova plugin add http://github.com/katzer/cordova-plugin-email-composer.git
cordova plugin add http://github.com/phonegap-build/PushPlugin.git
cordova plugin add http://github.com/EddyVerbruggen/cordova-plugin-actionsheet.git
cordova plugin add http://github.com/Telerik-Verified-Plugins/HealthKit
cordova plugin add de.appplant.cordova.plugin.badge
