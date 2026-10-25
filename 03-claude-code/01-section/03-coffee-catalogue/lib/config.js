import path from "node:path";

// if we provide environmental variable from terminal it will be used otherwise data.
export const DATA_DIR = path.resolve(
  process.env.DATA_DIR || 'data'
);

export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || 'uploads'
);
