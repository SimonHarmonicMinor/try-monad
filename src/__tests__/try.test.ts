import Try from '../index';

describe('"Try" monad test suites', () => {
  it('"success" should return successfully evaluated monad', () => {
    expect(Try.success(1).orElseThrow()).toEqual(1);
  });

  it('"error" should return failure monad', () => {
    expect(() => Try.error().orElseThrow()).toThrowError();
  });

  it('Should be evaluated lazily until terminal operation call', () => {
    const mockFunction = jest.fn();
    const tryMonad = Try.of(() => 1)
      .map((v) => {
        mockFunction();
        return v + 1;
      })
      .map((v) => {
        mockFunction();
        return v.toString();
      });
    expect(mockFunction).toHaveBeenCalledTimes(0);
    expect(tryMonad.orElse('')).not.toBeNull();
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('Should map the input and return the result value', () => {
    const tryMonad = Try.of(() => 1)
      .map((v) => v + 200)
      .map((v) => v.toString())
      .map((v) => v + 'ty');
    expect(tryMonad.orElse('wrong value')).toEqual('201ty');
  });

  it('Should map the input and return the default value', () => {
    const tryMonad = Try.of(() => 1)
      .map((v) => v + 200)
      .map((v) => v.toString())
      .map((v) => v + 'ty')
      .map<string>(() => {
        throw new Error('error');
      })
      .map((v) => v.length);
    expect(tryMonad.orElse(-10)).toEqual(-10);
  });

  it('Should flat mat the input and return the result value', () => {
    const tryMonad = Try.of(() => 1)
      .flatMap((v) => Try.success(v + 1))
      .flatMap((v) => Try.success(v.toString() + 'ui'));
    expect(tryMonad.orElse('wrong value')).toEqual('2ui');
  });

  it('Should flat mat the input and return the default value', () => {
    const tryMonad = Try.of(() => 1)
      .flatMap((v) => Try.success(v + 1))
      .flatMap<string>(() => Try.error())
      .flatMap((v) => Try.success(v.toString() + 'ui'));
    expect(tryMonad.orElse('wrong value')).toEqual('wrong value');
  });

  it('Should filter the value and return the result', () => {
    const tryMonad = Try.of(() => 'str')
      .filter((value) => value.length > 0)
      .filter((value) => value.includes('st'));
    expect(tryMonad.orElse('wrong value')).toEqual('str');
  });

  it('Should filter the value and return the default one', () => {
    const tryMonad = Try.of(() => 'str')
      .filter((value) => value.length === 5)
      .filter((value) => value.includes('st'));
    expect(tryMonad.orElse('wrong value')).toEqual('wrong value');
  });

  it('Should return the first "Try" if it succeeds', () => {
    const tryMonad = Try.of(() => 1)
      .map((value) => value + 600)
      .orElseTry(() => -1);
    expect(tryMonad.orElse(-2)).toEqual(601);
  });

  it('Should return the last "Try" if the first one fails', () => {
    const tryMonad = Try.of(() => 1)
      .map<number>(() => {
        throw new Error('error');
      })
      .orElseTry(() => -1);
    expect(tryMonad.orElse(-2)).toEqual(-1);
  });

  it('Should provide the error that led to the bug', () => {
    const bug = new Error('the error that led to the bug');
    const tryMonad = Try.of(() => 22)
      .map((value) => value + 67)
      .map<string>(() => {
        throw bug;
      });
    expect(
      tryMonad.orElseGet((error) => {
        expect(error).toStrictEqual(bug);
        return 'default string';
      })
    ).toEqual('default string');
  });

  it('Should throw the provided error if "Try" fails', () => {
    const tryMonad = Try.of(() => 22)
      .map((value) => value + 67)
      .map<string>(() => {
        throw new Error('error');
      });
    const errorToThrow = new Error('error to throw');
    expect(() => tryMonad.orElseThrow(() => errorToThrow)).toThrowError(
      errorToThrow
    );
  });
});
