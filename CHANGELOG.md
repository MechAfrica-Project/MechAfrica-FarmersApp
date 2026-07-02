# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/compare/v1.1.2...v1.2.0) (2026-07-02)


### Features

* add reset method to farmerStore and clean up redundant requestStore definition ([d7ff3b1](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/d7ff3b130f3e3082e0d4abce4452d40aa3654383))
* display gender-specific welcome illustration based on farmer profile data ([83cb59a](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/83cb59a434f4f7c32f2c3ed00bf0e94b6f993b22))
* implement farm validation and UI enhancements for add and edit modals ([b3207a6](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/b3207a69e43d8ee330f0d1542c83d1f01e608bae))
* improve error handling and feedback with enhanced UI styling and offline state management across verification and request screens. ([a0f9288](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/a0f928835aeb5337ab6d7f352016bef4cab1661a))


### Bug Fixes

* remove redundant key props from DateTimePicker and update tsconfig compiler options ([f8872fd](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/f8872fd1898512537ea4f6ae8300ff54a40d42c9))
* render DateTimePicker natively on Android and update modal styling to rounded-xl ([96eb544](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/96eb5447cff4d38a47f4f5d7580c15fd917a23cc))


### Refactoring

* enhance CustomToast and ErrorBoundary UI with blur effects, refined typography, and improved error messaging ([bdcedfe](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/bdcedfe6ff496ab1db1fa652571bdc0840363f47))
* update navigation import from @react-navigation/native to expo-router ([3987b9d](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/3987b9d527bfe9dfaecb6bd8a850621c0a6f5c29))

### [1.1.3](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/compare/v1.1.2...v1.1.3) (2026-05-23)

### [1.1.2](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/compare/v1.1.1...v1.1.2) (2026-05-23)

### [1.1.1](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/compare/v1.1.0...v1.1.1) (2026-05-23)

## 1.1.0 (2026-05-23)


### Features

* Add `updateRequestDetails` action to modify request comments and voice notes, including voice note file uploads. ([cadf147](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/cadf1477d75034b0aa00a38d8946e37147095c5d))
* add ADI registration plugin and configure service account credentials for Android build integration ([22d45ed](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/22d45ed1f207a6807592c358d4a3608c1443b355))
* Add audio auto-rewind functionality, display recorded voice notes in the UI, and introduce an inline edit button for farmer text messages with updated styling. ([2f38aee](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/2f38aeeabdea50c8fd74a99fd7629ea1cb70bd19))
* display recorded voice notes for preview in request details and add auto-rewind to audio playback. ([be7e592](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/be7e592bdc105931dbef4c2343e045ddcac11dff))
* Enable editing of pending request messages and voice notes, and improve backend data mapping for request objects. ([b7d7876](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/b7d7876917e0f9718a863981dc3a8883081f6a84))
* enable international phone number selection and add ErrorBoundary component ([6f5a011](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/6f5a011a43c6cd74501a199da9a7dbdc589c0787))
* Enable voice note pre-upload for requests and conditionally display audio messages. ([27ec31f](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/27ec31f4adae575de100d817901623a4082ed439))
* enhance OTP payload compatibility by including multiple key variants for phone and verification code ([50ab2f1](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/50ab2f15f56c47687e6549b1310b625f0c200910))
* enhance profile picture upload functionality and integrate API for requests management ([eb125a9](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/eb125a9719b14662e604e5db43b772fffbf3d597))
* enhance request mapping to handle API response envelopes and camelCase voice note URLs. ([fe7585a](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/fe7585abe15ee764130d1e0fae965b643ddb9bfc))
* implement app update check hook and configure expo-updates for OTA and store version management ([d724082](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/d724082ff0117bb91ae5240e4b72daf6b7385046))
* Implement app update mechanism with modal UI and EAS configuration. ([de890ee](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/de890ee84b83bb789c55922afe4ba3905d7ab7fd))
* implement background data synchronization on user authentication and remove dummy data ([5f55379](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/5f5537933141da37c4cd2b6f3e487d100672bf73))
* Implement global authentication routing and enhance user data loading during session restoration. ([9284387](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/9284387e9288b7790473b5915fd3f89bfe428122))
* implement phone verification step with OTP functionality and cooldown management ([fc25a4c](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/fc25a4cce9424e5054e2217e57f4b986366812e8))
* implement router state debugging overlay and enhance auth navigation handling ([f57bfc0](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/f57bfc0b61b9c83d50360767b91ac506eb14a6f0))
* improve data extraction logic for farmer name and farm location by adding fallback sources. ([304a56f](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/304a56fbd5220db38228d11195249c3b3083f1bf))
* Integrate push notifications and refactor notification components and store logic. ([bb738c3](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/bb738c3f9688fe66a7e812136ef13e2dd83ccfef))
* Migrate to pnpm, refactor audio playback with `expo-audio` hooks, update request store data synchronization, and standardize imports with path aliases. ([295da0f](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/295da0ff916df89904d254a7988751cbce3dfd71))
* migrate to react-native-toast-notifications and implement toast notifications across the app ([3fad9bb](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/3fad9bb089fa53a8f4f0c36db4f92fc079fe72ac))
* **tests:** add Jest configuration and initial test setup ([bf66203](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/bf662039229ce6d2148f359a1227c0e5cb196709))


### Bug Fixes

* simplify error handling in sendPhone function and ensure consistent button press behavior ([572a4a7](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/572a4a747562096a361d27ef53209dbcd3a1c358))
* update logo asset path and remove redundant whitespace in UpdateRequiredModal ([b2b7067](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/b2b70674d441c4fae47accb5f92d1b19d1d945ba))


### Refactoring

* enhance date handling in FarmerDetails and ServiceDateTimePicker, add debugging for iOS picker events ([e36e7c8](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/e36e7c830e443ab573678c238f2175dffaccb4c4))
* integrate UI store for service and farm management, enhance service flow handling ([dc2c3c3](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/dc2c3c39b52f76ff74bbceabe7ca1eb7792b4241))
* reorganize imports and enhance code structure across multiple components ([21aae0a](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/21aae0ac12ec4cf87641d49374a94a71657e438d))
* replace CustomToastTW with CustomToast component and enhance toast functionality ([6deae38](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/6deae384a3d268c364ea2416c64776d2073278de))


### Styling

* apply eslint --fix and reorder imports in jest.setup.ts ([a99597c](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/a99597c0d233c923e02362f6b035526308171308))
* replace eslint-env with global and suppress require warnings ([154b4dc](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/154b4dc7091ff99da7cf021e07a24f4df05ec45f))
* resolve all ESLint warnings and errors for CI ([dd149eb](https://github.com/MechAfrica-Project/MechAfrica-FarmersApp/commit/dd149eb314da764093b077cbb9d7b07fcb373733))
