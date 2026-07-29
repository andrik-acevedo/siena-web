// Admin configuration
const ADMIN_EMAILS = [
  'admin@lovediscovery.org',
  // Add more admin emails here
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function promoteToAdminIfEligible(email: string): Promise<boolean> {
  return isAdminEmail(email);
}