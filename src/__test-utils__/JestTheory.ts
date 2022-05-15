import format from 'string-format';

const _testTheory =
  (test: any) =>
  <T>(
    testNameFormat: string,
    inputData: T[],
    testFunction: (theoryData: T) => Promise<void> | void
  ) => {
    for (let idx = 0; idx < inputData.length; idx++) {
      const theory = inputData[idx];
      const testName = format(
        testNameFormat,
        Object.assign({}, theory, { $idx: idx, $no: idx + 1 })
      );

      test(testName, testFunction.bind(this, theory));
    }
  };

const testTheory = _testTheory(test);

export default testTheory;
