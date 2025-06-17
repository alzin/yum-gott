import { DatabaseConnection } from '../database/DataBaseConnection';
import { injectable } from 'tsyringe';
 
@injectable() 
export class EmailVerificationRepository {
  constructor(private db: DatabaseConnection) {}

  async create(userId: string, email: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const query = `
      INSERT INTO email_verifications (user_id, email, verification_token, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    await this.db.query(query, [userId, email, token, expiresAt]);
  }

  async findByToken(token: string): Promise<any> {
    const query = `
      SELECT * FROM email_verifications 
      WHERE verification_token = $1 
      AND expires_at > CURRENT_TIMESTAMP 
      AND is_used = false
    `;
    const result = await this.db.query(query, [token]);
    return result.rows[0] || null;
  }

  async markAsUsed(token: string): Promise<void> {
    const query = `
      UPDATE email_verifications 
      SET is_used = true, updated_at = CURRENT_TIMESTAMP
      WHERE verification_token = $1
    `;
    await this.db.query(query, [token]);
  }
}