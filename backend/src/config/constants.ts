export const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

export const API_PORT = process.env.PORT || 5000;

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const ADMIN_ROLES = ['admin', 'super_admin', 'admin_content'];

export const USER_ROLES = ['candidate', 'company'];

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  UPLOAD_DIR: 'uploads',
};

export const JOB_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

export const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

export const SECTORS = [
  'IT', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing',
  'Transportation', 'Telecommunications', 'Hospitality', 'Other'
];

export const LOCATIONS = ['Local', 'Remote', 'Hybrid'];

export const FORMATION_STATUS = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
