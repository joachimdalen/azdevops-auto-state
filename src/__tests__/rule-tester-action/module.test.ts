import { mockInit, mockReady, mockRegister } from '../../__mocks__/azure-devops-extension-sdk';

describe('rule-tester-action > module', () => {
  it('should register menu provider', () => {
    expect.assertions(3);
    mockInit.mockResolvedValue('');
    mockReady.mockResolvedValue('');
    mockRegister.mockImplementation(instanceId => {
      expect(instanceId).toEqual('rule-tester-action');
    });

    require('../../rule-tester-action/module');

    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockReady).toHaveBeenCalledTimes(1);
  });
});
