# Changelog

## 1.2.3 (2022-04-08)

**💡 Known issues**

This extension does not properly work when having the `New boards hub` feature enabled. This is being tracked in: [Observer does not work with 'New boards hub'](https://github.com/joachimdalen/azdevops-auto-state/issues/17)

---

### 🛠️ Maintenance (1)

- Update dependencies

---

## 1.2.2 (2022-03-14)

### 📝 Documentation (1)

- Added information about where this extension works
  - Changed needed [GH#40 - Better document which parts the extension triggers on](https://github.com/joachimdalen/azdevops-auto-state/issues/40)
  - Changed in [PR#41 - Added docs about where this extension works](https://github.com/joachimdalen/azdevops-auto-state/pull/41)

---

## 1.2.1 (2022-02-16)

### 🛠️ Maintenance (1)

- Update dependencies to fix [CVE-2022-0536](https://github.com/advisories/GHSA-pw2r-vq6v-hr8c)
  - Changed in [PR#37 - Update dependencies](https://github.com/joachimdalen/azdevops-auto-state/pull/37)

### 📝 Documentation (1)

- Clarified activation of AutoState from feature flag
  - Changed needed [GH#35 - Auto state entry doesn't appear under the preview features](https://github.com/joachimdalen/azdevops-auto-state/issues/35)
  - Changed in [PR#36 - docs: Clarify where to find feature toggle](https://github.com/joachimdalen/azdevops-auto-state/pull/36)

## 🌟 Contributors

Thank you to the following for contributing to the latest release

- [@SteeveDess](https://github.com/SteeveDess)

---

## 1.2.0 (2022-01-22)

**💡 Known issues**

This extension does not properly work when having the `New boards hub` feature enabled. This is being tracked in: [Observer does not work with 'New boards hub'](https://github.com/joachimdalen/azdevops-auto-state/issues/17)

---

### 🛠️ Maintenance (2)

- Update azext and implement new changes

  - Changed in [PR#21 - Update azext](https://github.com/joachimdalen/azdevops-auto-state/pull/21)

- Update dependencies

### 🚀 Features (3)

- Added preset rules

  - Suggested in [GH#24 - Add option to create default rules based on the default processes](https://github.com/joachimdalen/azdevops-auto-state/issues/24)
  - Added in [PR#29 - Add preset rules](https://github.com/joachimdalen/azdevops-auto-state/pull/29)

- Added the ability to disable rules

  - Suggested in [GH#22 - Add ability to disable rule](https://github.com/joachimdalen/azdevops-auto-state/issues/22)
  - Added in [PR#26 - Add ability to disable rules](https://github.com/joachimdalen/azdevops-auto-state/pull/26)

- Add setting to be able to scope work item types to current process
  - Suggested in [GH#23 - Add setting to be able to limit work item types to current process](https://github.com/joachimdalen/azdevops-auto-state/issues/23)
  - Added in [PR#27 - Add settings module](https://github.com/joachimdalen/azdevops-auto-state/pull/27)

## 📦 Module changes

### 🐛 Fixes (2)

#### `rule-modal@1.2.0`

- Fixed UI showing/flashing before loading was completed

- Fix work item type dropdown not being disabled in edit view. Changing work item type is not supported
  - Reported in [GH#30 - Disable work item type after rule creation](https://github.com/joachimdalen/azdevops-auto-state/issues/30)
  - Fixed in [PR#31 - Disable work item type in edit](https://github.com/joachimdalen/azdevops-auto-state/pull/31)

### 📣 Enhancements (1)

#### `rule-modal@1.2.0`

- Added labels to toggle states to indicate the current state
  - Improved in [PR#27 - Add settings module](https://github.com/joachimdalen/azdevops-auto-state/pull/27)

---

## 1.1.0 (2022-01-05)

### 🛠️ Maintenance (2)

- Refactor build setup to reduce file sizes

  - Changed in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

- Updated dependencies
  - Changed in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

### 🚀 Features (2)

- Added support for recursive updating of parents

  - Suggested in [GH#1 - Allow recursive update of parents](https://github.com/joachimdalen/azdevops-auto-state/issues/1)
  - Added in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

- Added `Rule tester` to perform a dry run of rules. See [rule tester docs](https://github.com/joachimdalen/azdevops-auto-state/blob/master/docs/index.md#testing-rules) for more information on usage.
  - Suggested in [GH#18 - Add the ability to run 'What if' tests on rules](https://github.com/joachimdalen/azdevops-auto-state/issues/18)
  - Added in [PR#20 - Add rule tester to perform dry run of rules](https://github.com/joachimdalen/azdevops-auto-state/pull/20)

## 📦 Module changes

### 🚀 Features (1)

#### `rule-modal@1.1.0`

- Replaced modal with panels for better UX
  - Added in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

### 🐛 Fixes (1)

#### `rule-modal@1.1.0`

- Fixed an issue when updating a rule where it would report it being a duplicated rule
  - Fixed in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

### 💬 Other (1)

#### `rule-modal@1.1.0`

- Added helper texts to all fields
  - Pull Request: [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

---

## 1.0.1 (2021-12-25)

### 📝 Documentation (1)

#### `Core@1.0.1`

- Update links in manifest

### 🐛 Fixes (1)

#### `observer@1.0.1`

- Fixed an issue where `Children lookup` did not work properly
  - Reported in [GH#13 - "Children lookup" does not work as intended](https://github.com/joachimdalen/azdevops-auto-state/issues/13)
  - Fixed in [PR#14 - Version 1.0.1](https://github.com/joachimdalen/azdevops-auto-state/pull/14)

---

## 1.0.0 (2021-12-25)

**✏️ Release summary**

Published extension

---

---
