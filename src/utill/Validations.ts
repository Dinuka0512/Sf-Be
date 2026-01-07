export const isName = (value: string): boolean =>
  /^[A-Za-z ]{2,50}$/.test(value);

export const isEmail = (value: string): boolean =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

export const isMobile = (value: string): boolean =>
  /^(?:\+94|0)7\d{8}$/.test(value); // Sri Lanka format

export const isString = (value: string): boolean =>
  /^[A-Za-z0-9 ,.'"-]{1,}$/.test(value);

export const isInt = (value: string): boolean =>
  /^[+-]?\d+$/.test(value);

export const isDecimal = (value: string): boolean =>
  /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value);

export const isSimplePassword = (value: string): boolean => {
  return /^.{6,}$/.test(value);
};