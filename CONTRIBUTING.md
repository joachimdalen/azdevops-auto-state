# Contribution guidelines

If you are reading this I'm guessing you have considered to contribute to AutoState. Contributions are welcome, but if you wish to make major changes please submit an issue so we can have a discussion first.

## 💻 Branching

All development work should be based off `master`.

- `feature/` - Adding a new feature or changing existing features
- `bugfix/` - Fixing an issue in existing templates

If you are working on a change related to an issue, please start your branch name with the issue number (e.g `feature/111-new-feature`).

### Commits

We try to follow conventional commits

These are the valid scopes for AutoState:

- `core`: Changes to core files, such as manifests
- `docs`: Updates to documentation
- `ci`: Changes to build files and scripts
- `admin-hub`: Changes to the admin hub
- `rule-modal`: Changes to the rule editor/modal
- `rule-tester`: Changes to the rule tester
- `rule-tester-action`: Changes to the rule tester action
- `observer`: Changes to the work item observer
- `styles`: Changes to only styling

## 📂 Folder structure

- Shared templates should be located in the `common` folder - that is, files that are used more than once in this repository.
- Files should not have depencies outside it's own folder and `common` - that is, the folder and `common` can be copied to a different place without breaking

## ✏️ Naming strategry

- All filenames should only contain the characters `a-z`, `A-Z`, `-` and `.`

## 🚀 Pipelines

- Pipeline files should follow the structure `[area]-pipeline.yml`
- Partial pipelines files should follow the structure `[area].template.yml`
- Pipeline trigger should be scoped to the current area folder

## Changelog

- When doing changes - the changelog (`docs/changelog-prod.json`) must be updated
