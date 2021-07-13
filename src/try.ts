/**
 * The monad encapsulates the function that might fail.
 * In case of exception occurring, the monad suppresses it and provides
 * the API to retrieve the result value safely.
 * `Try` acts lazily. So, all methods build a pipeline of execution.
 * Methods `orElse`, `orElseGet`, and `orElseThrow` trigger it.
 */
export class Try<T> {
  private readonly supplier: () => T;

  private constructor(supplier: () => T) {
    this.supplier = supplier;
  }

  /**
   * Creates the new monad from the given function.
   *
   * @param supplier - function that can provide the value or fail
   * @returns the new monad
   */
  public static of<T>(supplier: () => T): Try<T> {
    return new Try<T>(supplier);
  }

  /**
   * Creates the new monad that always succeeds.
   *
   * @param value - value that is stored within the monad
   * @returns the new succeeded monad
   */
  public static success<T>(value: T): Try<T> {
    return new Try<T>(() => value);
  }

  /**
   * Creates the new monad that always fails.
   *
   * @param exception - the error that is associated with the monad, might absent
   * @see {@link orElseThrow}
   */
  public static error<T>(exception?: Error): Try<T> {
    return new Try<T>(() => {
      if (exception) {
        throw exception;
      }
      throw new Error('Try is empty');
    });
  }

  /**
   * Maps the monad value to the new one.
   *
   * @param mapper - value mapper
   * @returns the new monad with mapped value
   */
  public map<U>(mapper: (value: T) => U): Try<U> {
    return new Try<U>(() => mapper(this.supplier()));
  }

  /**
   * Maps the monad value to the new one returned by the other `Try`.
   *
   * @param mapper - mapper that provides the other `Try` monad
   * @returns the new monad with the mapped value
   */
  public flatMap<U>(mapper: (value: T) => Try<U>): Try<U> {
    return new Try<U>(() => mapper(this.supplier()).orElseThrow());
  }

  /**
   * Applies the filtering function to the monad value.
   * If the filtering passes, return the current monad.
   * Otherwise returns the failed one.
   *
   * @param predicate - filtering predicate
   * @returns the current monad or the failed one
   */
  public filter(predicate: (value: T) => boolean): Try<T> {
    return new Try<T>(() => {
      const value = this.supplier();
      if (predicate(value)) {
        return value;
      }
      throw new Error('Predicate returned false');
    });
  }

  /**
   * If the monad value execution fails,
   * creates a new one from the provided `elseCondition`.
   * If the monad value execution does not fail, simply returns it.
   *
   * @param elseCondition - the source for the new monad in case of failure
   * @returns the current monad or the one built from `elseCondition`
   */
  public orElseTry(elseCondition: () => T): Try<T> {
    return new Try<T>(() => {
      try {
        return this.supplier();
      } catch {
        return elseCondition();
      }
    });
  }

  /**
   * Calculates the value and returns it.
   * If the calculation fails, returns the default value.
   *
   * @remarks
   * This is a terminal operation.
   *
   * @param value - the default value
   * @returns the calculated value or the default one
   */
  public orElse(value: T): T {
    try {
      return this.supplier();
    } catch {
      return value;
    }
  }

  /**
   * Calculates the value and returns it.
   * If the calculation fails, returns the one provided by `elseValueSupplier`.
   *
   * @remarks
   * This is a terminal operation.
   *
   * @param elseValueSupplier - returns the default value
   * and accepts the error that occurred as a parameter
   * @returns the calculated value or the default one
   */
  public orElseGet(elseValueSupplier: (error: unknown) => T): T {
    try {
      return this.supplier();
    } catch (error) {
      return elseValueSupplier(error);
    }
  }

  /**
   * Calculates the values and returns it.
   * If the calculation fails, throws an exception provided by `errorSupplier`.
   * If `errorSupplier` is `undefined`, just throws the one that occurred.
   *
   * @remarks
   * This is a terminal operation.
   *
   * @param errorSupplier - error supplier
   * @returns the calculated value
   * @throws error in case of calculation issues
   */
  public orElseThrow(errorSupplier?: () => Error): T {
    try {
      return this.supplier();
    } catch (error) {
      if (errorSupplier) {
        throw errorSupplier();
      }
      throw error;
    }
  }
}
