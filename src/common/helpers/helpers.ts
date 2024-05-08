import { TransformFnParams } from 'class-transformer';
import { extname } from 'path';

export const getAwsKey = (value: string): string => {
  const parts = value?.split('dev.s3.amazonaws.com/');

  return parts?.[1];
};

export const buildKeyName = (
  rootFolder: string,
  file: Express.Multer.File,
): string => {
  const fileExtName = !file.mimetype.startsWith('image')
    ? extname(file.originalname)
    : '.jpeg';

  const randomName = generateRandomName();

  return `${rootFolder}/${randomName}${fileExtName}`;
};

export const generateRandomName = (): string => {
  return Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
};

export const transformValueToArray = <T>({ value }: TransformFnParams): T[] => {
  return Array.isArray(value) ? value : [value];
};

export const generateRandomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const queryParamToBoolean = (value): boolean => {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }
};
