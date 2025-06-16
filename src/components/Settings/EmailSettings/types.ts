export interface SMTPSettings {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: string;
}

export interface NotificationType {
  message: string;
  type: 'success' | 'error';
}

export interface EmailLog {
  id?: string;
  email_to: string;
  email_from: string;
  subject: string;
  body: string;
  type: string;
  sent_at: string;
  status?: string;
  error_message?: string;
} 