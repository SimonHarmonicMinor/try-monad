export class Try<T> {
  private readonly supplier: () => T;

  private constructor(supplier: () => T) {
    this.supplier = supplier;
  }

  public static of<T>(supplier: () => T): Try<T> {
    return new Try<T>(supplier);
  }

  public static success<T>(value: T): Try<T> {
    return new Try<T>(() => value);
  }

  public static error<T>(exception?: Error): Try<T> {
    return new Try<T>(() => {
      if (exception) {
        throw exception;
      }
      throw new Error('Try is empty');
    });
  }

  public map<U>(mapper: (value: T) => U): Try<U> {
    return new Try<U>(() => mapper(this.supplier()));
  }

  public flatMap<U>(mapper: (value: T) => Try<U>): Try<U> {
    return new Try<U>(() => mapper(this.supplier()).orElseThrow());
  }

  public filter(predicate: (value: T) => boolean): Try<T> {
    return new Try<T>(() => {
      const value = this.supplier();
      if (predicate(value)) {
        return value;
      }
      throw new Error('Predicate returned false');
    });
  }

  public orElseTry(elseCondition: () => T): Try<T> {
    return new Try<T>(() => {
      try {
        return this.supplier();
      } catch {
        return elseCondition();
      }
    });
  }

  public orElse(value: T): T {
    try {
      return this.supplier();
    } catch {
      return value;
    }
  }

  public orElseGet(elseValueSupplier: (error: unknown) => T): T {
    try {
      return this.supplier();
    } catch (error) {
      return elseValueSupplier(error);
    }
  }

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
