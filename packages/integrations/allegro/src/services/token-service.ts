import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../../../config.json');

type Config = {
   refreshToken: string;
   accessToken: string;
};

export function getRefreshToken(): string | null {
   const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Pick<
      Config,
      'refreshToken'
   >;

   return config.refreshToken ? config.refreshToken : null;
}

export function getAccessToken(): string | null {
   const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Pick<
      Config,
      'accessToken'
   >;

   return config.accessToken ? config.accessToken : null;
}

export function saveRefreshToken(refreshToken: string) {
   const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Pick<
      Config,
      'refreshToken'
   >;

   config.refreshToken = refreshToken;

   fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}

export function saveAccessToken(accessToken: string) {
   const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Pick<
      Config,
      'accessToken'
   >;

   config.accessToken = accessToken;

   fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}
