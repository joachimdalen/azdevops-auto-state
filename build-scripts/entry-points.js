const modules = [
  {
    name: 'observer',
    entry: './src/observer/module',
    root: 'observer-container',
    generate: true
  },
  {
    name: 'admin-hub',
    entry: './src/admin-hub/module',
    root: 'admin-hub-container',
    generate: true
  },
  {
    name: 'rule-modal',
    entry: './src/rule-modal/module',
    root: 'modal-container',
    generate: true
  },
  {
    name: 'rule-tester',
    entry: './src/rule-tester/module',
    root: 'rule-tester-container',
    generate: true
  },
  {
    name: 'rule-tester-action',
    entry: './src/rule-tester-action/module',
    root: 'rule-tester-action-container',
    generate: true
  }
];

const entries = modules.reduce(
  (obj, item) => ({
    ...obj,
    [item.name]: item.entry
  }),
  {}
);

module.exports = {
  modules,
  entries
};
