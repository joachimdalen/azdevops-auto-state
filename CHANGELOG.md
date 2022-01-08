# Changelog

## 1.1.1 (2022-01-XX)

### 🛠️ Maintenance (1)

- Update azext and implement new changes
  - Changed in [PR#21 - Update azext](https://github.com/joachimdalen/azdevops-auto-state/pull/21)

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

### 💬 Other (1)

#### `rule-modal@1.1.0`

- Added helper texts to all fields
  - Pull Request: [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

### 🐛 Fixes (1)

#### `rule-modal@1.1.0`

- Fixed an issue when updating a rule where it would report it being a duplicated rule
  - Fixed in [PR#19 - Add recursive updating and rule improvements](https://github.com/joachimdalen/azdevops-auto-state/pull/19)

---

## 1.0.1 (2021-12-25)

### 🐛 Fixes (1)

#### `observer@1.0.1`

- Fixed an issue where `Children lookup` did not work properly
  - Reported in [GH#13 - "Children lookup" does not work as intended](https://github.com/joachimdalen/azdevops-auto-state/issues/13)
  - Fixed in [PR#14 - Version 1.0.1](https://github.com/joachimdalen/azdevops-auto-state/pull/14)

### 📝 Documentation (1)

#### `Core@1.0.1`

- Update links in manifest

---

## 1.0.0 (2021-12-25)

Published extension

---
