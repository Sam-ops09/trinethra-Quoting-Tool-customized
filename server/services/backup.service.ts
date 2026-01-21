
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { logger } from '../utils/logger';

export class BackupService {
  private static BACKUP_DIR = path.join(process.cwd(), 'backups');
  private static RETENTION_DAYS = 7;

  static initialize() {
    // Ensure backup directory exists
    try {
        if (!fs.existsSync(this.BACKUP_DIR)) {
            fs.mkdirSync(this.BACKUP_DIR);
        }

        // Schedule daily backup at 2:00 AM
        cron.schedule('0 2 * * *', () => {
            logger.info('Starting scheduled database backup...');
            this.createBackup().catch(err => logger.error('Scheduled backup failed:', err));
        });

        logger.info('Backup service initialized (Schedule: Daily at 2:00 AM)');
    } catch (error) {
        logger.error('Failed to initialize backup service:', error);
    }
  }

  static async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.BACKUP_DIR, filename);

    // Get database connection string from env
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      const error = 'DATABASE_URL not found. Cannot create backup.';
      // logger.error(error); // logger.error prints to console
      throw new Error(error);
    }

    // Construct pg_dump command
    // Note: We use the connection string directly
    const command = `pg_dump "${dbUrl}" -f "${filepath}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // logger.error('Backup failed:', error);
          reject(error);
          return;
        }

        logger.info(`Backup created successfully: ${filename}`);
        this.cleanOldBackups();
        resolve(filename);
      });
    });
  }

  private static cleanOldBackups() {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) return;
      
      const files = fs.readdirSync(this.BACKUP_DIR);
      const now = Date.now();
      const retentionMs = this.RETENTION_DAYS * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        if (!file.endsWith('.sql')) return;
        
        const filepath = path.join(this.BACKUP_DIR, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtime.getTime() > retentionMs) {
          fs.unlinkSync(filepath);
          logger.info(`Deleted old backup: ${file}`);
        }
      });
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }

  static listBackups(): { name: string, size: number, date: Date }[] {
    try {
        if (!fs.existsSync(this.BACKUP_DIR)) return [];
        return fs.readdirSync(this.BACKUP_DIR)
            .filter(f => f.endsWith('.sql'))
            .map(file => {
                const stats = fs.statSync(path.join(this.BACKUP_DIR, file));
                return {
                    name: file,
                    size: stats.size,
                    date: stats.mtime
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (e) {
        return [];
    }
  }
}
