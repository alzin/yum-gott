"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationRepository = void 0;
// src/infrastructure/repositories/EmailVerificationRepository.ts
const DataBaseConnection_1 = require("../database/DataBaseConnection");
const tsyringe_1 = require("tsyringe");
let EmailVerificationRepository = class EmailVerificationRepository {
    constructor(db) {
        this.db = db;
    }
    async create(userId, email, token) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const query = `
      INSERT INTO email_verifications (user_id, email, verification_token, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
        await this.db.query(query, [userId, email, token, expiresAt]);
    }
    async findByToken(token) {
        const query = `
      SELECT * FROM email_verifications 
      WHERE verification_token = $1 
      AND expires_at > CURRENT_TIMESTAMP 
      AND is_used = false
    `;
        const result = await this.db.query(query, [token]);
        return result.rows[0] || null;
    }
    async markAsUsed(token) {
        const query = `
      UPDATE email_verifications 
      SET is_used = true, updated_at = CURRENT_TIMESTAMP
      WHERE verification_token = $1
    `;
        await this.db.query(query, [token]);
    }
};
exports.EmailVerificationRepository = EmailVerificationRepository;
exports.EmailVerificationRepository = EmailVerificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [DataBaseConnection_1.DatabaseConnection])
], EmailVerificationRepository);
