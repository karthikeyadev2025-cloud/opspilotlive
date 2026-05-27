import { supabase } from './supabase';

function getDeviceInfo(): { userAgent: string; deviceInfo: string; locationHint: string } {
  const ua = navigator.userAgent;
  let deviceInfo = 'Desktop';
  if (/Mobile|Android|iPhone|iPad/.test(ua)) deviceInfo = /iPad/.test(ua) ? 'Tablet' : 'Mobile';
  const locationHint = `${Intl.DateTimeFormat().resolvedOptions().timeZone} / ${navigator.language}`;
  return { userAgent: ua.slice(0, 500), deviceInfo, locationHint };
}

export function logLogin(params: {
  userId?: string;
  email: string;
  fullName?: string;
  role?: string;
  success: boolean;
  failureReason?: string;
  sessionId?: string;
}): void {
  const { userAgent, deviceInfo, locationHint } = getDeviceInfo();
  supabase.from('login_logs').insert({
    user_id: params.userId || null,
    email: params.email,
    full_name: params.fullName || '',
    role: params.role || '',
    event_type: params.success ? 'login_success' : 'login_failed',
    user_agent: userAgent,
    device_info: deviceInfo,
    location_hint: locationHint,
    failure_reason: params.failureReason || '',
    session_id: params.sessionId || '',
  }).then(() => {}).catch(() => {});
}

export function logLogout(params: {
  userId: string;
  email: string;
  fullName?: string;
  role?: string;
}): void {
  const { userAgent, deviceInfo, locationHint } = getDeviceInfo();
  supabase.from('login_logs').insert({
    user_id: params.userId,
    email: params.email,
    full_name: params.fullName || '',
    role: params.role || '',
    event_type: 'logout',
    user_agent: userAgent,
    device_info: deviceInfo,
    location_hint: locationHint,
  }).then(() => {}).catch(() => {});
}

export function logAccountDisabled(params: {
  userId: string;
  email: string;
  fullName?: string;
  role?: string;
}): void {
  const { userAgent, deviceInfo, locationHint } = getDeviceInfo();
  supabase.from('login_logs').insert({
    user_id: params.userId,
    email: params.email,
    full_name: params.fullName || '',
    role: params.role || '',
    event_type: 'account_disabled',
    user_agent: userAgent,
    device_info: deviceInfo,
    location_hint: locationHint,
    failure_reason: 'Account is disabled',
  }).then(() => {}).catch(() => {});
}

export function logDataAccess(params: {
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  tableName: string;
  recordCount?: number;
  filtersApplied?: string;
  notes?: string;
}): void {
  supabase.from('data_access_logs').insert({
    user_id: params.userId,
    user_email: params.userEmail,
    user_role: params.userRole,
    action: params.action,
    table_name: params.tableName,
    record_count: params.recordCount || 0,
    filters_applied: params.filtersApplied || '',
    notes: params.notes || '',
  }).then(() => {}).catch(() => {});
}
