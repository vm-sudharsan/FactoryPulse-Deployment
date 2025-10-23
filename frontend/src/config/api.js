/**
 * API Configuration
 * Centralized API URL management for all environments
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default API_URL;
